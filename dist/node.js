"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const uuid_1 = require("uuid");
class Node {
    constructor(template, x, y, id = uuid_1.v4(), variables = null) {
        if (variables === null)
            variables = template.variables();
        this._variablesMap = new Map(variables.map(v => [v.name, v]));
        this._template = template;
        this._x = x;
        this._y = y;
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get template() {
        return this._template;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    variable(name) {
        return this._variablesMap.get(name);
    }
    variables() {
        const variablesIter = this._variablesMap.values();
        const variables = [];
        for (let variable of variablesIter)
            variables.push(variable);
        return variables;
    }
    toJSON() {
        return {
            id: this._id,
            template: this._template.toJSON(),
            variables: this.variables().map(v => v.toJSON()),
            x: this._x,
            y: this._y
        };
    }
}
exports.Node = Node;
exports.default = Node;
