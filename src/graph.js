const uuid = require('uuid').v4;

const Class = require('./class');

class Graph
{
    /**
     * Private contructor
     * @param {String} id 
     * @param {String} name 
     * @param {String} description 
     * @param {Date} date 
    */
    constructor(id, name, description, date) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._date = date;
    }

    /**
     * 
     * @param {String} name 
     * @param {String} description 
     * @returns {Graph} graph
     */
    static new(name, description)
    {
        return new Graph(uuid(), name, description, Date.now());
    }

    /**
     * Get graph id
     * @returns {String} uuid
     */
    getId() {
        return this._id;
    }

    /**
     * Get graph name
     * @returns {String} Graph name
     */
    getName() {
        return this._name;
    }

    /**
     * Set graph name
     * @param {String} name 
     * @returns {void}
     */
    setName(name) {
        this._name = name;
    }

    /**
     * Get graph description
     * @returns {String} Graph description
     */
    getDescription() {
        return this._description;
    }

    /**
     * Set graph description
     * @param {String} description 
     * @returns {void}
     */
    setDescription(description) {
        this._description = description;
    }

    /**
     * Get graph creation date
     * @returns {String} Creation date
     */
    getCreationDate() {
        return this._date;
    }

    /**
     * Convert to JSON
     * @returns {{id: String, name: String, description: String, date: String}}
     */
    toJSON() {
        return { 
            id: this._id, 
            name: this._name,  
            description: this._description,
            date: this._date
        }
    }
}

module.exports = Graph;
