"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Variable {
    /**
     *
     * @param {string} name
     * @param {IValue} value
     */
    constructor(name, value) {
        if (name == null || value == null)
            throw new Error("Null reference exception!");
        this._name = name;
        this._value = value;
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
     * @returns {IValue}
     */
    get value() {
        return this._value;
    }
}
exports.default = Variable;
