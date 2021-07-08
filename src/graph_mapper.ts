import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import IMapper from './i_mapper';
import Graph from './graph';

class GraphMapper implements IMapper<Graph> 
{
    private readonly _driver: Driver;

    /**
     * 
     * @param {Driver} driver
     */
    constructor(driver: Driver) {
        if (driver == null)
            throw new Error("Null reference exception!");

        this._driver = driver;
    }

    /**
     * @returns {Driver}
     */
    get driver(): Driver {
        return this._driver;
    }

    /**
     * 
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    async save(graph: Graph): Promise<void> {
        if (graph == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: { 
                    name: graph.name, 
                    description: graph.description, 
                    id: graph.id, 
                    date: graph.date 
                } 
            }
            const dbResponse = await session.run(`
                MERGE (g:Graph {id: $data.id})
                SET g = $data
            `, parameters)
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    async destroy(graph: Graph): Promise<void> {
        if (graph == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    id: graph.id, 
                }
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $data.id
                OPTIONAL MATCH (g)-[:CONTAINS]-(c:Class)
                OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
                OPTIONAL MATCH (g)-[:CONTAINS]-(n:Node)
                OPTIONAL MATCH (n)-[:HAVE]->(v:Value)
                DETACH DELETE v, n, p, c, g
            `, parameters)
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
}

export default GraphMapper;