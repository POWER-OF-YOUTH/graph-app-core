const neo4j = require('neo4j-driver');
const uuid = require('uuid').v4;

const Property = require('./property');

// Necessary nodes
/**
 * CREATE (type:Type) SET type = {name: Number, defaultValue: 0}
 * CREATE (type:Type) SET type = {name: String, defaultValue: ""}
 */
//

// Neo4j database constraints
/**
 * CREATE CONSTRAINT unique_graph_id ON (graph:Graph) ASSERT graph.id IS UNIQUE
 * CREATE CONSTRAINT unique_class_in_graph ON (class:Class) ASSERT class._unique_key IS UNIQUE
 * CREATE CONSTRAINT unique_property_in_class ON (property:Property) ASSERT property._unique_key IS UNIQUE
 */
//

// Neo4j database indexes
/**
 * CREATE INDEX node_id FOR (node:Node) ON (node.id) 
 */
//

class Core {
    /**
     * 
     * @param {String} hostname Hostname
     * @param {String} user Database username
     * @param {String} password User password
     */
    constructor(hostname, user, password) {
        this._driver = neo4j.driver(hostname, neo4j.auth.basic(user, password), { disableLosslessIntegers: true });
    }

    /**
     * 
     * @param {String} name Graph name
     * @returns {Promise<{name: String, created: Date}>} Graph description
     */
    async createGraph(name) {
        try {
            let session = this._driver.session();

            var graphDescription = {id: uuid(), name, date: Date.now() }; // Contains a description of the graph that will be returned to the user

            await session.run(`
                CREATE (graph:Graph) 
                SET graph = {id: $id, name: $name, created: $date }
            `, {id: graphDescription.id, name: graphDescription.name, date: graphDescription.date });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }

        return graphDescription;
    }

    /**
     * 
     * @param {String} id Graph id
     * @returns {Promise} 
     */
    async deleteGraph(id) {
        try {
            let session = this._driver.session();
            
            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]->(property:Property)
                MATCH (graph)-[:CONTAINS]->(node:Node)
                WHERE graph.id = $id 
                DETACH DELETE node, property, class, graph
            `, { id });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Name of the graph to add the class to 
     * @param {String} className Class name
     * @param {Array<Property>} properties Class properties
     * @returns {Promise<{name: String, properties: Array<{name: String, type: String}>>}
     */
    async createClass(graphId, className, properties) {
        try {
            let session = this._driver.session();

            var classDescription = { name: className, properties: properties.map(p => { return { name: p.getName(), type: p.getType() }})}  // Contains the class description that will be returned to the user

            await session.writeTransaction(tx => {
                tx.run(`
                    MATCH (graph:Graph) WHERE graph.id = $graphId 
                    CREATE (class:Class) 
                    SET class = { name: $className, _unique_key: id(graph) + "_" + $className }
                    MERGE (graph)-[:CONTAINS]->(class)
                    FOREACH (property IN $properties | 
                        CREATE (p:Property) 
                        SET p = { name: property.name, type: property.type, _unique_key: id(class) + "_" + property.name } 
                        MERGE (class)-[:HAVE]->(p))
                `, { graphId, className: classDescription.name, properties: classDescription.properties });
                tx.run(`
                    MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]->(property:Property) 
                    WHERE graph.id = $graphId AND class.name = $className
                    MATCH (type:Type) WHERE type.name = property.type
                    MERGE (property)-[:INSTANCE_OF]->(type)
                `, { graphId, className: classDescription.name });
            });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }

        return classDescription;
    }

    /**
     * 
     * @param {String} graphId Id of the graph to delete class from 
     * @param {String} className Class name
     * @returns {Promise}
     */
    async deleteClass(graphId, className) {
        try {
            let session = this._driver.session();
            
            // Checking for implementing nodes
            let implementedNodesResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                MATCH (node:Node)-(:REALIZE)->(class)
                RETURN node LIMIT 1
            `, { graphId, className });
            if (implementedNodesResponse.records.length > 0)
                throw new Error();

            await session.run(`
                MATCH (graph:Graph)-[CONTAINS]-(class:Class)-[:HAVE]->(property:Property) 
                WHERE graph.id = $graphId AND class.name = $className 
                DETACH DELETE property, class
            `, { graphId, className });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph name
     * @param {String} className Class name
     * @returns {Promise<{id: String, any}>}
     */
    async createNode(graphId, className) {
        try {
            let session = this._driver.session();

            var nodeDescription = {}; // Contains a description of the node that will be returned to the user

            let dbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                WHERE graph.id = $graphId AND class.name = $className
                RETURN property, type
            `, { graphId, className })

            let nodeData = { id: uuid() }; // Contains a description of the node that will be sent to the database
            nodeDescription.id = nodeData.id;

            dbResponse.records.forEach((record, i, dbResponse) => {
                let propertyName = record.get("property").properties.name;
                let propertyType = record.get("property").properties.type;
                let defaultValue = record.get("type").properties.defaultValue;

                nodeData[propertyName] = defaultValue;

                nodeDescription[propertyName] = {
                    value: defaultValue,
                    type: propertyType
                };
            });

            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]->(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                CREATE (node:Node)
                SET node = $nodeData
                MERGE (graph)-[:CONTAINS]->(node)
                MERGE (node)-[:REALIZE]->(class)
            `, { graphId, className, nodeData})

            session.close();
        }
        catch (err) {
            console.log(err);
            throw new Error("Database error!");
        }

        return nodeDescription;
    }

    /**
     * 
     * @param {String} graphId Graph name
     * @param {String} nodeId Node id
     * @returns {Promise} 
     */
    async deleteNode(graphId, nodeId) {
        try {
            let session = this._driver.session();
            
            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]->(node:Node) 
                WHERE node.id = $nodeId AND graph.id = $graphId
                DETACH DELETE node
            `, { nodeId, graphId });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }
}

module.exports = Core;