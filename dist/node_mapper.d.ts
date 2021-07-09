import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
declare class NodeMapper implements IMapper<Node> {
    private readonly _driver;
    private readonly _graph;
    /**
     *
     * @param {Driver} driver
     * @param {Graph} graph
     */
    constructor(driver: Driver, graph: Graph);
    /**
     *
     * @returns {Driver}
     */
    get driver(): Driver;
    /**
     *
     * @returns {Promise<Array<Node>>}
     */
    all(): Promise<Array<Node>>;
    /**
     *
     * @param {{id: string}} d
     * @returns {Promise<Node | null>}
     */
    findBy(d: {
        id: string;
    }): Promise<Node | null>;
    /**
     *
     * @param {Node} node
     * @returns {Promise<void>}
     */
    save(node: Node): Promise<void>;
    /**
     *
     * @param {Node} node
     * @returns {Promise<void>}
     */
    destroy(node: Node): Promise<void>;
}
export default NodeMapper;
