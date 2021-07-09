"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Node {
    /**
     *
     * @param {Array<Variable>} variables
     * @param {string} name
     */
    constructor(template, id = uuid_1.v4()) {
        if (template == null || id == null)
            throw new Error("Null reference exception!");
        const variables = template.variables();
        this._variablesMap = new Map();
        for (let variable of variables)
            this._variablesMap.set(variable.name, variable);
        this._template = template;
        this._id = id;
    }
    /**
     *
     * @returns {string}
     */
    get id() {
        return this._id;
    }
    /**
     *
     * @returns {Template}
     */
    get template() {
        return this._template;
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
exports.default = Node;
