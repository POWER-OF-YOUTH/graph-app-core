import IDatabaseSerializer from './i_database_serializer';
import Variable from './variable';
declare type Data = {
    name: string;
    type: string;
    data: string;
};
declare class VariableSerializer implements IDatabaseSerializer<Variable> {
    private static _typeValueMap;
    serialize(variable: Variable): Data;
    deserialize(data: Data): Variable;
}
export default VariableSerializer;
