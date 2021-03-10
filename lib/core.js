const neo4j = require('neo4j-driver');

const Property = require('./property');

// Neo4j database constraints
/**
 * CREATE CONSTRAINT unique_graph_name ON (graph:Graph) ASSERT graph.name IS UNIQUE
 * CREATE CONSTRAINT unique_class_in_graph ON (class:Class) ASSERT class._unique_key IS UNIQUE
 * CREATE CONSTRAINT unique_property_in_class ON (property:Property) ASSERT property._unique_key IS UNIQUE
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

            var graphDescription = { name: name, date: Date.now() };

            await session.run(`
                CREATE (graph:Graph) 
                SET graph = { name: $name, created: $date }
            `, { name: graphDescription.name, date: graphDescription.date });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }

        return graphDescription;
    }

    /**
     * 
     * @param {String} name Graph name
     * @returns {Promise} 
     */
    async deleteGraph(name) {
        try {
            let session = this._driver.session();
            
            await session.run(`
                MATCH (graph:Graph)-[CONTAINS]-(class:Class)-[:HAVE]->(property:Property) 
                WHERE graph.name = $name 
                DETACH DELETE property, class, graph
            `, { name: name });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }

    /**
     * 
     * @param {String} graph Name of the graph to add the class to 
     * @param {String} name Class name
     * @param {Array<Property>} properties Class properties
     * @returns {Promise}
     */
    async createClass(graph, name, properties) {
        try {
            let session = this._driver.session();

            var classDescription = { name: name, properties: properties.map(p => { return { name: p.getName(), type: p.getType() }})}

            await session.writeTransaction(tx => {
                tx.run(`
                    MATCH (graph:Graph) WHERE graph.name = $graphName 
                    CREATE (class:Class) 
                    SET class = { name: $className, _unique_key: id(graph) + "_" + $className }
                    MERGE (graph)-[:CONTAINS]->(class)
                    FOREACH (property IN $properties | 
                        CREATE (p:Property) 
                        SET p = { name: property.name, type: property.type, _unique_key: id(class) + "_" + property.name } 
                        MERGE (class)-[:HAVE]->(p))
                `, { graphName: graph, className: classDescription.name, properties: classDescription.properties});
                tx.run(`
                    MATCH (graph:Graph)-[:CONTAINS]-(class:Class)-[:HAVE]->(property:Property) 
                    WHERE graph.name = $graphName AND class.name = $className
                    MATCH (type:Type) WHERE type.name = property.type
                    MERGE (property)-[:INSTANCE_OF]->(type)
                `, { graphName: graph, className: classDescription.name});
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
     * @param {String} graph Name of the graph to delete class from 
     * @param {String} name Class name
     * @returns {Promise}
     */
    async deleteClass(graph, name) {
        try {
            let session = this._driver.session();
            
            await session.run(`
                MATCH (graph:Graph)-[CONTAINS]-(class:Class)-[:HAVE]->(property:Property) 
                WHERE graph.name = $graphName AND class.name = $className 
                DETACH DELETE property, class
            `, { graphName: graph, className: name });

            session.close();
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }
}

module.exports = Core;