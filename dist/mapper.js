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
class Mapper {
    constructor(driver) {
        this._driver = driver;
    }
    get driver() {
        return this._driver;
    }
    runQuery(query, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this._driver.session();
                const result = yield session.run(query, parameters);
                session.close();
                return result;
            }
            catch (err) {
                console.log(err);
                throw new database_error_1.default();
            }
        });
    }
}
exports.default = Mapper;
