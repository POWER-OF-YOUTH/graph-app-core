"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const uuid_1 = require("uuid");
const variable_1 = require("./variable");
const template_representation_1 = require("./template_representation");
class Template {
    constructor(name, variables, representation = new template_representation_1.TemplateRepresentation(), id = uuid_1.v4()) {
        this._variablesMap = new Map();
        for (let variable of variables)
            this._variablesMap.set(variable.name, variable);
        this._name = name;
        this._representation = representation;
        this._id = id;
    }
    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    get representation() {
        return this._representation;
    }
    set representation(value) {
        this._representation = value;
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
    static fromJSON(data) {
        return new Template(data.name, data.variables.map(v => variable_1.Variable.fromJSON(v)), template_representation_1.TemplateRepresentation.fromJSON(data.representation), data.id);
    }
    toJSON() {
        return {
            name: this._name,
            id: this._id,
            representation: this._representation.toJSON(),
            variables: this.variables().map(v => v.toJSON())
        };
    }
}
exports.Template = Template;
exports.default = Template;
