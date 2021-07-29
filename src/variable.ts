import IValue from './i_value';
import StringType from './string_type';
import StringValue from './string_value';

type VariableData = {
    name: string,
    value: {
        type: string,
        data: any
    }
}

class Variable
{
    private static _typeValueMap: Map<String,(data: any)=>IValue> = new Map([
        [(new StringType()).name, (data) => new StringValue(data)]
    ]);
    private readonly _name: string;
    private _value: IValue;

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

    set value(v: IValue) {
        this._value = v;
    }

    static fromJSON(data: VariableData): Variable {
        return new Variable(
            data.name, 
            Variable._typeValueMap.get(data.value.type)!(data.value.data)
        );
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