class DatabaseError extends Error
{
    /**
     * 
     * @param {String} message 
     */
    constructor(message = "Database error!")
    {
        super(message);
        this.name = "DatabaseError";
    }
}

module.exports = DatabaseError;