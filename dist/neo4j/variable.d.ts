import IValue from './i_value';
declare type VariableData = {
    name: string;
    value: {
        type: string;
        data: any;
    };
};
declare class Variable {
    private static _typeValueMap;
    private readonly _name;
    private _value;
    constructor(name: string, value: IValue);
    get name(): string;
    get value(): IValue;
    set value(v: IValue);
    static fromJSON(data: VariableData): Variable;
    toJSON(): VariableData;
}
export default Variable;
export { VariableData, Variable };
