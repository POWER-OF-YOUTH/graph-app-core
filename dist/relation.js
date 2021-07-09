"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Relation {
    /**
     *
     * @param {Node} from
     * @param {Node} to
     * @param {string} name
     * @param {string} id
     */
    constructor(from, to, name, id = uuid_1.v4()) {
        if (from == null || to == null || name == null || id == null)
            throw new Error("Null reference exception!");
        this._from = from;
        this._to = to;
        this._name = name;
        this._id = id;
    }
    /**
     *
     * @returns {Node}
     */
    get from() {
        return this._from;
    }
    /**
     *
     * @returns {Node}
     */
    get to() {
        return this._to;
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
     * @param {string} value
     */
    set name(value) {
        if (value == null)
            throw new Error("Null reference exception!");
        this._name = value;
    }
    /**
     *
     * @returns {string}
     */
    get id() {
        return this._id;
    }
}
exports.default = Relation;
