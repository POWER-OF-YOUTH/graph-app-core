declare type TemplateRepresentationData = {};
declare class TemplateRepresentation {
    static fromJSON(str: string): TemplateRepresentation;
    toJSON(): TemplateRepresentationData;
}
export default TemplateRepresentation;
export { TemplateRepresentation, TemplateRepresentationData };
