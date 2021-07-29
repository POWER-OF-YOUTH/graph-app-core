"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("./node"));
const variable_serializer_1 = __importDefault(require("./variable_serializer"));
class NodeSerializer {
    constructor() {
        this._variableSerializer = new variable_serializer_1.default();
    }
    serialize(node) {
        return {
            id: node.id,
            x: node.x,
            y: node.y
        };
    }
    deserialize({ data, template, variables }) {
        return new node_1.default(template, data.x, data.y, data.id, variables);
    }
}
exports.default = NodeSerializer;
