import { Variable, VariableData } from './variable';
import { TemplateRepresentation, TemplateRepresentationData } from './template_representation';
declare type TemplateData = {
    name: string;
    id: string;
    representation: TemplateRepresentationData;
    variables: Array<VariableData>;
};
declare class Template {
    private readonly _variablesMap;
    private readonly _name;
    private readonly _id;
    private _representation;
    constructor(name: string, variables: Array<Variable>, representation?: TemplateRepresentation, id?: string);
    get name(): string;
    get id(): string;
    get representation(): TemplateRepresentation;
    set representation(value: TemplateRepresentation);
    variable(name: string): Variable | undefined;
    variables(): Array<Variable>;
    static fromJSON(data: TemplateData): Template;
    toJSON(): TemplateData;
}
export default Template;
export { Template, TemplateData };
