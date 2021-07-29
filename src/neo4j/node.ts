import { v4 as uuid } from 'uuid';

import { Template, TemplateData } from './template';
import { Variable, VariableData } from './variable';

type NodeData = {
    id: string,
    template: TemplateData
    variables: Array<VariableData>,
    x: number,
    y: number
}

class Node
{
    private readonly _variablesMap: Map<string, Variable>;
    private readonly _template: Template;
    private readonly _id: string;
    private _x: number;
    private _y: number;

    constructor(template: Template, x: number, y: number, id: string = uuid(), variables: Array<Variable> | null = null) {
        if (variables === null) 
            variables = template.variables();
        this._variablesMap = new Map<string, Variable>(variables.map(v => [v.name, v]));
        this._template = template;
        this._x = x;
        this._y = y;
        this._id = id;
    }

    get id(): string {
        return this._id;
    }

    get template(): Template {
        return this._template;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    variable(name: string): Variable | undefined {
        return this._variablesMap.get(name);
    }

    variables(): Array<Variable> {
        const variablesIter = this._variablesMap.values();
        const variables: Array<Variable> = [];
        for (let variable of variablesIter)
            variables.push(variable)
        
        return variables;
    }

    static fromJSON(data: NodeData): Node {
        return new Node(
            Template.fromJSON(data.template),
            data.x,
            data.y,
            data.id,
            data.variables.map(v => Variable.fromJSON(v))
        );
    }

    toJSON(): NodeData {
        return {
            id: this._id,
            template: this._template.toJSON(),
            variables: this.variables().map(v => v.toJSON()),
            x: this._x,
            y: this._y
        }
    }
}

export default Node;
export { Node, NodeData };