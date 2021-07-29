import { Driver } from 'neo4j-driver';
import Mapper from './mapper';
import Graph from './graph';
declare class GraphMapper extends Mapper<Graph> {
    private readonly _graphSerializer;
    constructor(driver: Driver);
    all(): Promise<Array<Graph>>;
    findBy({ id }: {
        id: string;
    }): Promise<Graph | null>;
    save(graph: Graph): Promise<void>;
    destroy(graph: Graph): Promise<void>;
}
export default GraphMapper;
