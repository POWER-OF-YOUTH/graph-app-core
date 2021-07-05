const Property = require("./property")

class Class {
    /**
     * Private constructor
     * @param {String} name 
     * @param {Array<Property>} properties 
     */
    constructor(name, properties = []) {
        this._name = name;
        this._properties = properties;
    }

    /**
     * Private constructor
     * @param {String} name 
     * @param {Array<Property>} properties 
     * @returns {Class} class
     */
    static new(name, properties = []) {
        return new Class(name, properties);
    }

    getName() {
        return this._name;
    }

    getProperties() {
        return this._properties;
    }

    /**
     * @returns {{name: String, properties: Array<{name: String, type: String}>}}
     */
    toJSON() {
        return {
            name: this._name,
            properties: this._properties.map(p => { return { name: p.getName(), type: p.getType() }})
        }
    }
}

module.exports = Class;
