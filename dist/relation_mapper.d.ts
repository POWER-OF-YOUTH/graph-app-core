import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
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
     * @returns {Promise<Array<Relation>>}
     */
    all(): Promise<Array<Relation>>;
    /**
     *
     * @param {from: Node | undefined, to: Node | undefined} d
     * @returns {Promise<Array<Relation>>}
     */
    where(d: {
        from: Node | undefined;
        to: Node | undefined;
    }): Promise<Array<Relation>>;
    /**
     *
     * @param {{id: string}} d
     * @returns {Promise<Relation | null>}
     */
    findBy(d: {
        id: string;
    }): Promise<Relation | null>;
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
