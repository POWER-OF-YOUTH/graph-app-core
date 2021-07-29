import IType from "./i_type";
import IValue from "./i_value";
declare class StringValue implements IValue {
    private readonly _type;
    private readonly _data;
    constructor(data: string);
    get data(): any;
    get type(): IType;
}
export default StringValue;
