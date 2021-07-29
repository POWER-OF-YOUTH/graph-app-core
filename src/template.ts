import { v4 as uuid } from 'uuid';

import { Variable, VariableData } from './variable';
import { TemplateRepresentation, TemplateRepresentationData } from './template_representation';

type TemplateData = {
    name: string,
    id: string,
    representation: TemplateRepresentationData,
    variables: Array<VariableData>
};

class Template
{
    private readonly _variablesMap: Map<string, Variable>;
    private readonly _name: string;
    private readonly _id: string;
    private _representation: TemplateRepresentation;

    constructor(name: string, variables: Array<Variable>, representation: TemplateRepresentation = new TemplateRepresentation(), id = uuid()) {
        this._variablesMap = new Map<string, Variable>();
        for (let variable of variables)
            this._variablesMap.set(variable.name, variable);
        this._name = name;
        this._representation = representation;
        this._id = id;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._id;
    }

    get representation(): TemplateRepresentation {
        return this._representation;
    }

    set representation(value: TemplateRepresentation) {
        this._representation = value;
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
    
    static fromJSON(data: TemplateData): Template {
        return new Template(
            data.name, 
            data.variables.map(v => Variable.fromJSON(v)),
            TemplateRepresentation.fromJSON(data.representation),
            data.id
        );
    }

    toJSON(): TemplateData {
        return {
            name: this._name,
            id: this._id,
            representation: this._representation.toJSON(),
            variables: this.variables().map(v => v.toJSON())
        }
    }
}

export default Template;
export { Template, TemplateData };