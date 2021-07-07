class Value
{
    /**
     * Private constructor
     * @param {Type} type
     * @param {any} value
     */
    constructor(type, value) {
        this._type = type;
        this._value = value;
    }

    /*
    static new(type, value) {
        return new Value(type, value);
    }
    */

    /**
     * Get value type
     * @returns {Type}
     */
    getType() {
        return this._type;
    }

    /**
     * Set value
     * @param {any} value 
     */
    set(value) {
        this._value = value
    }

    /**
     * Get value
     * @returns {any}
     */
    get() {
        return this._value;
    }

    toJSON() {
        return {
            type: this._type,
            value: this._value
        }
    }
}

module.exports = Value;
