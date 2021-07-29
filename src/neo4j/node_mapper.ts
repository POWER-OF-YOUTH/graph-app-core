import { Driver } from 'neo4j-driver';

import Graph from './graph';
import Mapper from './mapper';
import Node from './node';
import NodeSerializer from './node_serializer';
import Template from './template';
import TemplateMapper from './template_mapper';
import VariableSerializer from './variable_serializer';

class NodeMapper extends Mapper<Node>
{
    private readonly _graph: Graph;
    private readonly _variableSerializer = new VariableSerializer();
    private readonly _nodeSerializer = new NodeSerializer();

    constructor(driver: Driver, graph: Graph) {
        super(driver);

        this._graph = graph;
    }

    async all(): Promise<Array<Node>> {
        const parameters = {
            graphId: this._graph.id,
            data: { }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            MATCH (n)-[:REALIZE]->(t:Template)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);

        const tm = new TemplateMapper(this._driver, this._graph);

        const nodes = await Promise.all(result.records.map(async (record) => {
            const templateData: {id: string, name: string, representation: string} = record.get("template"); 
            const template = (await tm.findBy({ id: templateData.id }))!;
            const data: {id: string, x: number, y: number} = record.get("data");
            // @ts-ignore
            const variables = record.get("variables").map(v => this._variableSerializer.deserialize(v));

            const node = this._nodeSerializer.deserialize({ data, template, variables });
    
            return node;
        }));

        return nodes;
    }

    async where({ template }: {template: Template}): Promise<Array<Node>> {
        const parameters = { 
            graphId: this._graph.id,
            templateName: template.name,
            data: { }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            MATCH (n)-[:REALIZE]->(t:Template)
            WHERE t.name = $templateName
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);

        const nodes = await Promise.all(result.records.map(async (record) => {
            const data: {id: string, x: number, y: number} = record.get("data");
            // @ts-ignore
            const variables = record.get("variables").map(v => this._variableSerializer.deserialize(v));

            const node = this._nodeSerializer.deserialize({ data, template, variables });
    
            return node;
        }));

        return nodes;
    }

    async findBy({ id }: {id: string}): Promise<Node | null> {
        const parameters = { 
            graphId: this._graph.id,
            data: {
                id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            WHERE g.id = $graphId AND n.id = $data.id
            MATCH (n)-[:REALIZE]->(t:Template)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);

        if (result.records.length == 0)
            return null;

        const tm = new TemplateMapper(this._driver, this._graph);

        const templateData: {id: string, name: string, representation: string} = result.records[0].get("template"); 
        const template = (await tm.findBy({ id: templateData.id }))!;
        const data: {id: string, x: number, y: number} = result.records[0].get("data");
        // @ts-ignore
        const variables = result.records[0].get("variables").map(v => this._variableSerializer.deserialize(v));

        const node = this._nodeSerializer.deserialize({ data, template, variables });

        return node;
    }

    async save(node: Node): Promise<void> {
        const parameters = {
            graphId: this._graph.id,
            templateId: node.template.id,
            data: this._nodeSerializer.serialize(node),
            variables: node.variables().map(v => this._variableSerializer.serialize(v))
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $templateId
            MERGE (g)-[:CONTAINS]->(n:Node { id: $data.id })
            SET n = $data
            MERGE (n)-[:REALIZE]->(t)
            FOREACH (variable IN $variables | 
                MERGE (n)-[:HAVE]->(v:Variable { name: variable.name })
                SET v = variable)
        `, parameters);
    }

    async destroy(node: Node): Promise<void> {
        const parameters = {
            graphId: this._graph.id,
            data: this._nodeSerializer.serialize(node)
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            WHERE g.id = $graphId AND n.id = $data.id
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            DETACH DELETE v, n
        `, parameters);
    }
}

export default NodeMapper;