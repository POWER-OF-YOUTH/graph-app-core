import { Driver } from 'neo4j-driver';
interface IMapper<T> {
    get driver(): Driver;
    save(obj: T): Promise<void>;
    destroy(obj: T): Promise<void>;
}
export default IMapper;
