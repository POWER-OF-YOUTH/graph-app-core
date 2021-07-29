"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const variable_1 = __importDefault(require("./variable"));
const string_type_1 = __importDefault(require("./string_type"));
const string_value_1 = __importDefault(require("./string_value"));
class VariableSerializer {
    serialize(variable) {
        return {
            name: variable.name,
            type: variable.value.type.name,
            data: JSON.stringify(variable.value.data)
        };
    }
    deserialize(data) {
        const value = VariableSerializer._typeValueMap.get(data.type)(JSON.parse(data.data));
        const variable = new variable_1.default(data.name, value);
        return variable;
    }
}
VariableSerializer._typeValueMap = new Map([
    [(new string_type_1.default()).name, (data) => new string_value_1.default(data)]
]);
exports.default = VariableSerializer;
