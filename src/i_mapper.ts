import { Driver } from 'neo4j-driver';

interface IMapper<T>
{
    get driver(): Driver;
    all(): Promise<Array<T>>
    findBy(d: any): Promise<T | null>
    save(obj: T): Promise<void>;
    destroy(obj: T): Promise<void>;
}

export default IMapper;