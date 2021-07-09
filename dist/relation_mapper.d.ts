import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Relation from './relation';
declare class RelationMapper implements IMapper<Relation> {
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
     * @param {Relation}
     * @returns {Promise<void>}
     */
    save(relation: Relation): Promise<void>;
    /**
     *
     * @param {Relation} relation
     * @returns {Promise<void>}
     */
    destroy(relation: Relation): Promise<void>;
}
export default RelationMapper;
