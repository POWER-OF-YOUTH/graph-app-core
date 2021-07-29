import { Node, NodeData } from './node';
declare type RelationData = {
    id: string;
    name: string;
    from: NodeData;
    to: NodeData;
};
declare class Relation {
    private readonly _from;
    private readonly _to;
    private readonly _id;
    private _name;
    constructor(from: Node, to: Node, name: string, id?: string);
    get from(): Node;
    get to(): Node;
    get name(): string;
    set name(value: string);
    get id(): string;
    toJSON(): RelationData;
}
export default Relation;
export { Relation, RelationData };
