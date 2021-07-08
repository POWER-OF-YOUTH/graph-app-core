"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Graph {
    /**
     *
     * @param {string} name
     * @param {string} description
     * @param {string} id
     * @param {Date} date
     */
    constructor(name, description, id = uuid_1.v4(), date = Date.now()) {
        if (name == null || description == null || id == null || date == null)
            throw new Error("Null reference exception!");
        this._name = name;
        this._description = description;
        this._id = id;
        this._date = date;
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
        this._name = value;
    }
    /**
     *
     * @returns {string}
     */
    get description() {
        return this._description;
    }
    /**
     *
     * @param {string} value
     */
    set description(value) {
        this._description = value;
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
     * @returns {Date | number}
     */
    get date() {
        return this._date;
    }
}
exports.default = Graph;
