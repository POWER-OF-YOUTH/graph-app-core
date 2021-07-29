import { Driver } from 'neo4j-driver';

import Mapper from './mapper';
import Graph from './graph';
import GraphSerializer from './graph_serializer';

class GraphMapper extends Mapper<Graph> 
{
    private readonly _graphSerializer = new GraphSerializer();

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
            const data = record.get("data");
            const graph = this._graphSerializer.deserialize({ data });

            return graph;
        });

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

        const data = result.records[0].get("data");
        const graph = this._graphSerializer.deserialize({ data });

        return graph;
    }

    async save(graph: Graph): Promise<void> {
        const parameters = { 
            data: this._graphSerializer.serialize(graph)
        }
        const result = await this.runQuery(`
            MERGE (g:Graph {id: $data.id})
            SET g = $data
        `, parameters);
    }

    async destroy(graph: Graph): Promise<void> {
        const parameters = {
            data: this._graphSerializer.serialize(graph)
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