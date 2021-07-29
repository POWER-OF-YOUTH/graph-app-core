import { Template, TemplateData } from './template';
import { Variable, VariableData } from './variable';
declare type NodeData = {
    id: string;
    template: TemplateData;
    variables: Array<VariableData>;
    x: number;
    y: number;
};
declare class Node {
    private readonly _variablesMap;
    private readonly _template;
    private readonly _id;
    private _x;
    private _y;
    constructor(template: Template, x: number, y: number, id?: string, variables?: Array<Variable> | null);
    get id(): string;
    get template(): Template;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    variable(name: string): Variable | undefined;
    variables(): Array<Variable>;
    static fromJSON(data: NodeData): Node;
    toJSON(): NodeData;
}
export default Node;
export { Node, NodeData };
