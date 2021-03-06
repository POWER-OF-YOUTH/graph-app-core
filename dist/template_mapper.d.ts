import { Driver } from 'neo4j-driver';
import Graph from './graph';
import IMapper from './i_mapper';
import Template from './template';
declare class TemplateMapper implements IMapper<Template> {
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
     * @returns {Promise<Array<Template>>}
     */
    all(): Promise<Array<Template>>;
    /**
     *
     * @param {{id: string}} d
     * @returns {Promise<Template | null>}
     */
    findBy(d: {
        name: string;
    }): Promise<Template | null>;
    /**
     *
     * @param {Template} template
     * @returns {Promise<void>}
     */
    save(template: Template): Promise<void>;
    /**
     *
     * @param {Template} template
     * @returns {Promise<void>}
     */
    destroy(template: Template): Promise<void>;
    /**
     *
     * @private
     * @param {Template} template
     * @returns {Promise<boolean>}
     */
    private hasImplementedNodes;
}
export default TemplateMapper;
