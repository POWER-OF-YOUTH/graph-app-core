const neo4j = require("neo4j-driver");
const authData = require("./authData.json");

var driver;
beforeAll(() => {
    driver = neo4j.driver(authData.hostname, neo4j.auth.basic(authData.username, authData.password));
})

test("ExampleTest", async () => {
    expect(2).toBe(2);
})