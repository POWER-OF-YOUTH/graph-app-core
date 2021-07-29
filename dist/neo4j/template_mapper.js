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
const database_error_1 = __importDefault(require("./database_error"));
const mapper_1 = __importDefault(require("./mapper"));
const template_serializer_1 = __importDefault(require("./template_serializer"));
const variable_serializer_1 = __importDefault(require("./variable_serializer"));
class TemplateMapper extends mapper_1.default {
    constructor(driver, graph) {
        super(driver);
        this._variableSerializer = new variable_serializer_1.default();
        this._templateSerializer = new template_serializer_1.default();
        this._graph = graph;
    }
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                data: {}
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS data, collect(properties(v)) AS variables
        `, parameters);
            const templates = result.records.map(record => {
                const data = record.get("data");
                // @ts-ignore
                const variables = record.get("variables").map(v => this._variableSerializer.deserialize(v));
                const template = this._templateSerializer.deserialize({ data, variables });
                return template;
            });
            return templates;
        });
    }
    findBy({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                data: {
                    id
                }
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $data.id
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS data, collect(properties(v)) AS variables
        `, parameters);
            if (result.records.length === 0)
                return null;
            const data = result.records[0].get("data");
            // @ts-ignore
            const variables = result.records[0].get("variables").map(v => this._variableSerializer.deserialize(v));
            const template = this._templateSerializer.deserialize({ data, variables });
            return template;
        });
    }
    save(template) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                data: this._templateSerializer.serialize(template),
                variables: template.variables().map(v => this._variableSerializer.serialize(v))
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MERGE (g)-[:CONTAINS]-(t:Template { id: $data.id })
            SET t = $data
            FOREACH (variable IN $variables | 
                MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                SET v = variable)
        `, parameters);
        });
    }
    destroy(template) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.hasImplementedNodes(template))
                throw new database_error_1.default("Template has implemented nodes!");
            const parameters = {
                graphId: this._graph.id,
                data: this._templateSerializer.serialize(template)
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $data.id
            OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
            DETACH DELETE v, t
        `, parameters);
        });
    }
    hasImplementedNodes(template) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                data: this._templateSerializer.serialize(template)
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $data.id
            MATCH (n:Node)-[:REALIZE]->(t)
            RETURN n LIMIT 1
        `, parameters);
            return result.records.length > 0;
        });
    }
}
exports.default = TemplateMapper;
