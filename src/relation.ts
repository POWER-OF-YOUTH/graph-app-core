import { v4 as uuid } from 'uuid';

import { Node, NodeData } from './node';

type RelationData = {
    id: string,
    name: string,
    from: NodeData,
    to: NodeData
};

class Relation 
{
    private readonly _from: Node;
    private readonly _to: Node;
    private readonly _id: string;
    private _name: string;

    constructor(from: Node, to: Node, name: string, id: string = uuid()) {
        this._from = from;
        this._to = to;
        this._name = name;
        this._id = id;
    }

    get from(): Node {
        return this._from;
    }

    get to(): Node {
        return this._to;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): string {
        return this._id;
    }

    toJSON(): RelationData {
        return {
            id: this._id,
            name: this._name,
            from: this._from.toJSON(),
            to: this._to.toJSON()
        }
    }
}

export default Relation;
export { Relation, RelationData }; 