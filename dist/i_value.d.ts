import IType from './i_type';
interface IValue {
    get type(): IType;
    get data(): any;
}
export default IValue;
