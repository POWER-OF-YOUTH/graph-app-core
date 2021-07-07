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
    let clss = await cm.all(graph); // Array<Class>
}

const driver = neo4j.driver(...);

main(driver);
