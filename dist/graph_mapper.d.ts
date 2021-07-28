import { Driver } from 'neo4j-driver';
import IMapper from './i_mapper';
import Graph from './graph';
declare class GraphMapper implements IMapper<Graph> {
    private readonly _driver;
    constructor(driver: Driver);
    get driver(): Driver;
    all(): Promise<Array<Graph>>;
    findBy({ id }: {
        id: string;
    }): Promise<Graph | null>;
    save(graph: Graph): Promise<void>;
    destroy(graph: Graph): Promise<void>;
}
export default GraphMapper;
