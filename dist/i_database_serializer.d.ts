interface IDatabaseSerializer<T> {
    serialize(obj: T): any;
    deserialize({ ...other }: {
        [x: string]: any;
    }): T;
}
export default IDatabaseSerializer;
