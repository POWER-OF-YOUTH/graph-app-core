"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const string_type_1 = __importDefault(require("./string_type"));
class StringValue {
    constructor(data) {
        this._type = new string_type_1.default();
        if (data == null)
            throw new Error("Null reference exception!");
        this._data = data;
    }
    get data() {
        return this._data;
    }
    get type() {
        return this._type;
    }
}
exports.default = StringValue;
