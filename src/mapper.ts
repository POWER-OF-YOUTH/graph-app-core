import { Driver, Result } from 'neo4j-driver';
import DatabaseError from './database_error';

abstract class Mapper<T> {
    protected readonly _driver: Driver;

    constructor(driver: Driver) {
        this._driver = driver;
    }

    get driver(): Driver {
        return this._driver;
    }

    abstract all(): Promise<Array<T>>;

    abstract findBy(d: any): Promise<T | null>;

    abstract save(obj: T): Promise<void>;

    abstract destroy(obj: T): Promise<void>;

    protected async runQuery(query: string, parameters: any): Promise<Result> {
        try {
            const session = this._driver.session();
            const result = await session.run(query, parameters);
            session.close();

            return result;
        }
        catch (err) {
            console.log(err);
            throw new DatabaseError();
        }
    }
}

export default Mapper;