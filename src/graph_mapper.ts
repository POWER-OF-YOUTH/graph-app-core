import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import IMapper from './i_mapper';
import Graph from './graph';

class GraphMapper implements IMapper<Graph> 
{
    private readonly _driver: Driver;

    constructor(driver: Driver) {
        this._driver = driver;
    }

    get driver(): Driver {
        return this._driver;
    }

    async all(): Promise<Array<Graph>> {
        try {
            const session = this._driver.session();
            const parameters = { };
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                RETURN properties(g) AS data 
            `, parameters);
            session.close();

            const graphs = dbResponse.records.map(record => {
                const data: {name: string, description: string, id: string, date: Date | number} = record.get("data");
                const graph = new Graph(data.name, data.description, data.id, data.date);

                return graph;
            })

            return graphs;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    async findBy({ id }: { id: string}): Promise<Graph | null> {
        try {
            const session = this._driver.session();
            const parameters = { 
                data: {
                    graphId: id
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                RETURN properties(g) AS data 
            `, parameters);
            session.close();

            if (dbResponse.records.length === 0)
                return null;

            const data: {name: string, description: string, id: string, date: Date | number} = dbResponse.records[0].get("data");
            const graph = new Graph(data.name, data.description, data.id, data.date);

            return graph;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    async save(graph: Graph): Promise<void> {
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

    async destroy(graph: Graph): Promise<void> {
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