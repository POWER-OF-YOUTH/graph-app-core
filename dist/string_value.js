"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const string_type_1 = __importDefault(require("./string_type"));
class StringValue {
    /**
     *
     * @param {String} data
     */
    constructor(data) {
        this._type = new string_type_1.default();
        if (data == null)
            throw new Error("Null reference exception!");
        this._data = data;
    }
    /**
     *
     * @returns {string}
     */
    get data() {
        return this._data;
    }
    /**
     *
     * @returns {IType}
     */
    get type() {
        return this._type;
    }
}
exports.default = StringValue;
