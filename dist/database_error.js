"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DatabaseError extends Error {
    /**
     *
     * @param {String} message
     */
    constructor(message = "Database error!") {
        super(message);
        this.name = "DatabaseError";
    }
}
exports.default = DatabaseError;
