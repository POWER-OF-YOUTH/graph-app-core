const neo4j = require('neo4j-driver');

class Core {
    /**
     * 
     * @param {String} hostname Hostname
     * @param {String} user Database username
     * @param {String} password User password
     */
    constructor(hostname, user, password) {
        this._driver = neo4j.driver(hostname, neo4j.auth.basic(user, password), { disableLosslessIntegers: true });
    }

    /**
     * 
     * @param {String} name Graph name
     * @returns {Promise<{name: String, created: Date}>}
     */
    async createGraph(name) {
        try {
            var dbResponse = await this._driver.session()
                .run("CREATE (n:Graph) SET n = { name: $name, created: $date } RETURN n", { name: name, date: Date.now() });
        }
        catch (err) {
            throw new Error("Database error!");
        }

        let graph = dbResponse.records[0].get("n").properties;

        return graph;
    }

    /**
     * 
     * @param {String} name Graph name
     * @returns {Promise} 
     */
    async deleteGraph(name) {
        try {
            var dbResponse = await this._driver.session()
                .run("MATCH (n:Graph)-[rel:CONTAINS]->(m) WHERE n.name = $name DELETE rel, m, n", { name: name });
        }
        catch (err) {
            throw new Error("Database error!");
        }
    }
}

module.exports = Core;