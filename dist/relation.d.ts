import Node from './node';
declare class Relation {
    private readonly _from;
    private readonly _to;
    private readonly _id;
    private _name;
    /**
     *
     * @param {Node} from
     * @param {Node} to
     * @param {string} name
     * @param {string} id
     */
    constructor(from: Node, to: Node, name: string, id?: string);
    /**
     *
     * @returns {Node}
     */
    get from(): Node;
    /**
     *
     * @returns {Node}
     */
    get to(): Node;
    /**
     *
     * @returns {string}
     */
    get name(): string;
    /**
     *
     * @param {string} value
     */
    set name(value: string);
    /**
     *
     * @returns {string}
     */
    get id(): string;
}
export default Relation;
