import Graph from './graph';
import IDatabaseSerializer from './i_database_serializer';

type Data = {
    name: string,
    description: string,
    id: string,
    date: Date | number
}

class GraphSerializer implements IDatabaseSerializer<Graph> 
{
    serialize(graph: Graph): Data {
        return { 
            name: graph.name, 
            description: graph.description, 
            id: graph.id, 
            date: graph.date 
        } 
    }

    deserialize({ data }: { data: Data }): Graph {
        return new Graph(data.name, data.description, data.id, data.date);
    }
}

export default GraphSerializer;