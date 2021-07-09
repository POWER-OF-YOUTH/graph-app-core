import { v4 as uuid } from 'uuid';

import Node from './node';

class Relation 
{
    private readonly _from: Node;
    private readonly _to: Node;
    private readonly _id: string;
    private _name: string;

    /**
     * 
     * @param {Node} from
     * @param {Node} to
     * @param {string} name
     * @param {string} id 
     */
    constructor(from: Node, to: Node, name: string, id: string = uuid()) {
        if (from == null || to == null || name == null || id == null)
            throw new Error("Null reference exception!");
        
        this._from = from;
        this._to = to;
        this._name = name;
        this._id = id;
    }

    /**
     * 
     * @returns {Node}
     */
    get from(): Node {
        return this._from;
    }

    /**
     * 
     * @returns {Node}
     */
    get to(): Node {
        return this._to;
    }

    /**
     * 
     * @returns {string}
     */
    get name(): string {
        return this._name;
    }

    /**
     * 
     * @param {string} value
     */
    set name(value: string) {
        if (value == null)
            throw new Error("Null reference exception!");
        
        this._name = value;
    }

    /**
     * 
     * @returns {string}
     */
    get id(): string {
        return this._id;
    }
}

export default Relation;