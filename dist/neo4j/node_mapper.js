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
const node_serializer_1 = __importDefault(require("./node_serializer"));
const template_mapper_1 = __importDefault(require("./template_mapper"));
const variable_serializer_1 = __importDefault(require("./variable_serializer"));
class NodeMapper extends mapper_1.default {
    constructor(driver, graph) {
        super(driver);
        this._variableSerializer = new variable_serializer_1.default();
        this._nodeSerializer = new node_serializer_1.default();
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
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            MATCH (n)-[:REALIZE]->(t:Template)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);
            const tm = new template_mapper_1.default(this._driver, this._graph);
            const nodes = yield Promise.all(result.records.map((record) => __awaiter(this, void 0, void 0, function* () {
                const templateData = record.get("template");
                const template = (yield tm.findBy({ id: templateData.id }));
                const data = record.get("data");
                // @ts-ignore
                const variables = record.get("variables").map(v => this._variableSerializer.deserialize(v));
                const node = this._nodeSerializer.deserialize({ data, template, variables });
                return node;
            })));
            return nodes;
        });
    }
    where({ template }) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                templateName: template.name,
                data: {}
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)
            WHERE g.id = $graphId
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            MATCH (n)-[:REALIZE]->(t:Template)
            WHERE t.name = $templateName
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);
            const nodes = yield Promise.all(result.records.map((record) => __awaiter(this, void 0, void 0, function* () {
                const data = record.get("data");
                // @ts-ignore
                const variables = record.get("variables").map(v => this._variableSerializer.deserialize(v));
                const node = this._nodeSerializer.deserialize({ data, template, variables });
                return node;
            })));
            return nodes;
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
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            WHERE g.id = $graphId AND n.id = $data.id
            MATCH (n)-[:REALIZE]->(t:Template)
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
        `, parameters);
            if (result.records.length == 0)
                return null;
            const tm = new template_mapper_1.default(this._driver, this._graph);
            const templateData = result.records[0].get("template");
            const template = (yield tm.findBy({ id: templateData.id }));
            const data = result.records[0].get("data");
            // @ts-ignore
            const variables = result.records[0].get("variables").map(v => this._variableSerializer.deserialize(v));
            const node = this._nodeSerializer.deserialize({ data, template, variables });
            return node;
        });
    }
    save(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                templateId: node.template.id,
                data: this._nodeSerializer.serialize(node),
                variables: node.variables().map(v => this._variableSerializer.serialize(v))
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(t:Template)
            WHERE g.id = $graphId AND t.id = $templateId
            MERGE (g)-[:CONTAINS]->(n:Node { id: $data.id })
            SET n = $data
            MERGE (n)-[:REALIZE]->(t)
            FOREACH (variable IN $variables | 
                MERGE (n)-[:HAVE]->(v:Variable { name: variable.name })
                SET v = variable)
        `, parameters);
        });
    }
    destroy(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                graphId: this._graph.id,
                data: this._nodeSerializer.serialize(node)
            };
            const result = yield this.runQuery(`
            MATCH (g:Graph)-[:CONTAINS]->(n:Node)
            WHERE g.id = $graphId AND n.id = $data.id
            OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
            DETACH DELETE v, n
        `, parameters);
        });
    }
}
exports.default = NodeMapper;
