import IValue from './i_value';
declare type VariableData = {
    name: string;
    value: {
        type: string;
        data: any;
    };
};
declare class Variable {
    private readonly _name;
    private readonly _value;
    constructor(name: string, value: IValue);
    get name(): string;
    get value(): IValue;
    toJSON(): VariableData;
}
export default Variable;
export { VariableData, Variable };
