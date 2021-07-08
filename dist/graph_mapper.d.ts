import { Driver } from 'neo4j-driver';
import IMapper from './i_mapper';
import Graph from './graph';
declare class GraphMapper implements IMapper<Graph> {
    private readonly _driver;
    /**
     *
     * @param {Driver} driver
     */
    constructor(driver: Driver);
    /**
     * @returns {Driver}
     */
    get driver(): Driver;
    /**
     *
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    save(graph: Graph): Promise<void>;
    /**
     *
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    destroy(graph: Graph): Promise<void>;
}
export default GraphMapper;
