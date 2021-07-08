import { v4 as uuid } from 'uuid';

class Graph 
{
    private readonly _id: string;
    private readonly _date: Date | number;
    private _name: string;
    private _description: string;

    /**
     * 
     * @param {string} name
     * @param {string} description
     * @param {string} id
     * @param {Date} date
     */
    constructor(name: string, description: string, id: string = uuid(), date: Date | number = Date.now()) {
        if (name == null || description == null || id == null || date == null)
            throw new Error("Null reference exception!");
        
        this._name = name;
        this._description = description;
        this._id = id;
        this._date = date;
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
        this._name = value;
    }

    /**
     * 
     * @returns {string}
     */
    get description(): string {
        return this._description;
    }

    /**
     * 
     * @param {string} value
     */
    set description(value: string) {
        this._description = value;
    }

    /**
     * 
     * @returns {string}
     */
    get id(): string {
        return this._id;
    }
    
    /**
     * 
     * @returns {Date | number}
     */
    get date(): Date | number {
        return this._date;
    }
}

export default Graph;