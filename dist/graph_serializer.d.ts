import Graph from './graph';
import IDatabaseSerializer from './i_database_serializer';
declare type Data = {
    name: string;
    description: string;
    id: string;
    date: Date | number;
};
declare class GraphSerializer implements IDatabaseSerializer<Graph> {
    serialize(graph: Graph): Data;
    deserialize({ data }: {
        data: Data;
    }): Graph;
}
export default GraphSerializer;
