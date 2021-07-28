import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Mapper from './mapper';
import Graph from './graph';

class GraphMapper extends Mapper<Graph> 
{
    constructor(driver: Driver) {
        super(driver);
    }

    async all(): Promise<Array<Graph>> {
        const parameters = { };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            RETURN properties(g) AS data 
        `, parameters);

        const graphs = result.records.map(record => {
            const data: {name: string, description: string, id: string, date: Date | number} = record.get("data");
            const graph = new Graph(data.name, data.description, data.id, data.date);

            return graph;
        })

        return graphs;
    }

    async findBy({ id }: { id: string}): Promise<Graph | null> {
        const parameters = { 
            data: {
                graphId: id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            RETURN properties(g) AS data 
        `, parameters);

        if (result.records.length === 0)
            return null;

        const data: {name: string, description: string, id: string, date: Date | number} = result.records[0].get("data");
        const graph = new Graph(data.name, data.description, data.id, data.date);

        return graph;
    }

    async save(graph: Graph): Promise<void> {
        const parameters = { 
            data: { 
                name: graph.name, 
                description: graph.description, 
                id: graph.id, 
                date: graph.date 
            } 
        }
        const result = await this.runQuery(`
            MERGE (g:Graph {id: $data.id})
            SET g = $data
        `, parameters);
    }

    async destroy(graph: Graph): Promise<void> {
        const parameters = {
            data: {
                id: graph.id, 
            }
        }
        const result = await this.runQuery(`
            MATCH (g:Graph) 
            WHERE g.id = $data.id
            OPTIONAL MATCH (g)-[:CONTAINS]-(c:Class)
            OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
            OPTIONAL MATCH (g)-[:CONTAINS]-(n:Node)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Value)
            DETACH DELETE v, n, p, c, g
        `, parameters);
    }
}

export default GraphMapper;