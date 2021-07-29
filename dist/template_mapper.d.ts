import { Driver } from 'neo4j-driver';
import Graph from './graph';
import Mapper from './mapper';
import Template from './template';
declare class TemplateMapper extends Mapper<Template> {
    private readonly _graph;
    private readonly _variableSerializer;
    private readonly _templateSerializer;
    constructor(driver: Driver, graph: Graph);
    all(): Promise<Array<Template>>;
    findBy({ id }: {
        id: string;
    }): Promise<Template | null>;
    save(template: Template): Promise<void>;
    destroy(template: Template): Promise<void>;
    private hasImplementedNodes;
}
export default TemplateMapper;
