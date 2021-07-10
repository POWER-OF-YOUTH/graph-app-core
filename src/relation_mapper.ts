import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
import NodeMapper from './node_mapper';
import Relation from './relation';

class RelationMapper implements IMapper<Relation> 
{
    private readonly _driver: Driver;
    private readonly _graph: Graph;

    /**
     * 
     * @param {Driver} driver
     * @param {Graph} graph
     */
    constructor(driver: Driver, graph: Graph) {
        if (driver == null || graph == null)
            throw new Error("Null reference exception!");

        this._driver = driver;
        this._graph = graph;
    }

    /**
     * 
     * @returns {Driver}
     */
    get driver(): Driver {
        return this._driver;
    }

    /**
     * 
     * @returns {Promise<Array<Relation>>}
     */
    async all(): Promise<Array<Relation>> {
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MATCH (g)-[:CONTAINS]->(n1:Node)
                MATCH (g)-[:CONTAINS]->(n2:Node)
                WHERE n1 <> n2
                MATCH (n1)-[rel:RELATION]->(n2)
                RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
            `, parameters);
            session.close();

            const nm = new NodeMapper(this._driver, this._graph);

            const relations = Promise.all(dbResponse.records.map(async (record) => {
                const data: {id: string, name: string} = record.get("data");
                const from: {id: string} = record.get("from");
                const to: {id: string} = record.get("to");

                const relation = new Relation((await nm.findBy({id: from.id}))!, (await nm.findBy({id: to.id}))!, data.name, data.id);

                return relation;
            }));

            return relations;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {from: Node | undefined, to: Node | undefined} d
     * @returns {Promise<Array<Relation>>}
     */
    async where(d: {from: Node | undefined, to: Node | undefined}): Promise<Array<Relation>> {
        if (d == null || (d.from == null && d.to == null))
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    fromId: d.from,
                    toId: d.to
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MATCH (g)-[:CONTAINS]->(n1:Node)
                ${d.from ? "WHERE n1.id = $data.fromId" : ""}
                MATCH (g)-[:CONTAINS]->(n2:Node)
                ${d.to ? "WHERE n2.id = $data.toId": ""}
                MATCH (n1)-[rel:RELATION]->(n2)
                WHERE n1 <> n2
                RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
            `, parameters);
            session.close();

            const nm = new NodeMapper(this._driver, this._graph);

            const relations = Promise.all(dbResponse.records.map(async (record) => {
                const data: {id: string, name: string} = record.get("data");
                const from: {id: string} = record.get("from");
                const to: {id: string} = record.get("to");

                const relation = new Relation((await nm.findBy({id: from.id}))!, (await nm.findBy({id: to.id}))!, data.name, data.id);

                return relation;
            }));

            return relations;
        }
        catch (err) {
            console.log(err);
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {{id: string}} d
     * @returns {Promise<Relation | null>}
     */
    async findBy(d: {id: string}): Promise<Relation | null> {
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    id: d.id
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MATCH (g)-[:CONTAINS]->(n1:Node)
                MATCH (g)-[:CONTAINS]->(n2:Node)
                WHERE n1 <> n2
                MATCH (n1)-[rel:RELATION]->(n2)
                WHERE rel.id = $data.id
                RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
            `, parameters);
            session.close();

            if (dbResponse.records.length === 0)
                return null;

            const nm = new NodeMapper(this._driver, this._graph);

            const data: {id: string, name: string} = dbResponse.records[0].get("data");
            const from: {id: string} = dbResponse.records[0].get("from");
            const to: {id: string} = dbResponse.records[0].get("to");

            const relation = new Relation((await nm.findBy({id: from.id}))!, (await nm.findBy({id: to.id}))!, data.name, data.id);

            return relation;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Relation}
     * @returns {Promise<void>}
     */
    async save(relation: Relation): Promise<void> {
        if (relation == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    fromId: relation.from.id,
                    toId: relation.to.id,
                    name: relation.name,
                    id: relation.id
                }
            };
            const dbResponse = await session.run(`
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
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Relation} relation
     * @returns {Promise<void>}
     */
    async destroy(relation: Relation): Promise<void> {
        if (relation == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    fromId: relation.from.id,
                    toId: relation.to.id,
                    name: relation.name,
                    id: relation.id
                }
            };
            const dbResponse = await session.run(`
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
            session.close()
        }
        catch(err) {
            console.log(err);
            throw new DatabaseError();
        }
    }
}

export default RelationMapper;