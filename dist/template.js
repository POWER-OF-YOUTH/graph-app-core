"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Template {
    /**
     *
     * @param {Array<Variable>} variables
     * @param {string} name
     */
    constructor(variables, name) {
        if (variables == null || name == null)
            throw new Error("Null reference exception!");
        this._variablesMap = new Map();
        for (let variable of variables)
            this._variablesMap.set(variable.name, variable);
        this._name = name;
    }
    /**
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }
    /**
     *
     * @param {string} name
     * @requires {Variable}
     */
    variable(name) {
        if (name == null)
            throw new Error("Null reference exception!");
        return this._variablesMap.get(name);
    }
    /**
     *
     * @returns {Array<Variable}
     */
    variables() {
        const variablesIter = this._variablesMap.values();
        const variables = [];
        for (let variable of variablesIter)
            variables.push(variable);
        return variables;
    }
}
exports.default = Template;
