"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
const string_type_1 = __importDefault(require("./string_type"));
const string_value_1 = __importDefault(require("./string_value"));
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
    set value(v) {
        this._value = v;
    }
    static fromJSON(data) {
        return new Variable(data.name, Variable._typeValueMap.get(data.value.type)(data.value.data));
    }
    toJSON() {
        return {
            name: this._name,
            value: { type: this._value.type.name, data: this._value.data }
        };
    }
}
exports.Variable = Variable;
Variable._typeValueMap = new Map([
    [(new string_type_1.default()).name, (data) => new string_value_1.default(data)]
]);
exports.default = Variable;
