import Variable from './variable';
declare class Template {
    private readonly _variablesMap;
    private readonly _name;
    /**
     *
     * @param {Array<Variable>} variables
     * @param {string} name
     */
    constructor(variables: Array<Variable>, name: string);
    /**
     *
     * @returns {string}
     */
    get name(): string;
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
export default Template;
