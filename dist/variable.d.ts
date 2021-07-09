import IValue from './i_value';
declare class Variable {
    private readonly _name;
    private readonly _value;
    /**
     *
     * @param {string} name
     * @param {IValue} value
     */
    constructor(name: string, value: IValue);
    /**
     *
     * @returns {string}
     */
    get name(): string;
    /**
     *
     * @returns {IValue}
     */
    get value(): IValue;
}
export default Variable;
