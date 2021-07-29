import { Driver } from 'neo4j-driver';
import Graph from './graph';
import Mapper from './mapper';
import Node from './node';
import Template from './template';
declare class NodeMapper extends Mapper<Node> {
    private readonly _graph;
    private readonly _variableSerializer;
    private readonly _nodeSerializer;
    constructor(driver: Driver, graph: Graph);
    all(): Promise<Array<Node>>;
    where({ template }: {
        template: Template;
    }): Promise<Array<Node>>;
    findBy({ id }: {
        id: string;
    }): Promise<Node | null>;
    save(node: Node): Promise<void>;
    destroy(node: Node): Promise<void>;
}
export default NodeMapper;
