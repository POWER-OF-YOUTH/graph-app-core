import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Node from './node';
import Relation from './relation';
declare class RelationMapper implements IMapper<Relation> {
    private readonly _driver;
    private readonly _graph;
    constructor(driver: Driver, graph: Graph);
    get driver(): Driver;
    all(): Promise<Array<Relation>>;
    where({ from, to }: {
        from: Node | undefined;
        to: Node | undefined;
    }): Promise<Array<Relation>>;
    findBy({ id }: {
        id: string;
    }): Promise<Relation | null>;
    save(relation: Relation): Promise<void>;
    destroy(relation: Relation): Promise<void>;
}
export default RelationMapper;
