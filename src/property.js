const Type = require('./type');

class Property {
    /**
     * Private constructor
     * @param {String} name 
     * @param {Type} type 
     */
    constructor(name, type, defaultValue) {
        this._name = name;
        this._type = type;
        this._defaultValue = defaultValue;
    }

    new(name, type, defaultValue) {
        return new Property(name, type, defaultValue);
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

    getDefaultValue() {
        return this._defaultValue;
    }

    toJSON() {
        return {
            name: this._name,
            type: this._type,
            defaultValue: this._defaultValue
        }
    }
}

module.exports = Property;
