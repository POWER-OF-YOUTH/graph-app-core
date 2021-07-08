import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
import Template from './template';
import TemplateMapper from './template_mapper';

class NodeMapper implements IMapper<Node>
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
     * @param {Node} node
     * @returns {Promise<void>}
     */
    async save(node: Node): Promise<void> {
        if (node == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    templateName: node.template.name,
                    id: node.id,
                    variables: node.template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) } })
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.name = $data.templateName
                MERGE (g)-[:CONTAINS]->(n:Node { id: $data.id })
                MERGE (n)-[:REALIZE]->(t)
                FOREACH (variable IN $data.variables | 
                    MERGE (n)-[:HAVE]->(v:Variable { name: variable.name })
                    SET v = variable)
            `, parameters);
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Node} node
     * @returns {Promise<void>}
     */
    async destroy(node: Node): Promise<void> {
        if (node == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    id: node.id
                }
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                WHERE g.id = $data.graphId AND n.id = $data.id
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                DETACH DELETE v, n
            `, parameters);
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
}

export default NodeMapper;