import { Driver } from 'neo4j-driver';
import Graph from './graph';
import Mapper from './mapper';
import Node from './node';
import Relation from './relation';
declare class RelationMapper extends Mapper<Relation> {
    private readonly _graph;
    constructor(driver: Driver, graph: Graph);
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
