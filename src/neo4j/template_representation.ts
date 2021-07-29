type TemplateRepresentationData = { };

class TemplateRepresentation {
    static fromJSON(data: TemplateRepresentationData): TemplateRepresentation {
        return new TemplateRepresentation();
    }

    toJSON(): TemplateRepresentationData {
        return {};
    }
}

export default TemplateRepresentation;
export { TemplateRepresentation, TemplateRepresentationData };