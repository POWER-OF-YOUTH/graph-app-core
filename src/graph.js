const neo4j = require('neo4j-driver');
const uuid = require('uuid').v4;

const DatabaseError = require('./database_error');

class Graph
{
    /**
     * 
     * @param {neo4j.Driver} driver 
     * @param {{id: String, name: String, description: String, date: Date}} data
     */
    constructor(driver, data) // Private constructor. Use 'create' method to create graph.
    {
        this.driver = driver;

        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.date = data.date;
    }

    /**
     * Create graph with saving
     * @param {neo4j.Driver} driver 
     * @param {{name: String, description: String}} data
     * @returns {Promise<Graph>}
     */
    static async create(driver, data) {
        data.id = uuid();
        data.date = Date.now();

        let graph = new Graph(driver, data);
        await graph.save()

        return graph;
    }

    /**
     * Create graph without saving
     * @param {neo4j.Driver} driver 
     * @param {{name: String, description: String}} data
     * @returns {Graph}
     */
    static new(driver, data) {
        data.id = uuid();
        data.date = Date.now();

        let graph = new Graph(driver, data);

        return graph;
    }

    /**
     * Check graph existing
     * @param {neo4j.Driver} driver 
     * @param {String} id 
     * @returns {Promise<boolean>}
     */
    static async isExists(driver, id) {
        try {
            let session = driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $id
                RETURN g AS graph
            `, { id })
            session.close();

            return dbResponse.records.length > 0;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Get all graphs
     * @param {neo4j.Driver} driver
     * @returns {Promise<Array<Graph>>}
     */
    static async all(driver) {
        try {
            let session = driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                RETURN properties(g) AS data
            `);
            session.close();

            let graphs = dbResponse.records.map(r => new Graph(driver, r.get("data")));

            return graphs;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {neo4j.Driver} driver 
     * @param {{name: String}} data 
     * @returns {Promise<Array<Graph>>}
     */
    static async where(driver, data) {
        try {
            let session = driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.name = $name
                RETURN properties(g) AS data
            `, { name: data.name });
            session.close();

            let graphs = dbResponse.records.map(r => new Graph(driver, r.get("data")));

            return graphs;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Find by id or return null
     * @param {neo4j.Driver} driver 
     * @param {String} id 
     * @returns {Promise<Graph>}
     */
    static async findById(driver, id) {
        if (!await Graph.isExists(driver, id))
            return null;
        try {
            let session = driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $id
                RETURN properties(g) AS data
            `, { id });
            session.close();

            let graph = new Graph(driver, dbResponse.records[0].get("data"));

            return graph;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Get graph id
     * @returns {String} uuid
     */
    getId() {
        return this.id;
    }

    /**
     * Get graph name
     * @returns {String} Graph name
     */
    getName() {
        return this.name;
    }

    /**
     * Set graph name
     * @param {String} name 
     * @returns {void}
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Get graph description
     * @returns {String} Graph description
     */
    getDescription() {
        return this.description;
    }

    /**
     * Set graph description
     * @param {String} description 
     * @returns {void}
     */
    setDescription(description) {
        this.description = description;
    }

    /**
     * Get graph creation date
     * @returns {String} Creation date
     */
    getCreationDate() {
        return this.date;
    }

    /**
     * Save graph to database
     * @returns {Promise<void>}
     */
    async save() {
        try {
            let session = this.driver.session();

            let data = this.toJSON();

            let dbResponse;
            if (await Graph.isExists(this.driver, this.id)) {
                dbResponse = await session.run(`
                    MATCH (g:Graph) 
                    WHERE g.id = $id
                    SET g = $data
                `, { id: data.id, data });
            }
            else {
                dbResponse = await session.run(`
                    CREATE (g:Graph) 
                    SET g = $data
                `, { data });
            }
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Destroy the graph in the database
     * @returns {Promise<void>}
     */
    async destroy() {
        try {
            let session = this.driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $id 
                OPTIONAL MATCH (g)-[:CONTAINS]-(c:Class)
                OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
                OPTIONAL MATCH (g)-[:CONTAINS]-(n:Node)-[:HAVE]->(v:Value)
                DETACH DELETE v, n, p, c, g
            `, { id: this.id })
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Convert to JSON
     * @returns {{id: String, name: String, description: String, date: String}}
     */
    toJSON() {
        return { 
            id: this.id, 
            name: this.name,  
            description: this.description,
            date: this.date
        }
    }
}

module.exports = Graph;