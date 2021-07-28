declare type GraphData = {
    id: string;
    name: string;
    description: string;
    date: Date | number;
};
declare class Graph {
    private readonly _id;
    private readonly _date;
    private _name;
    private _description;
    constructor(name: string, description: string, id?: string, date?: Date | number);
    get name(): string;
    set name(value: string);
    get description(): string;
    set description(value: string);
    get id(): string;
    get date(): Date | number;
    toJSON(): GraphData;
}
export default Graph;
export { Graph, GraphData };
