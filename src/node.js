const uuid = require('uuid').v4;

const Class = require('./class');
const Value = require('./value');

class Node 
{
    /**
     * 
     * @param {Class} cls 
     * @param {String} id 
     * @param {Array<Value>} values 
     */
    constructor(cls, id, values) {
        this._cls = cls;
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
        for (let property of properties)
            values.set(property.getName(), Value.new(property.getType(), property.getDefaultValue()));
        return new Node(cls, uuid(), values);
    }

    /**
     * Get id
     * @returns {String}
     */
    getId() {
        return this._id;
    }

    /**
     * Get class
     * @returns {Class}
     */
    getClass() {
        return this._cls;
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
        let id = this._id;
        let values = [];
        for (const [key, value] of this._values) {
            values.push({name: key, type: value.getType(), value: value.getValue()});
        }
        return { id, values };
    }
}

module.exports = Node;