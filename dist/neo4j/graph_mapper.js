"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_1 = __importDefault(require("./mapper"));
const graph_serializer_1 = __importDefault(require("./graph_serializer"));
class GraphMapper extends mapper_1.default {
    constructor(driver) {
        super(driver);
        this._graphSerializer = new graph_serializer_1.default();
    }
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {};
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            RETURN properties(g) AS data 
        `, parameters);
            const graphs = result.records.map(record => {
                const data = record.get("data");
                const graph = this._graphSerializer.deserialize({ data });
                return graph;
            });
            return graphs;
        });
    }
    findBy({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: {
                    graphId: id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            RETURN properties(g) AS data 
        `, parameters);
            if (result.records.length === 0)
                return null;
            const data = result.records[0].get("data");
            const graph = this._graphSerializer.deserialize({ data });
            return graph;
        });
    }
    save(graph) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: this._graphSerializer.serialize(graph)
            };
            const result = yield this.runQuery(`
            MERGE (g:Graph {id: $data.id})
            SET g = $data
        `, parameters);
        });
    }
    destroy(graph) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: this._graphSerializer.serialize(graph)
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph) 
            WHERE g.id = $data.id
            OPTIONAL MATCH (g)-[:CONTAINS]-(c:Class)
            OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
            OPTIONAL MATCH (g)-[:CONTAINS]-(n:Node)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Value)
            DETACH DELETE v, n, p, c, g
        `, parameters);
        });
    }
}
exports.default = GraphMapper;
