import IDatabaseSerializer from './i_database_serializer';
import Template from './template';
import TemplateRepresentation from './template_representation';
import Variable from './variable';
import VariableSerializer from './variable_serializer';

type Data = {
    id: string,
    name: string,
    representation: string
};

class TemplateSerializer implements IDatabaseSerializer<Template>
{
    private readonly _variableSerializer = new VariableSerializer();
    serialize(template: Template): Data {
        return {
            id: template.id,
            name: template.name,
            representation: JSON.stringify(template.representation.toJSON()),
        }
    }

    deserialize({ data, variables }: { data: Data, variables: Array<Variable>}): Template {
        return new Template(
            data.name, 
            variables,
            TemplateRepresentation.fromJSON(JSON.parse(data.representation)),
            data.id
        );
    }
}

export default TemplateSerializer;