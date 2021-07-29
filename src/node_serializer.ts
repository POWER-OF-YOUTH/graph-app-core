import Node from './node';
import VariableSerializer from './variable_serializer';
import IDatabaseSerializer from './i_database_serializer';
import Variable from './variable';
import Template from './template';

type Data = {
    id: string,
    x: number,
    y: number,
};

class NodeSerializer implements IDatabaseSerializer<Node> 
{
    private readonly _variableSerializer = new VariableSerializer();

    serialize(node: Node): Data {
        return {
            id: node.id,
            x: node.x,
            y: node.y
        }
    }

    deserialize({data, template, variables}: {data: Data, template: Template, variables: Array<Variable>}): Node {
        return new Node(
           template, 
           data.x, 
           data.y, 
           data.id, 
           variables
        );
    }
}

export default NodeSerializer;