import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
import Template from './template';
declare class NodeMapper implements IMapper<Node> {
    private readonly _driver;
    private readonly _graph;
    constructor(driver: Driver, graph: Graph);
    get driver(): Driver;
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
