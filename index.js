const { Core, Property, Type } = require('./lib');

let c = new Core("bolt://0.0.0.0:7687", "neo4j", "niki3223");

c.createGraph("MyGraphasdad");

/*
c.createClass("MyGraph", "c", [
    new Property("A", Type.Number),
    new Property("B", Type.Number),
    new Property("C", Type.Number),
    new Property("D", Type.String),
    new Property("E", Type.String),
    new Property("F", Type.String)
])
.then(() => console.log("ok"))
.catch((err) => console.log("err"));*/

/*
c.deleteClass("MyGraph", "osas")
.then(() => console.log("ok"))
.catch((err) => console.log("err"));*/

exports = {
    Core,
    Property,
    Type
}