import IDatabaseSerializer from './i_database_serializer';
import Variable from './variable';
import IValue from './i_value';
import StringType from './string_type';
import StringValue from './string_value';

type Data = {
    name: string,
    type: string,
    data: string
}

class VariableSerializer implements IDatabaseSerializer<Variable> 
{
    private static _typeValueMap: Map<String,(data: any)=>IValue> = new Map([
        [(new StringType()).name, (data) => new StringValue(data)]
    ]);

    serialize(variable: Variable): Data {
        return {
            name: variable.name,
            type: variable.value.type.name,
            data: JSON.stringify(variable.value.data)
        }
    }

    deserialize(data: Data): Variable {
        const value: IValue = VariableSerializer._typeValueMap.get(data.type)!(JSON.parse(data.data));
        const variable = new Variable(data.name, value);

        return variable;
    }
}

export default VariableSerializer;