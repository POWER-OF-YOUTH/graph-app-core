"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = __importDefault(require("./graph"));
class GraphSerializer {
    serialize(graph) {
        return {
            name: graph.name,
            description: graph.description,
            id: graph.id,
            date: graph.date
        };
    }
    deserialize({ data }) {
        return new graph_1.default(data.name, data.description, data.id, data.date);
    }
}
exports.default = GraphSerializer;
