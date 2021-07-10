import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
import Template from './template';
import TemplateMapper from './template_mapper';
import VariableMaker from './variable_maker';

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
     * @returns {Promise<Array<Node>>}
     */
     async all(): Promise<Array<Node>> {
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
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                MATCH (n)-[:REALIZE]->(t:Template)
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
            `, parameters);
            session.close();

            const tm = new TemplateMapper(this._driver, this._graph);

            const nodes = await Promise.all(dbResponse.records.map(async (record) => {
                const template: {name: string} = record.get("template"); 
                const data: {id: string} = record.get("data");
                const variables: Array<{name: string, type: string, data: string}> = record.get("variables");

                const node = new Node((await tm.findBy({name: template.name}))!, data.id)
        
                return node
            }));

            return nodes;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    async where(d: {template: Template | undefined}) {
        if (d == null || d.template == null) 
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: {
                    graphId: this._graph.id,
                    templateName: d.template.name
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                MATCH (n)-[:REALIZE]->(t:Template)
                WHERE t.name = $data.templateName
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
            `, parameters);
            session.close();

            const nodes = await Promise.all(dbResponse.records.map(async (record) => {
                const data: {id: string} = record.get("data");
                const variables: Array<{name: string, type: string, data: string}> = record.get("variables");

                const node = new Node(d.template!, data.id)
        
                return node
            }));

            return nodes;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {{id: string}} d
     * @returns {Promise<Node | null>}
     */
    async findBy(d: {id: string}): Promise<Node | null> {
        if (d == null || d.id == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: {
                    graphId: this._graph.id,
                    id: d.id
                }
            };
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                WHERE g.id = $data.graphId AND n.id = $data.id
                MATCH (n)-[:REALIZE]->(t:Template)
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
            `, parameters);
            session.close();

            if (dbResponse.records.length == 0)
                return null;

            const tm = new TemplateMapper(this._driver, this._graph);

            const template: {name: string} = dbResponse.records[0].get("template"); 
            const data: {id: string} = dbResponse.records[0].get("data");
            const variables: Array<{name: string, type: string, data: string}> = dbResponse.records[0].get("variables");

            const node = new Node((await tm.findBy({name: template.name}))!, data.id)
    
            return node
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