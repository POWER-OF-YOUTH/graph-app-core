import IDatabaseSerializer from './i_database_serializer';
import Template from './template';
import Variable from './variable';
declare type Data = {
    id: string;
    name: string;
    representation: string;
};
declare class TemplateSerializer implements IDatabaseSerializer<Template> {
    private readonly _variableSerializer;
    serialize(template: Template): Data;
    deserialize({ data, variables }: {
        data: Data;
        variables: Array<Variable>;
    }): Template;
}
export default TemplateSerializer;
