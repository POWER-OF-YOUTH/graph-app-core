import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import Mapper from './mapper';
import Template from './template';
import TemplateRepresentation from './template_representation';
import Variable from './variable';
import VariableMaker from './variable_maker';

class TemplateMapper extends Mapper<Template>
{
    private readonly _graph: Graph;

    constructor(driver: Driver, graph: Graph) {
        super(driver);

        this._graph = graph;
    }

    async all(): Promise<Array<Template>> {
        const parameters = { 
            data: {
                graphId: this._graph.id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS data, collect(properties(v)) AS variables
        `, parameters);

        const templates = result.records.map(record => {
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

    async findBy({ id }: { id: string }): Promise<Template | null> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                id
            }
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $data.graphId AND t.id = $data.id
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS data, collect(properties(v)) AS variables
        `, parameters);

        if (result.records.length === 0)
            return null;

        const data: { name: string, id: string, representation: string } = result.records[0].get("data");
        const variables: Array<{name: string, type: string, data: string}> = result.records[0].get("variables");
        const template = new Template(
            data.name, 
            variables.map(data => VariableMaker.make(data)), 
            TemplateRepresentation.fromJSON(data.representation), 
            data.id
        );

        return template;
    }

    async save(template: Template): Promise<void> {
        const parameters = { 
            data: { 
                graphId: this._graph.id,
                id: template.id,
                variables: template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) } })
            } 
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MERGE (g)-[:CONTAINS]-(t:Template { id: $data.id })
            FOREACH (variable IN $data.variables | 
                MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                SET v = variable)
        `, parameters);
    }

    async destroy(template: Template): Promise<void> {
        if (await this.hasImplementedNodes(template))
            throw new DatabaseError("Template has implemented nodes!");
        const parameters = { 
            data: { 
                graphId: this._graph.id,
                id: template.id,
            } 
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $data.graphId AND t.id = $data.id
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            DETACH DELETE v, t
        `, parameters);
    }

    private async hasImplementedNodes(template: Template): Promise<boolean> {
        const parameters = { 
            data: { 
                graphId: this._graph.id,
                id: template.id,
            } 
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $data.graphId AND t.id = $data.id
            MATCH (n:Node)-[:REALIZE]->(t)
            RETURN n LIMIT 1
        `, parameters);

        return result.records.length > 0;
    }
}

export default TemplateMapper;
