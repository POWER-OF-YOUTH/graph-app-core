const neo4j = require('neo4j-driver');
const GraphMapper = require('../src/graph_mapper');
const Graph = require('../src/graph');
const ClassMapper = require('../src/class_mapper');
const Class = require('../src/class');
const NodeMapper = require('../src/node_mapper');
const Node = require('../src/node');
const Property = require('../src/property');
const Type = require('../src/type');


async function main(driver) {
    let gm = GraphMapper.new(driver);
    let graph = await gm.findById(...);

    let cm = ClassMapper.new(driver);
    let cls = cm.findByName(graph, "TestClass");

    let nm = NodeMapper.new(driver);
    let node = await nm.findById(graph, ...);

    node.setValue("A", 4);
    
    await nm.save(graph, node);
}

const driver = neo4j.driver(...);

main(driver);
