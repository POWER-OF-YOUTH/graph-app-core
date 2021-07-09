import Variable from "./variable";
declare class VariableMaker {
    private static _typeValueMap;
    static make(data: {
        name: string;
        type: string;
        data: string;
    }): Variable;
}
export default VariableMaker;
