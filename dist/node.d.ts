import Template from './template';
import Variable from './variable';
declare class Node {
    private readonly _variablesMap;
    private readonly _template;
    private readonly _id;
    /**
     *
     * @param {Array<Variable>} variables
     * @param {string} name
     */
    constructor(template: Template, id?: string);
    /**
     *
     * @returns {string}
     */
    get id(): string;
    /**
     *
     * @returns {Template}
     */
    get template(): Template;
    /**
     *
     * @param {string} name
     * @requires {Variable}
     */
    variable(name: string): Variable | undefined;
    /**
     *
     * @returns {Array<Variable}
     */
    variables(): Array<Variable>;
}
export default Node;
