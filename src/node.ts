import { v4 as uuid } from 'uuid';

import Template from './template';
import Variable from './variable';

class Node
{
    private readonly _variablesMap: Map<string, Variable>;
    private readonly _template: Template;
    private readonly _id: string;

    /**
     * 
     * @param {Array<Variable>} variables
     * @param {string} name
     */
    constructor(template: Template, id: string = uuid()) {
        if (template == null || id == null)
            throw new Error("Null reference exception!");

        const variables: Array<Variable> = template.variables();
        this._variablesMap = new Map<string, Variable>();
        for (let variable of variables)
            this._variablesMap.set(variable.name, variable);
        this._template = template;
        this._id = id;
    }

    /**
     * 
     * @returns {string}
     */
    get id(): string {
        return this._id;
    }

    /**
     * 
     * @returns {Template}
     */
    get template(): Template {
        return this._template;
    }

    /**
     * 
     * @param {string} name
     * @requires {Variable}
     */
     variable(name: string): Variable | undefined {
        if (name == null)
            throw new Error("Null reference exception!");
        
        return this._variablesMap.get(name);
    }

    /**
     * 
     * @returns {Array<Variable}
     */
    variables(): Array<Variable> {
        const variablesIter = this._variablesMap.values();
        const variables: Array<Variable> = [];
        for (let variable of variablesIter)
            variables.push(variable)
        
        return variables;
    }
}

export default Node;