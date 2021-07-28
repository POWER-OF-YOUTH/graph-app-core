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
const template_1 = __importDefault(require("./template"));
const template_representation_1 = __importDefault(require("./template_representation"));
const variable_maker_1 = __importDefault(require("./variable_maker"));
class TemplateMapper {
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
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS data, collect(properties(v)) AS variables
            `, parameters);
                session.close();
                const templates = dbResponse.records.map(record => {
                    const data = record.get("data");
                    const variables = record.get("variables");
                    const template = new template_1.default(data.name, variables.map(data => variable_maker_1.default.make(data)), template_representation_1.default.fromJSON(data.representation), data.id);
                    return template;
                });
                return templates;
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
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.id = $data.id
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                RETURN properties(t) AS data, collect(properties(v)) AS variables
            `, parameters);
                session.close();
                if (dbResponse.records.length === 0)
                    return null;
                const data = dbResponse.records[0].get("data");
                const variables = dbResponse.records[0].get("variables");
                const template = new template_1.default(data.name, variables.map(data => variable_maker_1.default.make(data)), template_representation_1.default.fromJSON(data.representation), data.id);
                return template;
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    save(template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        id: template.id,
                        variables: template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) }; })
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MERGE (g)-[:CONTAINS]-(t:Template { id: $data.id })
                FOREACH (variable IN $data.variables | 
                    MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                    SET v = variable)
            `, parameters);
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    destroy(template) {
        return __awaiter(this, void 0, void 0, function* () {
            if (template == null)
                throw new Error("Null reference exception!");
            if (yield this.hasImplementedNodes(template))
                throw new database_error_1.default("Template has implemented nodes!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        id: template.id,
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.id = $data.id
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                DETACH DELETE v, t
            `, parameters);
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    hasImplementedNodes(template) {
        return __awaiter(this, void 0, void 0, function* () {
            if (template == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        id: template.id,
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.id = $data.id
                MATCH (n:Node)-[:REALIZE]->(t)
                RETURN n LIMIT 1
            `, parameters);
                session.close();
                return dbResponse.records.length > 0;
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
}
exports.default = TemplateMapper;
