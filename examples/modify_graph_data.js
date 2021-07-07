const neo4j = require('neo4j-driver');
const GraphMapper = require('../src/graph_mapper');
const Graph = require('../src/graph');

async function main(driver) {
    let gm = GraphMapper.new(driver);
    let graph = await gm.findById("...");

    graph.setName("NewName");
    graph.setDescription("New description");

    await gm.save(graph);
}

const driver = neo4j.driver(...);

main(driver);
