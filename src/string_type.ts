import IType from './i_type';

class StringType implements IType
{
    get name() {
        return "String";
    }
}

export default StringType;