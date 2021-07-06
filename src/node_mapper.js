const driver = require('neo4j-driver');

const DatabaseError = require('./database_error');
const Graph = require('./graph');
const Class = require('./class');
const Node = require('./node');

const ClassMapper = require('./class_mapper');
const Value = require('./value');

class NodeMapper 
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
     */
    static new(driver) {
        return new NodeMapper(driver);
    }

    /**
     * Get neo4j driver
     * @returns {neo4j.Driver}
     */
    getDriver() {
        return this._driver;
    }

    /**
     * Get all nodes
     * @param {Graph} graph 
     * @returns {Promise<Array<Node>>}
     */
    async all(graph) {
        try {
            let clsMapper = new ClassMapper(this._driver);

            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]-(n:Node)-[:HAVE]->(v:Value)
                MATCH (n)-[:REALIZE]->(c:Class)
                RETURN { id: n.id, values: collect(properties(v)) } AS data,
                { name: c.name } AS class
            `, { graphId: graph.getId() });
            session.close();

            let nodes = await Promise.all(dbResponse.records.map(async r => {
                let data = r.get("data");
                let cls = await clsMapper.findByName(graph, r.get("class").name);
                let node = new Node(cls, data.id, data.values.map(v => new Value(v.type, v.value)));

                return node;
            }));

            return nodes;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Find node by id or return null
     * @param {Graph} graph 
     * @param {String} id 
     * @returns {Promise<Node>}
     */
    async findById(graph, id) {
        try {
            let clsMapper = new ClassMapper(this._driver);

            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $graphId
                MATCH (g)-[:CONTAINS]-(n:Node)-[:HAVE]->(v:Value)
                WHERE n.id = $nodeId
                MATCH (n)-[:REALIZE]->(c:Class)
                RETURN { id: n.id, values: collect(properties(v)) } AS data,
                { name: c.name } AS class
            `, { graphId: graph.getId(), nodeId: id });
            session.close();

            if (dbResponse.records.length == 0) 
                return null;

            let data = dbResponse.records[0].get("data");
            let cls = await clsMapper.findByName(graph, dbResponse.records[0].get("class").name);
            let node = new Node(cls, data.id, data.values.map(v => new Value(v.type, v.value)));

            return node;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Graph} graph 
     * @param {Node} node 
     * @returns {Promise<void>}
     */
    async save(graph, node) {
        try {
            let session = this._driver.session();
            let cls = node.getClass();
            let values = node.toJSON().values;
            let dbResponse = await session.run(`
                MATCH (graph:Graph)-[:CONTAINS]->(class:Class)
                WHERE graph.id = $graphId AND class.name = $className
                MERGE (graph)-[:CONTAINS]->(node:Node { id: $nodeData.id })
                MERGE (node)-[:REALIZE]->(class)
                FOREACH (value IN $values | 
                    MERGE (node)-[:HAVE]->(v:Value { name: value.name }) 
                    SET v = value)
            `, { graphId: graph.getId(), className: cls.getName(), nodeId: node.getId(), values, nodeData: node.toJSON() });
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * Destroy node in the database
     * @param {Graph} graph 
     * @param {Node} node 
     * @returns {Promise<void>}
     */
    async destroy(graph, node) {
        try {
            let session = this._driver.session();
            let dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                WHERE g.id = $graphId AND n.id = $nodeId
                MATCH (n)-[:HAVE]->(v:Value)
                DETACH DELETE v, n
            `, { graphId: graph.getId(), nodeId: node.getId() });
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
}

module.exports = NodeMapper;
