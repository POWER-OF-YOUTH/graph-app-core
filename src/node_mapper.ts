import { Driver } from 'neo4j-driver';

import DatabaseError from './database_error';
import Graph from './graph';
import Mapper from './mapper';
import Node from './node';
import Template from './template';
import TemplateMapper from './template_mapper';
import VariableMaker from './variable_maker';

class NodeMapper extends Mapper<Node>
{
    private readonly _graph: Graph;

    constructor(driver: Driver, graph: Graph) {
        super(driver);

        this._graph = graph;
    }

    async all(): Promise<Array<Node>> {
        const parameters = { 
            data: {
                graphId: this._graph.id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            MATCH (n)-[:REALIZE]->(t:Template)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);

        const tm = new TemplateMapper(this._driver, this._graph);

        const nodes = await Promise.all(result.records.map(async (record) => {
            const template: {id: string, name: string, representation: string} = record.get("template"); 
            const data: {id: string, x: number, y: number} = record.get("data");
            const variables: Array<{name: string, type: string, data: string}> = record.get("variables");

            const node = new Node(
                (await tm.findBy({id: template.id}))!, 
                data.x, 
                data.y, 
                data.id,
                variables.map(data => VariableMaker.make(data))
            );
    
            return node
        }));

        return nodes;
    }

    async where({ template }: {template: Template}): Promise<Array<Node>> {
        const parameters = { 
            data: {
                graphId: this._graph.id,
                templateName: template.name
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            MATCH (n)-[:REALIZE]->(t:Template)
            WHERE t.name = $data.templateName
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);

        const nodes = await Promise.all(result.records.map(async (record) => {
            const data: {id: string, x: number, y: number} = record.get("data");
            const variables: Array<{name: string, type: string, data: string}> = record.get("variables");

            const node = new Node(
                template, 
                data.x, 
                data.y, 
                data.id,
                variables.map(data => VariableMaker.make(data))
            );
    
            return node
        }));

        return nodes;
    }

    async findBy({ id }: {id: string}): Promise<Node | null> {
        const parameters = { 
            data: {
                graphId: this._graph.id,
                id
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            WHERE g.id = $data.graphId AND n.id = $data.id
            MATCH (n)-[:REALIZE]->(t:Template)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);

        if (result.records.length == 0)
            return null;

        const tm = new TemplateMapper(this._driver, this._graph);

        const template: {id: string, name: string, representation: string} = result.records[0].get("template"); 
        const data: {id: string, x: number, y: number} = result.records[0].get("data");
        const variables: Array<{name: string, type: string, data: string}> = result.records[0].get("variables");

        const node = new Node(
            (await tm.findBy({id: template.id}))!, 
            data.x, 
            data.y, 
            data.id,
            variables.map(data => VariableMaker.make(data))
        );

        return node
    }

    async save(node: Node): Promise<void> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                templateName: node.template.name,
                id: node.id,
                x: node.x,
                y: node.y,
                variables: node.template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) } })
            }
        };
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $data.graphId AND t.name = $data.templateName
            MERGE (g)-[:CONTAINS]->(n:Node { id: $data.id })
            MERGE (n)-[:REALIZE]->(t)
            FOREACH (variable IN $data.variables | 
                MERGE (n)-[:HAVE]->(v:Variable { name: variable.name })
                SET v = variable)
        `, parameters);
    }

    async destroy(node: Node): Promise<void> {
        const parameters = {
            data: {
                graphId: this._graph.id,
                id: node.id
            }
        }
        const result = await this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            WHERE g.id = $data.graphId AND n.id = $data.id
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            DETACH DELETE v, n
        `, parameters);
    }
}

export default NodeMapper;