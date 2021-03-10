const Type = require('./type');

class Property {
    /**
     * 
     * @param {String} name 
     * @param {Array<Type>} properties 
     */
    constructor(name, type) {
        this._name = name;
        this._type = type;
    }

    /**
     * @returns {String} Returns property name
     */
    getName() {
        return this._name;
    }

    /**
     * @return {Type} Returns property type
     */
    getType() {
        return this._type;
    }
}

module.exports = Property;