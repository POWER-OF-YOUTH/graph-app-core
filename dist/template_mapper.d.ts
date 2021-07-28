import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Template from './template';
declare class TemplateMapper implements IMapper<Template> {
    private readonly _driver;
    private readonly _graph;
    constructor(driver: Driver, graph: Graph);
    get driver(): Driver;
    all(): Promise<Array<Template>>;
    findBy({ id }: {
        id: string;
    }): Promise<Template | null>;
    save(template: Template): Promise<void>;
    destroy(template: Template): Promise<void>;
    private hasImplementedNodes;
}
export default TemplateMapper;
