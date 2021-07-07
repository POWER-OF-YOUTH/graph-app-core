const neo4j = require('neo4j-driver');
const GraphMapper = require('../src/graph_mapper');
const Graph = require('../src/graph');
const ClassMapper = require('../src/class_mapper');
const Class = require('../src/class');
const Property = require('../src/property');
const Type = require('../src/type');


async function main(driver) {
    let gm = GraphMapper.new(driver);
    let graph = await gm.findById(...);

    let cm = ClassMapper.new(driver);
    let cls = Class.new("TestClass", [
        Property.new("A", Type.Number, 0),
        Property.new("B", Type.String, "")
    ]);
    
    await cm.save(graph, cls); // Save class to graph
}

const driver = neo4j.driver(...);

main(driver);
