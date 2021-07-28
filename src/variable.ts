import IValue from './i_value';

type VariableData = {
    name: string,
    value: {
        type: string,
        data: any
    }
}

class Variable
{
    private readonly _name: string;
    private readonly _value: IValue;

    constructor(name: string, value: IValue) {
        this._name = name;
        this._value = value;
    }

    get name(): string {
        return this._name;
    }

    get value(): IValue {
        return this._value;
    }

    toJSON(): VariableData {
        return {
            name: this._name,
            value: { type: this._value.type.name, data: this._value.data }
        }
    }
}

export default Variable;
export { VariableData, Variable };