"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
class Variable {
    constructor(name, value) {
        this._name = name;
        this._value = value;
    }
    get name() {
        return this._name;
    }
    get value() {
        return this._value;
    }
    toJSON() {
        return {
            name: this._name,
            value: { type: this._value.type.name, data: this._value.data }
        };
    }
}
exports.Variable = Variable;
exports.default = Variable;
