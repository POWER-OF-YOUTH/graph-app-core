"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
const uuid_1 = require("uuid");
class Graph {
    constructor(name, description, id = uuid_1.v4(), date = Date.now()) {
        this._name = name;
        this._description = description;
        this._id = id;
        this._date = date;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get id() {
        return this._id;
    }
    get date() {
        return this._date;
    }
    static fromJSON(data) {
        return new Graph(data.name, data.description, data.id, data.date);
    }
    toJSON() {
        return {
            id: this._id,
            name: this._name,
            description: this._description,
            date: this._date
        };
    }
}
exports.Graph = Graph;
exports.default = Graph;
