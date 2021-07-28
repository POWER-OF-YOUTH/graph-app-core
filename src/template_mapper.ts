import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import IMapper from './i_mapper';
import Template from './template';
import TemplateRepresentation from './template_representation';
import Variable from './variable';
import VariableMaker from './variable_maker';

class TemplateMapper implements IMapper<Template>
{
    private readonly _driver: Driver;
    private readonly _graph: Graph;

    constructor(driver: Driver, graph: Graph) {
        this._driver = driver;
        this._graph = graph;
    }

    get driver(): Driver {
        return this._driver;
    }

    async all(): Promise<Array<Template>> {
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
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS data, collect(properties(v)) AS variables
            `, parameters);
            session.close();

            const templates = dbResponse.records.map(record => {
                const data: { name: string, id: string, representation: string } = record.get("data");
                const variables: Array<{name: string, type: string, data: string}> = record.get("variables");
                const template = new Template(
                    data.name, 
                    variables.map(data => VariableMaker.make(data)), 
                    TemplateRepresentation.fromJSON(data.representation), 
                    data.id
                );

                return template;
            });

            return templates;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    async findBy({ id }: { id: string }): Promise<Template | null> {
        try {
            const session = this._driver.session();
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    id
                }
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.id = $data.id
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS data, collect(properties(v)) AS variables
            `, parameters);
            session.close();

            if (dbResponse.records.length === 0)
                return null;

            const data: { name: string, id: string, representation: string } = dbResponse.records[0].get("data");
            const variables: Array<{name: string, type: string, data: string}> = dbResponse.records[0].get("variables");
            const template = new Template(
                data.name, 
                variables.map(data => VariableMaker.make(data)), 
                TemplateRepresentation.fromJSON(data.representation), 
                data.id
            );

            return template;
        }   
        catch (err) {
            throw new DatabaseError();
        }
    }

    async save(template: Template): Promise<void> {
        try {
            const session = this._driver.session();
            const parameters = { 
                data: { 
                    graphId: this._graph.id,
                    id: template.id,
                    variables: template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) } })
                } 
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MERGE (g)-[:CONTAINS]-(t:Template { id: $data.id })
                FOREACH (variable IN $data.variables | 
                    MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                    SET v = variable)
            `, parameters);
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    async destroy(template: Template): Promise<void> {
        if (template == null)
            throw new Error("Null reference exception!");
        if (await this.hasImplementedNodes(template))
            throw new DatabaseError("Template has implemented nodes!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: { 
                    graphId: this._graph.id,
                    id: template.id,
                } 
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.id = $data.id
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                DETACH DELETE v, t
            `, parameters);
            session.close();
        }
        catch (err) {
            throw new DatabaseError();
        }
    }

    private async hasImplementedNodes(template: Template): Promise<boolean> {
        if (template == null)
            throw new Error("Null reference exception!");
        try {
            const session = this._driver.session();
            const parameters = { 
                data: { 
                    graphId: this._graph.id,
                    id: template.id,
                } 
            }
            const dbResponse = await session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.id = $data.id
                MATCH (n:Node)-[:REALIZE]->(t)
                RETURN n LIMIT 1
            `, parameters);
            session.close();

            return dbResponse.records.length > 0;
        }
        catch (err) {
            throw new DatabaseError();
        }
    }
}

export default TemplateMapper;
