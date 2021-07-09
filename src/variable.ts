import IValue from './i_value';

class Variable
{
    private readonly _name: string;
    private readonly _value: IValue;

    /**
     * 
     * @param {string} name
     * @param {IValue} value
     */
    constructor(name: string, value: IValue) {
        if (name == null || value == null)
            throw new Error("Null reference exception!");
        
        this._name = name;
        this._value = value;
    }

    /**
     * 
     * @returns {string}
     */
    get name(): string {
        return this._name;
    }

    /**
     * 
     * @returns {IValue}
     */
    get value(): IValue {
        return this._value;
    }
}

export default Variable;