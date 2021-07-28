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
const node_1 = __importDefault(require("./node"));
const template_mapper_1 = __importDefault(require("./template_mapper"));
const variable_maker_1 = __importDefault(require("./variable_maker"));
class NodeMapper {
    constructor(driver, graph) {
        this._driver = driver;
        this._graph = graph;
    }
    get driver() {
        return this._driver;
    }
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                MATCH (n)-[:REALIZE]->(t:Template)
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
            `, parameters);
                session.close();
                const tm = new template_mapper_1.default(this._driver, this._graph);
                const nodes = yield Promise.all(dbResponse.records.map((record) => __awaiter(this, void 0, void 0, function* () {
                    const template = record.get("template");
                    const data = record.get("data");
                    const variables = record.get("variables");
                    const node = new node_1.default((yield tm.findBy({ id: template.id })), data.x, data.y, data.id, variables.map(data => variable_maker_1.default.make(data)));
                    return node;
                })));
                return nodes;
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    where({ template }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        templateName: template.name
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                MATCH (n)-[:REALIZE]->(t:Template)
                WHERE t.name = $data.templateName
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
            `, parameters);
                session.close();
                const nodes = yield Promise.all(dbResponse.records.map((record) => __awaiter(this, void 0, void 0, function* () {
                    const data = record.get("data");
                    const variables = record.get("variables");
                    const node = new node_1.default(template, data.x, data.y, data.id, variables.map(data => variable_maker_1.default.make(data)));
                    return node;
                })));
                return nodes;
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    findBy({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        id
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                WHERE g.id = $data.graphId AND n.id = $data.id
                MATCH (n)-[:REALIZE]->(t:Template)
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS template, properties(n) AS data, collect(properties(v)) AS variables
            `, parameters);
                session.close();
                if (dbResponse.records.length == 0)
                    return null;
                const tm = new template_mapper_1.default(this._driver, this._graph);
                const template = dbResponse.records[0].get("template");
                const data = dbResponse.records[0].get("data");
                const variables = dbResponse.records[0].get("variables");
                const node = new node_1.default((yield tm.findBy({ id: template.id })), data.x, data.y, data.id, variables.map(data => variable_maker_1.default.make(data)));
                return node;
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    save(node) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        templateName: node.template.name,
                        id: node.id,
                        x: node.x,
                        y: node.y,
                        variables: node.template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) }; })
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.name = $data.templateName
                MERGE (g)-[:CONTAINS]->(n:Node { id: $data.id })
                MERGE (n)-[:REALIZE]->(t)
                FOREACH (variable IN $data.variables | 
                    MERGE (n)-[:HAVE]->(v:Variable { name: variable.name })
                    SET v = variable)
            `, parameters);
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    destroy(node) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        id: node.id
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(n:Node)
                WHERE g.id = $data.graphId AND n.id = $data.id
                OPTIONAL MATCH (n)-[:HAVE]->(v:Variable)
                DETACH DELETE v, n
            `, parameters);
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
}
exports.default = NodeMapper;
