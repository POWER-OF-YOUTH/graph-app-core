declare class Graph {
    private readonly _id;
    private readonly _date;
    private _name;
    private _description;
    /**
     *
     * @param {string} name
     * @param {string} description
     * @param {string} id
     * @param {Date} date
     */
    constructor(name: string, description: string, id?: string, date?: Date | number);
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
    get description(): string;
    /**
     *
     * @param {string} value
     */
    set description(value: string);
    /**
     *
     * @returns {string}
     */
    get id(): string;
    /**
     *
     * @returns {Date | number}
     */
    get date(): Date | number;
}
export default Graph;
