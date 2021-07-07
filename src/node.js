const uuid = require('uuid').v4;

const Class = require('./class');
const Value = require('./value');

class Node 
{
    /**
     * 
     * @param {Class} cls 
     * @param {String} id 
     */
    constructor(cls, id) {
        this._cls = cls;
        this._id = id;
        this._values = new Map();
        let properties = cls.getProperties();
        for (let property of properties)
            this._values.set(property.getName(), new Value(property.getType(), property.getDefaultValue()));
    }

    /**
     * 
     * @param {Class} cls 
     * @returns {Node}
     */
    static new(cls) {
        return new Node(cls, uuid());
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
     * 
     * @returns {Arrray<Value>}
     */
    getValuesObjects() {
        return this._values.values();
    }
    
    /**
     * 
     * @param {String} name 
     * @returns {Value}
     */
    getValueObject(name) {
        return this._values.get(name);
    }

    /**
     * 
     * @param {String} name 
     * @param {Value} value 
     */
    setValueObject(name, value) {
        this._values.set(name, value);
    }

    /**
     * Get value
     * @param {String} name 
     * @returns {any}
     */
    getValue(name) {
        return this._values.get(name).getValue();
    }

    /**
     * Set value
     * @param {String} name 
     * @param {Value} value 
     */
    setValue(name, value) {
        this._values.get(name).setValue(value);
    }

    /**
     * 
     * @returns {{id: String, values: Array<{name: String, type: String, value: any}>}}
     */
    toJSON() {
        let id = this._id;
        let values = [];
        for (const [key, value] of this._values) {
            values.push({name: key, ...value.toJSON()});
        }
        return { id, values };
    }
}

module.exports = Node;