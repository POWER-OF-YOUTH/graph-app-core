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
        this.id = id;
        this.name = name;
        this.description = description;
        this.date = date;
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
        return this.id;
    }

    /**
     * Get graph name
     * @returns {String} Graph name
     */
    getName() {
        return this.name;
    }

    /**
     * Set graph name
     * @param {String} name 
     * @returns {void}
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Get graph description
     * @returns {String} Graph description
     */
    getDescription() {
        return this.description;
    }

    /**
     * Set graph description
     * @param {String} description 
     * @returns {void}
     */
    setDescription(description) {
        this.description = description;
    }

    /**
     * Get graph creation date
     * @returns {String} Creation date
     */
    getCreationDate() {
        return this.date;
    }

    /**
     * Convert to JSON
     * @returns {{id: String, name: String, description: String, date: String}}
     */
    toJSON() { // TODO: 
        return { 
            id: this.id, 
            name: this.name,  
            description: this.description,
            date: this.date
        }
    }
}

module.exports = Graph;
