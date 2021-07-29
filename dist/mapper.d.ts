import { Driver, Result } from 'neo4j-driver';
declare abstract class Mapper<T> {
    protected readonly _driver: Driver;
    constructor(driver: Driver);
    get driver(): Driver;
    abstract all(): Promise<Array<T>>;
    abstract findBy(d: any): Promise<T | null>;
    abstract save(obj: T): Promise<void>;
    abstract destroy(obj: T): Promise<void>;
    protected runQuery(query: string, parameters: any): Promise<Result>;
}
export default Mapper;
