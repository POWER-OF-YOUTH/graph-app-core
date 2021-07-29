interface IDatabaseSerializer<T> {
    serialize(obj: T): any;

    deserialize({ ...other }): T;
}

export default IDatabaseSerializer;