import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import Mapper from './mapper';
import Template from './template';
import TemplateRepresentation from './template_representation';
import TemplateSerializer from './template_serializer';
import Variable from './variable';
import VariableSerializer from './variable_serializer';

class TemplateMapper extends Mapper<Template>
{
    private readonly _graph: Graph;
    private readonly _variableSerializer = new VariableSerializer();
    private readonly _templateSerializer = new TemplateSerializer();

    constructor(driver: Driver, graph: Graph) {
        super(driver);

        this._graph = graph;
    }

    async all(): Promise<Array<Template>> {
        const parameters = { 
            graphId: this._graph.id,
            data: { }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS data, collect(properties(v)) AS variables
        `, parameters);

        const templates = result.records.map(record => {
            const data = record.get("data");
            // @ts-ignore
            const variables = record.get("variables").map(v => this._variableSerializer.deserialize(v));

            const template = this._templateSerializer.deserialize({ data, variables });

            return template;
        });

        return templates;
    }

    async findBy({ id }: { id: string }): Promise<Template | null> {
        const parameters = {
            graphId: this._graph.id,
            data: {
                id
            }
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $data.id
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS data, collect(properties(v)) AS variables
        `, parameters);

        if (result.records.length === 0)
            return null;

        const data = result.records[0].get("data");
        // @ts-ignore
        const variables = result.records[0].get("variables").map(v => this._variableSerializer.deserialize(v));
        const template = this._templateSerializer.deserialize({ data, variables });

        return template;
    }

    async save(template: Template): Promise<void> {
        const parameters = { 
            graphId: this._graph.id,
            data: this._templateSerializer.serialize(template),
            variables: template.variables().map(v => this._variableSerializer.serialize(v))
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MERGE (g)-[:CONTAINS]-(t:Template { id: $data.id })
            SET t = $data
            FOREACH (variable IN $variables | 
                MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                SET v = variable)
        `, parameters);
    }

    async destroy(template: Template): Promise<void> {
        if (await this.hasImplementedNodes(template))
            throw new DatabaseError("Template has implemented nodes!");
        const parameters = { 
            graphId: this._graph.id,
            data: this._templateSerializer.serialize(template)
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $data.id
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            DETACH DELETE v, t
        `, parameters);
    }

    private async hasImplementedNodes(template: Template): Promise<boolean> {
        const parameters = { 
            graphId: this._graph.id,
            data: this._templateSerializer.serialize(template)
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $data.id
            MATCH (n:Node)-[:REALIZE]->(t)
            RETURN n LIMIT 1
        `, parameters);

        return result.records.length > 0;
    }
}

export default TemplateMapper;
