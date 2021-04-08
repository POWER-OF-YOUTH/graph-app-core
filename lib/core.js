const neo4j = require('neo4j-driver');
const uuid = require('uuid').v4;

const Property = require('./property');

// Necessary nodes
/**
 * CREATE (type:Type) SET type = {name: "Number", defaultValue: 0}
 * CREATE (type:Type) SET type = {name: "String", defaultValue: ""}
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
     * @returns {Promise<Array<{name: String, defaultValue: any}>>} Types descriptions
     */
    async getTypes() {
        try {
            let session = this._driver.session();

            let dbResponse = await session.run(`MATCH (type:Type) RETURN properties(type) AS description`);

            let typesDescription = dbResponse.records.map(record => record.get("description"));

            session.close();

            return typesDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} name Graph name
     * @returns {Promise<{id: String, name: String, created: Date}>} Graph description
     */
    async createGraph(name) {
        try {
            let session = this._driver.session();

            let graphDescription = {id: uuid(), name, date: Date.now() }; // Contains a description of the graph that will be returned to the user

            await session.run(`
                CREATE (graph:Graph) 
                SET graph = {id: $id, name: $name, created: $date }
            `, {id: graphDescription.id, name: graphDescription.name, date: graphDescription.date });

            session.close();

            return graphDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }
    
    /**
     * 
     * @param {String} graphId Graph id
     * @returns {Promise<{id: String, name: String, created: Date, nodes: Array<{id: String, values: Array<{name: String, type: String, value: any}>}>, classes: Array<{name: String, properties: Array<{name: String, type: String}>}>}>}
     */
    async getGraph(graphId) {
        try {
            let session = this._driver.session();

            let graphDescription = {};

            let dbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                WHERE graph.id = $graphId
                RETURN { id: graph.id, name: graph.name, created: graph.created }
                AS description
            `, { graphId });

            if(dbResponse.records.length === 0)
                return {};

            graphDescription = dbResponse.records[0].get("description")

            dbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                WHERE graph.id = $graphId
                RETURN { id: node.id, values: collect(properties(value)) }
                AS description
            `, { graphId });

            graphDescription.nodes = dbResponse.records.map(record => record.get("description"));

            dbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                WHERE graph.id = $graphId
                RETURN { name: class.name, properties: collect({name: property.name, type: type.name}) }
                AS description
            `, { graphId });

            graphDescription.classes = dbResponse.records.map(record => record.get("description"));

            session.close();

            return graphDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} id Graph id
     * @returns {Promise<{}>} 
     */
    async deleteGraph(id) {
        try {
            let session = this._driver.session();
            
            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]->(property:Property)
                MATCH (graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                WHERE graph.id = $id 
                DETACH DELETE value, node, property, class, graph
            `, { id });

            session.close();

            return {};
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Id of the graph to add the class to 
     * @param {String} className Class name
     * @param {Array<Property>} properties Class properties
     * @returns {Promise<{name: String, properties: Array<{name: String, type: String}>>}
     */
    async createClass(graphId, className, properties) {
        try {
            let session = this._driver.session();

            properties = properties.map(p => { return { name: p.getName(), type: p.getType() }});

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
                `, { graphId, className, properties });
                tx.run(`
                    MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]->(property:Property) 
                    WHERE graph.id = $graphId AND class.name = $className
                    MATCH (type:Type) WHERE type.name = property.type
                    MERGE (property)-[:INSTANCE_OF]->(type)
                `, { graphId, className });
            });

            session.close();

            return { name: className, properties };
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId 
     * @param {String} className 
     * @returns {Promise<{name: String, properties: Array<{name: String, type: String}>>}
     */
    async getClass(graphId, className) {
        try {
            let session = this._driver.session();

            let dbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                WHERE graph.id = $graphId AND class.name = $className
                RETURN { name: class.name, properties: collect({name: property.name, type: type.name}) }
                AS description
            `, { graphId, className });

            if(dbResponse.records.length === 0)
                return {};

            let classDescription = dbResponse.records[0].get("description");

            return classDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Id of the graph to delete class from 
     * @param {String} className Class name
     * @returns {Promise<{}>}
     */
    async deleteClass(graphId, className) {
        try {
            let session = this._driver.session();
            
            // Checking for implementing nodes
            let implementedNodesResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                MATCH (node:Node)-[:REALIZE]->(class)
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

            return {};
        }
        catch (err) {
            console.log(err);
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {String} className Class name
     * @returns {Promise<{id: String, values: Array<{name: String, type: String, value: any}>}>}
     */
    async createNode(graphId, className) {
        let nodeId = uuid();
        try {
            let session = this._driver.session();

            let propertiesDescriptions = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type) 
                WHERE graph.id = $graphId AND class.name = $className 
                RETURN { name: property.name, type: properties(type) } 
                AS description
            `, { graphId, className });

            if(propertiesDescriptions.records.length === 0)
                return {};

            propertiesDescriptions = propertiesDescriptions.records.map(record => record.get("description"));

            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]->(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                CREATE (node:Node)
                MERGE (graph)-[:CONTAINS]->(node)
                MERGE (node)-[:REALIZE]->(class)
                SET node.id = $nodeId
                FOREACH (propertyDescription IN $propertiesDescriptions | 
                    CREATE (value:Value) 
                    SET value = { name: propertyDescription.name, type: propertyDescription.type.name, value: propertyDescription.type.defaultValue } 
                    MERGE (node)-[:HAVE]->(value))
            `, { graphId, className, nodeId, propertiesDescriptions });
            
            session.close();

            return { 
                id: nodeId, 
                values: propertiesDescriptions.map(d => { return { name: d.name, type: d.type.name, value: d.type.defaultValue }})
            };
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId 
     * @param {String} nodeId 
     * @returns {Promise<{id: String, values: Array<{name: String, type: String, value: any}>}>}
     */
     async getNode(graphId, nodeId) {
        try {
            let session = this._driver.session();

            let nodeDescription = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                WHERE graph.id = $graphId AND node.id = $nodeId
                RETURN { id: node.id, values: collect(properties(value)) }
                AS description
            `, { graphId, nodeId });

            return nodeDescription.records[0].get("description");
        }
        catch (err) {
            console.log(err);
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {String} nodeId Node id
     * @returns {Promise<{}>} 
     */
    async deleteNode(graphId, nodeId) {
        try {
            let session = this._driver.session();
            
            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value) 
                WHERE graph.id = $graphId AND node.id = $nodeId 
                DETACH DELETE value, node
            `, { nodeId, graphId });

            session.close();

            return {};
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }
}

module.exports = Core;
