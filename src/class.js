const Property = require("./property")

class Class {
    /**
     * Private constructor
     * @param {String} name 
     * @param {Array<Property>} properties 
     */
    constructor(name, properties = []) {
        this.name = name;
        this.properties = properties;
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
        return this.name;
    }

    getProperties() {
        return this.properties;
    }

    /**
     * @returns {{name: String, properties: Array<{name: String, type: String}>}}
     */
    toJSON() {
        return {
            name: this.name,
            properties: this.properties.map(p => { return { name: p.getName(), type: p.getType() }})
        }
    }
}

module.exports = Class;
