"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const string_type_1 = __importDefault(require("./string_type"));
const string_value_1 = __importDefault(require("./string_value"));
const variable_1 = __importDefault(require("./variable"));
class VariableMaker {
    static make(data) {
        if (!this._typeValueMap.has(data.type))
            throw new Error(`Type [${data.type}] is not registered!`);
        const value = this._typeValueMap.get(data.type)(JSON.parse(data.data));
        const variable = new variable_1.default(data.name, value);
        return variable;
    }
}
VariableMaker._typeValueMap = new Map([
    [(new string_type_1.default()).name, (data) => new string_value_1.default(data)]
]);
exports.default = VariableMaker;
