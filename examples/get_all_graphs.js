const neo4j = require('neo4j-driver');
const GraphMapper = require('../src/graph_mapper');
const Graph = require('../src/graph');

async function main(driver) {
    let gm = GraphMapper.new(driver);
    let graphs = await gm.all();
}

const driver = neo4j.driver(...);

main(driver);