import Node from './node';
import IDatabaseSerializer from './i_database_serializer';
import Variable from './variable';
import Template from './template';
declare type Data = {
    id: string;
    x: number;
    y: number;
};
declare class NodeSerializer implements IDatabaseSerializer<Node> {
    private readonly _variableSerializer;
    serialize(node: Node): Data;
    deserialize({ data, template, variables }: {
        data: Data;
        template: Template;
        variables: Array<Variable>;
    }): Node;
}
export default NodeSerializer;
