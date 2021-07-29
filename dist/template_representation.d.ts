declare type TemplateRepresentationData = {};
declare class TemplateRepresentation {
    static fromJSON(data: TemplateRepresentationData): TemplateRepresentation;
    toJSON(): TemplateRepresentationData;
}
export default TemplateRepresentation;
export { TemplateRepresentation, TemplateRepresentationData };
