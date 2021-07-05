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

    static new() {
        return new Value(type, value);
    }

    getType() {
        return this._type;
    }

    getValue() {
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
