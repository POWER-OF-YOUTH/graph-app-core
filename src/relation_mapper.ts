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