"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const template_1 = __importDefault(require("./template"));
const template_representation_1 = __importDefault(require("./template_representation"));
const variable_serializer_1 = __importDefault(require("./variable_serializer"));
class TemplateSerializer {
    constructor() {
        this._variableSerializer = new variable_serializer_1.default();
    }
    serialize(template) {
        return {
            id: template.id,
            name: template.name,
            representation: JSON.stringify(template.representation.toJSON()),
        };
    }
    deserialize({ data, variables }) {
        return new template_1.default(data.name, variables, template_representation_1.default.fromJSON(JSON.parse(data.representation)), data.id);
    }
}
exports.default = TemplateSerializer;
