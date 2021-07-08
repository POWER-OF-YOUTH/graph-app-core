import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import IMapper from './i_mapper';
import Template from './template';

class TemplateMapper implements IMapper<Template>
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
     * @param {Template} template
     * @returns {Promise<void>}
     */
    async save(template: Template): Promise<void> {
        if (template == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: { 
                    graphId: this._graph.id,
                    name: template.name,
                    variables: template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) } })
                } 
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MERGE (g)-[:CONTAINS]-(t:Template { name: $data.name })
                FOREACH (variable IN $data.variables | 
                    MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                    SET v = variable)
            `, parameters)
            session.close();
        }
        catch (err) {
            console.log(err);
            throw new DatabaseError();
        }
    }

    /**
     * 
     * @param {Template} template
     * @returns {Promise<void>}
     */
    async destroy(template: Template): Promise<void> {
        if (template == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: { 
                    graphId: this._graph.id,
                    name: template.name,
                } 
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.name = $data.name
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                DETACH DELETE v, t
            `, parameters);
            session.close();
        }
        catch (err) {
            console.log(err);
            throw new DatabaseError();
        }
    }
}

export default TemplateMapper