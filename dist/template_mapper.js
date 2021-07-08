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
class TemplateMapper {
    /**
     *
     * @param {Driver} driver
     * @param {Graph} graph
     */
    constructor(driver, graph) {
        if (driver == null || graph == null)
            throw new Error("Null reference exception!");
        this._driver = driver;
        this._graph = graph;
    }
    /**
     *
     * @returns {Driver}
     */
    get driver() {
        return this._driver;
    }
    /**
     *
     * @param {Template} template
     * @returns {Promise<void>}
     */
    save(template) {
        return __awaiter(this, void 0, void 0, function* () {
            if (template == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        name: template.name,
                        variables: template.variables().map(v => { return { name: v.name, type: v.value.type.name, data: JSON.stringify(v.value.data) }; })
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)
                WHERE g.id = $data.graphId
                MERGE (g)-[:CONTAINS]-(t:Template { name: $data.name })
                FOREACH (variable IN $data.variables | 
                    MERGE (t)-[:HAVE]->(v:Variable { name: variable.name })
                    SET v = variable)
            `, parameters);
                session.close();
            }
            catch (err) {
                console.log(err);
                throw new database_error_1.default();
            }
        });
    }
    /**
     *
     * @param {Template} template
     * @returns {Promise<void>}
     */
    destroy(template) {
        return __awaiter(this, void 0, void 0, function* () {
            if (template == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        name: template.name,
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph)-[:CONTAINS]->(t:Template)
                WHERE g.id = $data.graphId AND t.name = $data.name
                OPTIONAL MATCH (t)-[:HAVE]->(v:Variable)
                DETACH DELETE v, t
            `, parameters);
                session.close();
            }
            catch (err) {
                console.log(err);
                throw new database_error_1.default();
            }
        });
    }
}
exports.default = TemplateMapper;
