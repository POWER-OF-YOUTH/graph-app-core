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
class RelationMapper {
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
     * @param {Relation}
     * @returns {Promise<void>}
     */
    save(relation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (relation == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        fromId: relation.from.id,
                        toId: relation.to.id,
                        name: relation.name,
                        id: relation.id
                    }
                };
                const dbResponse = yield session.run(`
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
                session.close();
            }
            catch (err) {
                throw new database_error_1.default();
            }
        });
    }
    /**
     *
     * @param {Relation} relation
     * @returns {Promise<void>}
     */
    destroy(relation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (relation == null)
                throw new Error("Null reference exception!");
            try {
                const session = this._driver.session();
                const parameters = {
                    data: {
                        graphId: this._graph.id,
                        fromId: relation.from.id,
                        toId: relation.to.id,
                        name: relation.name,
                        id: relation.id
                    }
                };
                const dbResponse = yield session.run(`
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
                session.close();
            }
            catch (err) {
                console.log(err);
                throw new database_error_1.default();
            }
        });
    }
}
exports.default = RelationMapper;
