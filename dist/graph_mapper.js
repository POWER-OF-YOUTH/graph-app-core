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
class GraphMapper {
    /**
     *
     * @param {Driver} driver
     */
    constructor(driver) {
        if (driver == null)
            throw new Error("Null reference exception!");
        this._driver = driver;
    }
    /**
     * @returns {Driver}
     */
    get driver() {
        return this._driver;
    }
    /**
     *
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    save(graph) {
        return __awaiter(this, void 0, void 0, function* () {
            if (graph == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        name: graph.name,
                        description: graph.description,
                        id: graph.id,
                        date: graph.date
                    }
                };
                const dbResponse = yield session.run(`
                MERGE (g:Graph {id: $data.id})
                SET g = $data
            `, parameters);
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    /**
     *
     * @param {Graph} graph
     * @returns {Promise<void>}
     */
    destroy(graph) {
        return __awaiter(this, void 0, void 0, function* () {
            if (graph == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        id: graph.id,
                    }
                };
                const dbResponse = yield session.run(`
                MATCH (g:Graph) 
                WHERE g.id = $data.id
                OPTIONAL MATCH (g)-[:CONTAINS]-(c:Class)
                OPTIONAL MATCH (c)-[:HAVE]->(p:Property)
                OPTIONAL MATCH (g)-[:CONTAINS]-(n:Node)
                OPTIONAL MATCH (n)-[:HAVE]->(v:Value)
                DETACH DELETE v, n, p, c, g
            `, parameters);
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
}
exports.default = GraphMapper;
