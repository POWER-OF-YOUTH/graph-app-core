import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import Mapper from './mapper';
import Node from './node';
import NodeMapper from './node_mapper';
import Relation from './relation';

class RelationMapper extends Mapper<Relation> 
{
    private readonly _graph: Graph;

    constructor(driver: Driver, graph: Graph) {
        super(driver);

        this._graph = graph;
    }

    async all(): Promise<Array<Relation>> {
        const parameters = {
            data: {
                graphId: this._graph.id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1:Node)
            MATCH (g)-[:CONTAINS]->(n2:Node)
            WHERE n1 <> n2
            MATCH (n1)-[rel:RELATION]->(n2)
            RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
        `, parameters);

        const nm = new NodeMapper(this._driver, this._graph);

        const relations = Promise.all(result.records.map(async (record) => {
            const data: {id: string, name: string} = record.get("data");
            const from: {id: string} = record.get("from");
            const to: {id: string} = record.get("to");

            const relation = new Relation((await nm.findBy({id: from.id}))!, (await nm.findBy({id: to.id}))!, data.name, data.id);

            return relation;
        }));

        return relations;
    }

    async where({ from, to }: {from: Node | undefined, to: Node | undefined}): Promise<Array<Relation>> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                fromId: from?.id,
                toId: to?.id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1:Node)
            ${from ? "WHERE n1.id = $data.fromId" : ""}
            MATCH (g)-[:CONTAINS]->(n2:Node)
            ${to ? "WHERE n2.id = $data.toId": ""}
            MATCH (n1)-[rel:RELATION]->(n2)
            WHERE n1 <> n2
            RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
        `, parameters);

        const nm = new NodeMapper(this._driver, this._graph);

        const relations = Promise.all(result.records.map(async (record) => {
            const data: {id: string, name: string} = record.get("data");
            const from: {id: string} = record.get("from");
            const to: {id: string} = record.get("to");

            const relation = new Relation(
                (await nm.findBy({id: from.id}))!, 
                (await nm.findBy({id: to.id}))!, 
                data.name, 
                data.id
            );

            return relation;
        }));

        return relations;
    }

    async findBy({ id }: {id: string}): Promise<Relation | null> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1:Node)
            MATCH (g)-[:CONTAINS]->(n2:Node)
            WHERE n1 <> n2
            MATCH (n1)-[rel:RELATION]->(n2)
            WHERE rel.id = $data.id
            RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
        `, parameters);

        if (result.records.length === 0)
            return null;

        const nm = new NodeMapper(this._driver, this._graph);

        const data: {id: string, name: string} = result.records[0].get("data");
        const from: {id: string} = result.records[0].get("from");
        const to: {id: string} = result.records[0].get("to");

        const relation = new Relation(
            (await nm.findBy({id: from.id}))!, 
            (await nm.findBy({id: to.id}))!, 
            data.name, 
            data.id
        );

        return relation;
    }

    async save(relation: Relation): Promise<void> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                fromId: relation.from.id,
                toId: relation.to.id,
                name: relation.name,
                id: relation.id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1) 
            WHERE n1.id = $data.fromId
            MATCH (g)-[:CONTAINS]->(n2)
            WHERE n2.id = $data.toId
            MERGE (n1)-[rel:RELATION {id: $data.id}]->(n2)
            SET rel.name = $data.name
            RETURN g, n1, n2, rel
        `, parameters);
    }

    async destroy(relation: Relation): Promise<void> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                fromId: relation.from.id,
                toId: relation.to.id,
                name: relation.name,
                id: relation.id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1) 
            WHERE n1.id = $data.fromId
            MATCH (g)-[:CONTAINS]->(n2)
            WHERE n2.id = $data.toId
            MATCH (n1)-[rel:RELATION]->(n2)
            WHERE rel.id = $data.id
            DELETE rel
        `, parameters);
    }
}

export default RelationMapper;