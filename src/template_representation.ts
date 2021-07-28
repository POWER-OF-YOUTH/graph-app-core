type TemplateRepresentationData = { };

class TemplateRepresentation {
    static fromJSON(str: string): TemplateRepresentation {
        return new TemplateRepresentation();
    }

    toJSON(): TemplateRepresentationData {
        return {};
    }
}

export default TemplateRepresentation;
export { TemplateRepresentation, TemplateRepresentationData };