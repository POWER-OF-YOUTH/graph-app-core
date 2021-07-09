import IType from "./i_type";
import IValue from "./i_value";
import StringType from "./string_type";
import StringValue from "./string_value";
import Variable from "./variable";


class VariableMaker {
    private static _typeValueMap: Map<String,(data: any)=>IValue> = new Map([
        [(new StringType()).name, (data) => new StringValue(data)]
    ]);

    static make(data: { name: string, type: string, data: string }): Variable {
        if (!this._typeValueMap.has(data.type))
            throw new Error(`Type [${data.type}] is not registered!`);

        const value: IValue = this._typeValueMap.get(data.type)!(JSON.parse(data.data));
        const variable = new Variable(data.name, value);

        return variable;
    }
}

export default VariableMaker;