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

            let typesDbResponse = await session.run(`MATCH (type:Type) RETURN properties(type) AS description`);

            session.close();

            return typesDbResponse.records.map(record => record.get("description"));;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {{name: String, description: String}} graphData Graph data
     * @returns {Promise<{id: String, name: String, description: String, created: Date, nodes: Array<{id: String, values: Array<{name: String, type: String, value: any}>}>, classes: Array<{name: String, properties: Array<{name: String, type: String}>}> }>} Graph description
     */
    async createGraph(graphData) {
        try {
            let session = this._driver.session();

            let graphDescription = { id: uuid(), name: graphData.name, description: graphData.description, date: Date.now() }; // Contains a description of the graph that will be returned to the user

            let graphDbResponse = await session.run(`
                CREATE (g:Graph) 
                SET g = $data
                RETURN properties(g) AS graph
            `, { data: { id: graphDescription.id, name: graphDescription.name, description: graphDescription.description, date: graphDescription.date }});

            session.close();

            return { ...graphDbResponse.records[0].get("graph"), nodes: [], classes: [], relations: [] };
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @returns {Promise<boolean>}
     */
    async isGraphExists(graphId) {
        try {
            let session = this._driver.session();

            let graphDbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                RETURN g
            `, { graphId })

            session.close();

            return graphDbResponse.records.length > 0;
        }
        catch (err) {
            console.log(err);
            throw new Error("Database error!");
        }
    }
    
    /**
     * 
     * @param {String} graphId Graph id
     * @param {bool} extended Return extended graph information: nodes, classes and relationships
     * @returns {Promise<{id: String, name: String, description: String, created: Date, nodes: Array<{id: String, values: Array<{name: String, type: String, value: any}>}>, classes: Array<{name: String, properties: Array<{name: String, type: String}>}>, relations: Array<{from: {id: String}, to: {id: String}, name: String}> }>}
     */
    async getGraph(graphId, extended = false) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

            let graphDbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $graphId
                RETURN properties(g) AS graph
            `, { graphId });

            let graphDescription = { ...graphDbResponse.records[0].get("graph"), nodes: [], classes: [], relations: [] };

            if (extended) {
                graphDescription.nodes = await this.getNodes(graphId);
                graphDescription.classes = await this.getClasses(graphId);
                graphDescription.relations = await this.getRelations(graphId);
            }

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
     * @param {bool} extended Return extended graph information: nodes, classes and relationships
     * @returns {Promise<Array<{id: String, name: String, description: String, created: Date, nodes: Array<{id: String, values: Array<{name: String, type: String, value: any}>}>, classes: Array<{name: String, properties: Array<{name: String, type: String}>}>, relations: Array<{from: {id: String}, to: {id: String}, name: String}> }>>}
     */
    async getGraphs(graphIds, extended = false) {
        return await Promise.all(graphIds.map(graphId => this.getGraph(graphId, extended)));
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @returns {Promise<{id: String, name: String, description: String, created: Date, nodes: Array<{id: String, values: Array<{name: String, type: String, value: any}>}>, classes: Array<{name: String, properties: Array<{name: String, type: String}>}>, relations: Array<{from: {id: String}, to: {id: String}}> }>} 
     */
    async deleteGraph(graphId) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

            let graphDescription = await this.getGraph(graphId, false);

            await session.run(`
                MATCH (graph:Graph) WHERE graph.id = $graphId 
                OPTIONAL MATCH (graph)-[:CONTAINS]-(class:Class)
                OPTIONAL MATCH (class)-[:HAVE]->(property:Property)
                OPTIONAL MATCH (graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                DETACH DELETE value, node, property, class, graph
            `, { graphId });

            session.close();

            return graphDescription;
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
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

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

    async isClassExists(graphId, className) {
        try {
            let session = this._driver.session();

            let classDbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                RETURN class
            `, { graphId, className })

            session.close();

            return classDbResponse.records.length > 0;
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
            if (!await this.isGraphExists(graphId) || !await this.isClassExists(graphId, className))
                return null;

            let session = this._driver.session();

            let classDbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                OPTIONAL MATCH (class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                RETURN { name: class.name, properties: collect({name: property.name, type: type.name}) }
                AS description
            `, { graphId, className });

            return classDbResponse.records[0].get("description");            ;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId 
     * @param {Array<String>} classNames
     * @returns {Promise<Array<{name: String, properties: Array<{name: String, type: String}>>>}
     */
     async getClasses(graphId, classNames = []) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

            let classesDbResponse;
            if (classNames.length === 0) 
                classesDbResponse = await session.run(`
                    MATCH (graph:Graph)
                    WHERE graph.id = $graphId
                    MATCH (graph)-[:CONTAINS]-(class:Class)
                    OPTIONAL MATCH (class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                    RETURN { name: class.name, properties: collect({name: property.name, type: type.name}) }
                    AS description
                `, { graphId });
            else
                classesDbResponse = await session.run(`
                    MATCH (graph:Graph)
                    WHERE graph.id = $graphId
                    MATCH (graph)-[:CONTAINS]-(class:Class)
                    WHERE class.name IN $classNames
                    OPTIONAL MATCH (class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type)
                    RETURN { name: class.name, properties: collect({name: property.name, type: type.name}) }
                    AS description
                `, { graphId, classNames });


            return classesDbResponse.records.map(r => r.get("description"));;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Id of the graph to delete class from 
     * @param {String} className Class name
     * @returns {Promise<{name: String, properties: Array<{name: String, type: String}>>}
     */
    async deleteClass(graphId, className) {
        try {
            if (!await this.isGraphExists(graphId) || !await this.isClassExists(graphId, className))
                return null;

            let session = this._driver.session();

            let classDescription = await this.getClass(graphId, className);

            let implementedNodesResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                MATCH (node:Node)-[:REALIZE]->(class)
                RETURN node LIMIT 1
            `, { graphId, className });
            if (implementedNodesResponse.records.length > 0)
                throw new Error("Class have implemented nodes!");

            await session.run(`
                MATCH (graph:Graph)-[CONTAINS]-(class:Class) 
                WHERE graph.id = $graphId AND class.name = $className 
                OPTIONAL MATCH (class)-[:HAVE]->(property:Property)
                DETACH DELETE property, class
            `, { graphId, className });

            session.close();

            return classDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Id of the graph to delete classes from 
     * @param {String} classNames Class names
     * @returns {Promise<Array<{name: String, properties: Array<{name: String, type: String}>>>}
     */
     async deleteClasses(graphId, classNames) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;
            
            let session = this._driver.session();
            
            let classesDescription = await this.getClasses(graphId, classNames);

            let implementedNodesResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)
                WHERE graph.id = $graphId AND class.name IN $classNames
                MATCH (node:Node)-[:REALIZE]->(class)
                RETURN node LIMIT 1
            `, { graphId, classNames });

            if (implementedNodesResponse.records.length > 0)
                return null;

            await session.run(`
                MATCH (graph:Graph)-[CONTAINS]-(class:Class) 
                WHERE graph.id = $graphId AND class.name IN $classNames
                OPTIONAL MATCH (class)-[:HAVE]->(property:Property)
                DETACH DELETE property, class
            `, { graphId, classNames });

            session.close();

            return classesDescription;
        }
        catch (err) {
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
            if (!await this.isGraphExists(graphId) || !await this.isClassExists(graphId, className))
                return null;
            
            let session = this._driver.session();

            let propertiesDescription = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]-(property:Property)-[:INSTANCE_OF]->(type:Type) 
                WHERE graph.id = $graphId AND class.name = $className 
                RETURN { name: property.name, type: properties(type) } 
                AS description
            `, { graphId, className });

            if(propertiesDescription.records.length === 0)
                return null;

            propertiesDescription = propertiesDescription.records.map(record => record.get("description"));

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
            `, { graphId, className, nodeId, propertiesDescriptions: propertiesDescription });
            
            session.close();

            return { 
                id: nodeId, 
                values: propertiesDescription.map(d => { return { name: d.name, type: d.type.name, value: d.type.defaultValue }})
            };
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {*} graphId Graph id
     * @param {*} nodeId Node id
     * @returns {Promise<boolean>}
     */
    async isNodeExists(graphId, nodeId) {
        try {
            let session = this._driver.session();

            let nodeDbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)
                WHERE graph.id = $graphId AND node.id = $nodeId
                RETURN node
            `, { graphId, nodeId });
            
            session.close();

            return nodeDbResponse.records.length > 0;
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
            if (!await this.isGraphExists(graphId) || !await this.isNodeExists(graphId, nodeId))
                return null;

            let session = this._driver.session();

            let nodeDbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                WHERE graph.id = $graphId AND node.id = $nodeId
                RETURN { id: node.id, values: collect(properties(value)) }
                AS description
            `, { graphId, nodeId });

            session.close();

            return nodeDbResponse.records[0].get("description");
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId 
     * @param {Array<String>} nodeIds
     * @returns {Promise<Array<{id: String, values: Array<{name: String, type: String, value: any}>}> >}
     */
     async getNodes(graphId, nodeIds = []) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

            let nodesDbResponse;
            if (nodeIds.length === 0)
                nodesDbResponse = await session.run(`
                    MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                    WHERE graph.id = $graphId
                    RETURN { id: node.id, values: collect(properties(value)) }
                    AS description
                `, { graphId });
            else
                nodesDbResponse = await session.run(`
                    MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value)
                    WHERE graph.id = $graphId AND node.id IN $nodeIds
                    RETURN { id: node.id, values: collect(properties(value)) }
                    AS description
                `, { graphId, nodeIds });

            return nodesDbResponse.records.map(r => r.get("description"));
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {String} nodeId Node id
     * @returns {Promise<{id: String, values: Array<{name: String, type: String, value: any}>}>} 
     */
    async deleteNode(graphId, nodeId) {
        try {
            if (!await this.isGraphExists(graphId) || !await this.isNodeExists(graphId, nodeId))
                return null;

            let session = this._driver.session();

            let nodeDescription = await this.getNode(graphId, nodeId);

            if (nodeDescription === null)
                return null;
            
            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value) 
                WHERE graph.id = $graphId AND node.id = $nodeId 
                DETACH DELETE value, node
            `, { graphId, nodeId });

            session.close();

            return nodeDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {String} nodeId Node id
     * @returns {Promise<Array<{id: String, values: Array<{name: String, type: String, value: any}>}>>} 
     */
     async deleteNodes(graphId, nodeIds) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

            let nodesDescription = await this.getNodes(graphId, nodeIds);

            if (nodesDescription === null)
                return null;
            
            await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]-(node:Node)-[:HAVE]->(value:Value) 
                WHERE graph.id = $graphId AND node.id IN nodeIds
                DETACH DELETE value, node
            `, { graphId, nodeIds });

            session.close();

            return nodesDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {{from: {id: String}, to: {id:String}, name: String}} relation Object describing the relationship
     * @returns {Promise<{from: {id: String}, to: {id: String}, name: String}>}
     */
    async createRelation(graphId, relation) {
        try {
            if (!await this.isGraphExists(graphId) 
             || !await this.isNodeExists(graphId, relation.from.id) 
             || !await this.isNodeExists(graphId, relation.to.id))
                return null;
            
            let session = this._driver.session();

            let relationDbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]->(fromNode:Node)
                WHERE fromNode.id = $fromNodeId
                MATCH (g)-[:CONTAINS]->(toNode:Node)
                WHERE toNode.id = $toNodeId
                MERGE (fromNode)-[:${relation.name}]->(toNode)
                RETURN { from: {id: $fromNodeId}, to: {id: $toNodeId}, name: $relationName } AS relation
            `, { graphId, fromNodeId: relation.from.id, toNodeId: relation.to.id, relationName: relation.name });

            session.close();

            return relationDbResponse.records[0].get("relation");
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId 
     * @param {{from: {id: String}, to: {id: String}, name: String}} relation 
     * @returns {Promise<boolean>}
     */
    async isRelationExists(graphId, relation) {
        try {
            let session = this._driver.session();
            
            let relationDbResponse = await session.run(`
                    MATCH (g:Graph)
                    WHERE g.id = $graphId
                    MATCH (g)-[:CONTAINS]->(fromNode:Node)
                    WHERE fromNode.id = $fromNodeId
                    MATCH (g)-[:CONTAINS]->(toNode:Node)
                    WHERE toNode.id = $toNodeId
                    MATCH (fromNode)-[rel:${relation.name}]->(toNode)
                    RETURN rel
                `, { graphId, fromNodeId: relation.from.id, toNodeId: relation.to.id, relationName: relation.name });

            return relationDbResponse.records.length > 0;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {{from: {id: String}, to: {id:String}, name: String}} relation Object describing the relationship
     * @returns {Promise<{from: {id: String}, to: {id: String}, name: String}>}
     */
     async getRelation(graphId, relation) {
        try {
            if (!await this.isGraphExists(graphId) || !await this.isRelationExists(graphId, relation))
                return null;
            
            let session = this._driver.session();

            let relationDbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]->(fromNode:Node)
                WHERE fromNode.id = $fromNodeId
                MATCH (g)-[:CONTAINS]->(toNode:Node)
                WHERE toNode.id = $toNodeId
                MATCH (fromNode)-[rel:${relation.name}]->(toNode)
                RETURN { from: {id: $fromNodeId}, to: {id: $toNodeId}, name: $relationName } AS relation
            `, { graphId, fromNodeId: relation.from.id, toNodeId: relation.to.id, relationName: relation.name });

            session.close();

            return relationDbResponse.records[0].get("relation");
        }
        catch (err) {
            console.log(err);
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {{from: {id: String}, to: {id:String}} | {from: {id: String}} | {to: {id: String}} | undefined} relation Object describing the relationship
     * @returns {Promise<Array<{from: {id: String}, to: {id: String}, name: String}>>}
     */
     async getRelations(graphId, relation = undefined) {
        try {
            if (!await this.isGraphExists(graphId))
                return null;

            let session = this._driver.session();

            let relationsDbResponse;
            if (relation === undefined) {
                relationsDbResponse = await session.run(`
                    MATCH (g:Graph)
                    WHERE g.id = $graphId
                    MATCH (g)-[:CONTAINS]->(fromNode:Node)
                    MATCH (g)-[:CONTAINS]->(toNode:Node)
                    MATCH (fromNode)-[rel]->(toNode)
                    RETURN { from: {id: fromNode.id}, to: {id: toNode.id}, name: type(rel) } AS relation
                `, { graphId });
            }
            else if (relation.from !== undefined && relation.to === undefined) {
                relationsDbResponse = await session.run(`
                    MATCH (g:Graph)
                    WHERE g.id = $graphId
                    MATCH (g)-[:CONTAINS]->(fromNode:Node)
                    WHERE fromNode.id = $fromNodeId
                    MATCH (g)-[:CONTAINS]->(toNode:Node)
                    MATCH (fromNode)-[rel]->(toNode)
                    RETURN { from: {id: fromNode.id}, to: {id: toNode.id}, name: type(rel) } AS relation
                `, { graphId, fromNodeId: relation.from.id });
            }
            else if (relation.from === undefined && relation.to !== undefined) {
                relationsDbResponse = await session.run(`
                    MATCH (g:Graph)
                    WHERE g.id = $graphId
                    MATCH (g)-[:CONTAINS]->(fromNode:Node)
                    MATCH (g)-[:CONTAINS]->(toNode:Node)
                    WHERE toNode.id = $toNodeId
                    MATCH (fromNode)-[rel]->(toNode)
                    RETURN { from: {id: fromNode.id}, to: {id: toNode.id}, name: type(rel) } AS relation
                `, { graphId, toNodeId: relation.to.id });
            }
            else if (relation.from !== undefined && relation.to !== undefined) {
                relationsDbResponse = await session.run(`
                    MATCH (g:Graph)
                    WHERE g.id = $graphId
                    MATCH (g)-[:CONTAINS]->(fromNode:Node)
                    WHERE fromNode.id = $fromNodeId
                    MATCH (g)-[:CONTAINS]->(toNode:Node)
                    WHERE toNode.id = $toNodeId
                    MATCH (fromNode)-[rel]->(toNode)
                    RETURN { from: {id: $fromNodeId}, to: {id: $toNodeId}, name: type(rel) } AS relation
                `, { graphId, fromNodeId: relation.from.id, toNodeId: relation.to.id });
            }
            else
                return [];

            session.close();

            return relationsDbResponse.records.map(r => r.get("relation"));
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graphId Graph id
     * @param {{from: {id: String}, to: {id:String}, name: String}} relation Object describing the relationship
     * @returns {Promise<{from: {id: String}, to: {id: String}, name: String}>}
     */
     async deleteRelation(graphId, relation) {
        try {
            if (!await this.isGraphExists(graphId) || !await this.isRelationExists(graphId, relation))
                return null;
            
            let session = this._driver.session();

            let relationDescription = await this.getRelation(graphId, relation);

            await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]->(fromNode:Node)
                WHERE fromNode.id = $fromNodeId
                MATCH (g)-[:CONTAINS]->(toNode:Node)
                WHERE toNode.id = $toNodeId
                MATCH (fromNode)-[rel:${relation.name}]->(toNode)
                DELETE rel
            `, { graphId, fromNodeId: relation.from.id, toNodeId: relation.to.id, relationName: relation.name });

            session.close();

            return relationDescription;
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }
}

module.exports = Core;
