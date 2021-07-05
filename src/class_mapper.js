const driver = require('neo4j-driver');

const DatabaseError = require('./database_error');
const Graph = require('./graph');
const Property = require('./property');
const Class = require('./class');

class ClassMapper 
{
    /**
     * 
     * @param {neo4j.Driver} driver
     * @param {Graph} graph
     */
    constructor(driver, graph) {
        this._driver = driver;
        this._graph = graph;
    }

    /**
     * Get all classes
     * @returns {Promise<Array<Class>>}
     */
    async all() {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]-(c:Class)
                OPTIONAL MATCH (c)-[:HAVE]-(p:Property)-[:INSTANCE_OF]->(t:Type)
                RETURN { name: c.name, properties: collect({name: p.name, type: t.name}) }
                AS data
            `, { graphId: this._graph.getId() });
            session.close();

            let clss = dbResponse.records.map(r => {
                let data = r.get("data");
                let cls = new Class(data.name, data.properties.filter(p => p.name !== null).map(p => new Property(p.name, p.type)));

                return cls;
            })

            return clss;
        }
        catch (err) {
            console.log(err);
            throw new DatabaseError();
        }
    }

    /**
     * Find class by id or return null
     * @param {String} name 
     * @returns {Promise<Class>}
     */
    async findByName(name) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]-(c:Class)
                WHERE g.id = $graphId AND c.name = $className
                OPTIONAL MATCH (c)-[:HAVE]-(p:Property)-[:INSTANCE_OF]->(t:Type)
                RETURN { name: c.name, properties: collect({name: p.name, type: t.name}) }
                AS data
            `, { graphId: this._graph.getId(), className: name});
            session.close();
            
            if (dbResponse.records.length == 0) 
                return null;
                
            let data = dbResponse.records[0].get("data");
            let cls = new Class(data.name, data.properties.filter(p => p.name !== null).map(p => new Property(p.name, p.type)));
                
            return cls;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Class} cls 
     * @returns {Promise<void>}
     */
    async save(cls) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.writeTransaction(tx => {
                tx.run(`
                    MATCH (g:Graph) 
                    WHERE g.id = $graphId 
                    CREATE (c:Class) 
                    SET c = { name: $className, _unique_key: id(g) + "_" + $className }
                    MERGE (g)-[:CONTAINS]->(c)
                    FOREACH (property IN $properties | 
                        CREATE (p:Property) 
                        SET p = { name: property.name, type: property.type, _unique_key: id(c) + "_" + property.name } 
                        MERGE (c)-[:HAVE]->(p))
                `, { graphId: this._graph.getId(), className: cls.getName(), properties: cls.getProperties().map(p => p.toJSON())});
                tx.run(`
                    MATCH (g:Graph)-[:CONTAINS]-(c:Class)-[:HAVE]->(p:Property) 
                    WHERE g.id = $graphId AND c.name = $className
                    MATCH (t:Type) 
                    WHERE t.name = p.type
                    MERGE (p)-[:INSTANCE_OF]->(t)
                `, { graphId: this._graph.getId(), className: cls.getName() });
            });
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Destroy class in the database
     * @param {Class} cls 
     * @returns {Promise<void>}
     */
    async destroy(cls) {
        if (await this._hasImplementedNodes(cls))
            throw new DatabaseError("Class has implemented nodes!");
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(c:Class)
                WHERE g.id = $graphId AND c.name = $className
                OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
                DETACH DELETE p, c
            `, { graphId: this._graph.getId(), className: cls.getName() });
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * @returns {Promise<boolean>}
     */
    async _hasImplementedNodes(cls) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]-(c:Class)
                WHERE g.id = $graphId AND c.name = $className
                MATCH (n:Node)-[:REALIZE]->(c)
                RETURN n LIMIT 1
            `, { graphId: this._graph.getId(), className: cls.getName() });
            session.close();

            return dbResponse.records.length > 0;
        }
        catch (err) {
            console.log(err);
            throw new DatabaseError();
        }
    }
}

module.exports = ClassMapper;
