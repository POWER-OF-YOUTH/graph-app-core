const Type = require('./type');

class Property {
    /**
     * 
     * @param {String} name 
     * @param {Type} properties 
     */
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }

    /**
     * @returns {String} Returns property name
     */
    getName() {
        return this.name;
    }

    /**
     * @return {Type} Returns property type
     */
    getType() {
        return this.type;
    }
}

module.exports = Property;