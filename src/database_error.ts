class DatabaseError extends Error
{
    constructor(message = "Database error!")
    {
        super(message);
        this.name = "DatabaseError";
    }
}

export default DatabaseError;
