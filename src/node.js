const uuid = require('uuid').v4;

const Class = require('./class');
const Value = require('./value');

class Node 
{
    /**
     * Private constructor
     * @param {String} id
     */
    constructor(id, values) {
        this._id = id;
        this._values = values;
    }

    /**
     * 
     * @param {Class} cls 
     * @returns {Node}
     */
    static new(cls) {
        let properties = cls.getProperties();
        let values = new Map();
        for (property of properties)
            values.set(property.getName(), Value.new(property.getType, property.getDefaultValue));
        return new Node(uuid, values);
    }

    /**
     * Get id
     * @returns {String}
     */
    getId() {
        return this._id;
    }

    /**
     * Get value
     * @param {String} name 
     * @returns {Value}
     */
    getValue(name) {
        return this._values.get(name);
    }

    /**
     * Set value
     * @param {String} name 
     * @param {Value} value 
     */
    setValue(name, value) {
        this._values.set(name, value);
    }

    /**
     * 
     * @returns {{id: String, values: Array<{name: String, type: String, value: any}>}}
     */
    toJSON() {
        return {
            id: this._id,
            values: this._values.keys().map(k => { return { name: k, type: this._values.get(k).getType(), value: this._values.get(k).getValue() }})
        }
    }
}

module.exports = Node;