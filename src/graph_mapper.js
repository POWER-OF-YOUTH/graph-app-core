const neo4j = require('neo4j-driver');

const DatabaseError = require('./database_error');
const Graph = require('./graph');

class GraphMapper 
{
    /**
     * Private constructor
     * @param {neo4j.Driver} driver 
     */
    constructor(driver) {
        this._driver = driver;
    }

    /**
     * 
     * @param {neo4j.Driver} driver 
     * @returns {GraphMapper} graph mapper
     */
    new(driver) {
        return new GraphMapper(driver);
    }

    /**
     * Get neo4j driver
     * @returns {neo4j.Driver}
     */
    getDriver() {
        return this._driver;
    }

    /**
     * Get all graphs
     * @returns {Promise<Array<Graph>>}
     */
     async all() {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                RETURN properties(g) AS data
            `);
            session.close();

            let graphs = dbResponse.records.map(r => {
                let data = r.get("data");
                let graph = new Graph(data.id, data.name, data.description, data.date);
                
                return graph;
            });

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
    /*
     async where(data) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.name = $name
                RETURN properties(g) AS data
            `, { name: data.name });
            session.close();

            let graphs = dbResponse.records.map(r => {
                let data = r.get("data");
                return new Graph(data.id, data.name, data.description, data.date);
            });

            return graphs;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
    */

    /**
     * Find graph by id or return null
     * @param {neo4j.Driver} driver 
     * @param {String} id 
     * @returns {Promise<Graph>}
     */
    async findById(id) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $id
                RETURN properties(g) AS data
            `, { id });
            session.close();

            if (dbResponse.records.length == 0) 
                return null;

            let data = dbResponse.records[0].get("data");
            let graph = new Graph(data.id, data.name, data.description, data.date);

            return graph;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Save graph to database
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    async save(graph) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MERGE (g:Graph {id: $data.id})
                ON CREATE
                    SET g = $data
                ON MATCH
                    SET g.name = $data.name
                    SET g.description = $data.description
            `, { data: graph.toJSON() });
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Destroy the graph in the database
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    async destroy(graph) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $data.id
                OPTIONAL MATCH (g)-[:CONTAINS]-(c:Class)
                OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
                OPTIONAL MATCH (g)-[:CONTAINS]-(n:Node)-[:HAVE]->(v:Value)
                DETACH DELETE v, n, p, c, g
            `, { data: graph.toJSON() })
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
}

module.exports = GraphMapper;
