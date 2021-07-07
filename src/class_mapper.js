const driver = require('neo4j-driver');

const DatabaseError = require('./database_error');
const Graph = require('./graph');
const Property = require('./property');
const Class = require('./class');

class ClassMapper 
{
    /**
     * Private constructor
     * @param {neo4j.Driver} driver
     */
    constructor(driver) {
        this._driver = driver;
    }

    static new(driver) {
        return new ClassMapper(driver);
    }

    /**
     * Get neo4j driver
     * @returns {neo4j.Driver}
     */
    getDriver() {
        return this._driver;
    }

    /**
     * Get all classes
     * @param {Graph} graph
     * @returns {Promise<Array<Class>>}
     */
    async all(graph) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]-(c:Class)
                OPTIONAL MATCH (c)-[:HAVE]-(p:Property)-[:INSTANCE_OF]->(t:Type)
                RETURN { name: c.name, properties: collect({name: p.name, type: t.name, defaultValue: p.defaultValue })}
                AS data
            `, { graphId: graph.getId() });
            session.close();

            let clss = dbResponse.records.map(r => {
                let data = r.get("data");
                let cls = new Class(data.name, data.properties.filter(p => p.name !== null).map(p => new Property(p.name, p.type, p.defaultValue)));

                return cls;
            })

            return clss;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Find class by name or return null
     * @param {Graph} graph
     * @param {String} name 
     * @returns {Promise<Class>}
     */
    async findByName(graph, name) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]-(c:Class)
                WHERE g.id = $graphId AND c.name = $className
                OPTIONAL MATCH (c)-[:HAVE]-(p:Property)-[:INSTANCE_OF]->(t:Type)
                RETURN { name: c.name, properties: collect({name: p.name, type: t.name, defaultValue: p.defaultValue })}
                AS data
            `, { graphId: graph.getId(), className: name});
            session.close();
            
            if (dbResponse.records.length == 0) 
                return null;
                
            let data = dbResponse.records[0].get("data");
            let cls = new Class(data.name, data.properties.filter(p => p.name !== null).map(p => new Property(p.name, p.type, p.defaultValue)));
                
            return cls;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Graph} graph
     * @param {Class} cls 
     * @returns {Promise<void>}
     */
    async save(graph, cls) { // TODO: Test
        try {
            let session = this._driver.session();
            let graphId = graph.getId();
            let className = cls.getName();
            let properties = cls.getProperties().map(p => p.toJSON())
            let dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MERGE (g)-[:CONTAINS]->(c:Class { name: $className })
                FOREACH (property IN $properties | 
                    MERGE (c)-[:HAVE]->(p:Property { name: property.name })
                    ON CREATE
                        SET p = { name: property.name, type: property.type, defaultValue: property.defaultValue, _unique_key: id(c) + "_" + property.name })
                WITH c
                MATCH (c)-[:HAVE]->(p:Property)
                MATCH (t:Type)
                WHERE p.type = t.name
                MERGE (p)-[:INSTANCE_OF]->(t)
            `, { graphId, className, properties })
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Destroy class in the database
     * @param {Graph} graph
     * @param {Class} cls 
     * @returns {Promise<void>}
     */
    async destroy(graph, cls) {
        if (await this._hasImplementedNodes(graph, cls))
            throw new DatabaseError("Class has implemented nodes!");
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(c:Class)
                WHERE g.id = $graphId AND c.name = $className
                OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
                DETACH DELETE p, c
            `, { graphId: graph.getId(), className: cls.getName() });
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Graph} graph
     * @returns {Promise<boolean>}
     */
    async _hasImplementedNodes(graph, cls) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]-(c:Class)
                WHERE g.id = $graphId AND c.name = $className
                MATCH (n:Node)-[:REALIZE]->(c)
                RETURN n LIMIT 1
            `, { graphId: graph.getId(), className: cls.getName() });
            session.close();

            return dbResponse.records.length > 0;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
}

module.exports = ClassMapper;
