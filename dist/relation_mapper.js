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
const node_mapper_1 = __importDefault(require("./node_mapper"));
const relation_1 = __importDefault(require("./relation"));
class RelationMapper extends mapper_1.default {
    constructor(driver, graph) {
        super(driver);
        this._graph = graph;
    }
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: {
                    graphId: this._graph.id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1:Node)
            MATCH (g)-[:CONTAINS]->(n2:Node)
            WHERE n1 <> n2
            MATCH (n1)-[rel:RELATION]->(n2)
            RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
        `, parameters);
            const nm = new node_mapper_1.default(this._driver, this._graph);
            const relations = Promise.all(result.records.map((record) => __awaiter(this, void 0, void 0, function* () {
                const data = record.get("data");
                const from = record.get("from");
                const to = record.get("to");
                const relation = new relation_1.default((yield nm.findBy({ id: from.id })), (yield nm.findBy({ id: to.id })), data.name, data.id);
                return relation;
            })));
            return relations;
        });
    }
    where({ from, to }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    fromId: from === null || from === void 0 ? void 0 : from.id,
                    toId: to === null || to === void 0 ? void 0 : to.id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1:Node)
            ${from ? "WHERE n1.id = $data.fromId" : ""}
            MATCH (g)-[:CONTAINS]->(n2:Node)
            ${to ? "WHERE n2.id = $data.toId" : ""}
            MATCH (n1)-[rel:RELATION]->(n2)
            WHERE n1 <> n2
            RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
        `, parameters);
            const nm = new node_mapper_1.default(this._driver, this._graph);
            const relations = Promise.all(result.records.map((record) => __awaiter(this, void 0, void 0, function* () {
                const data = record.get("data");
                const from = record.get("from");
                const to = record.get("to");
                const relation = new relation_1.default((yield nm.findBy({ id: from.id })), (yield nm.findBy({ id: to.id })), data.name, data.id);
                return relation;
            })));
            return relations;
        });
    }
    findBy({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1:Node)
            MATCH (g)-[:CONTAINS]->(n2:Node)
            WHERE n1 <> n2
            MATCH (n1)-[rel:RELATION]->(n2)
            WHERE rel.id = $data.id
            RETURN properties(rel) AS data, properties(n1) AS from, properties(n2) AS to
        `, parameters);
            if (result.records.length === 0)
                return null;
            const nm = new node_mapper_1.default(this._driver, this._graph);
            const data = result.records[0].get("data");
            const from = result.records[0].get("from");
            const to = result.records[0].get("to");
            const relation = new relation_1.default((yield nm.findBy({ id: from.id })), (yield nm.findBy({ id: to.id })), data.name, data.id);
            return relation;
        });
    }
    save(relation) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    fromId: relation.from.id,
                    toId: relation.to.id,
                    name: relation.name,
                    id: relation.id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1) 
            WHERE n1.id = $data.fromId
            MATCH (g)-[:CONTAINS]->(n2)
            WHERE n2.id = $data.toId
            MERGE (n1)-[rel:RELATION {id: $data.id}]->(n2)
            SET rel.name = $data.name
            RETURN g, n1, n2, rel
        `, parameters);
        });
    }
    destroy(relation) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                data: {
                    graphId: this._graph.id,
                    fromId: relation.from.id,
                    toId: relation.to.id,
                    name: relation.name,
                    id: relation.id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $data.graphId
            MATCH (g)-[:CONTAINS]->(n1) 
            WHERE n1.id = $data.fromId
            MATCH (g)-[:CONTAINS]->(n2)
            WHERE n2.id = $data.toId
            MATCH (n1)-[rel:RELATION]->(n2)
            WHERE rel.id = $data.id
            DELETE rel
        `, parameters);
        });
    }
}
exports.default = RelationMapper;
