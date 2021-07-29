import { v4 as uuid } from 'uuid';

type GraphData = {
    id: string,
    name: string,
    description: string,
    date: Date | number
}

class Graph 
{
    private readonly _id: string;
    private readonly _date: Date | number;
    private _name: string;
    private _description: string;

    constructor(name: string, description: string, id: string = uuid(), date: Date | number = Date.now()) {
        this._name = name;
        this._description = description;
        this._id = id;
        this._date = date;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get id(): string {
        return this._id;
    }
    
    get date(): Date | number {
        return this._date;
    }

    static fromJSON(data: GraphData): Graph {
        return new Graph(
            data.name,
            data.description,
            data.id,
            data.date
        );
    }

    toJSON(): GraphData {
        return {
            id: this._id,
            name: this._name,
            description: this._description,
            date: this._date
        }
    }
}

export default Graph;
export { Graph, GraphData };