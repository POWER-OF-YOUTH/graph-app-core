"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
const uuid_1 = require("uuid");
class Relation {
    constructor(from, to, name, id = uuid_1.v4()) {
        this._from = from;
        this._to = to;
        this._name = name;
        this._id = id;
    }
    get from() {
        return this._from;
    }
    get to() {
        return this._to;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get id() {
        return this._id;
    }
    toJSON() {
        return {
            id: this._id,
            name: this._name,
            from: this._from.toJSON(),
            to: this._to.toJSON()
        };
    }
}
exports.Relation = Relation;
exports.default = Relation;
