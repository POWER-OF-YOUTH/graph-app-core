import IType from "./i_type";
import StringType from "./string_type";
import IValue from "./i_value";

class StringValue implements IValue
{
    private readonly _type: IType = new StringType();
    private readonly _data: string;

    /**
     * 
     * @param {String} data
     */
    constructor(data: string) {
        if (data == null)
            throw new Error("Null reference exception!");
        this._data = data;
    }

    /**
     * 
     * @returns {string}
     */
    get data(): any {
        return this._data;
    }

    /**
     * 
     * @returns {IType}
     */
    get type(): IType {
        return this._type;
    }
}

export default StringValue;