"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DatabaseError extends Error {
    constructor(message = "Database error!") {
        super(message);
        this.name = "DatabaseError";
    }
}
exports.default = DatabaseError;
