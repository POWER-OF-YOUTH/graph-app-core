import IType from "./i_type";
import IValue from "./i_value";
declare class StringValue implements IValue {
    private readonly _type;
    private readonly _data;
    /**
     *
     * @param {String} data
     */
    constructor(data: string);
    /**
     *
     * @returns {string}
     */
    get data(): any;
    /**
     *
     * @returns {IType}
     */
    get type(): IType;
}
export default StringValue;
