const Cypher = require("../../control/cypher.js");

describe("Cypher", function () {
    // Compare and hash
    it("Compare and hash", async () => {
        let passes = ["asjdfhasfd", "8w7f9", "sa68+df76aw87e3r4ta#W$"];

        for (let i in passes) {
            if (await Cypher.compare(passes[i], await Cypher.hash(passes[i])) !== true) {
                throw (new Error("Same strings must be equals after hashing"));
            }
        }

        for (let i in passes) {
            if (await Cypher.compare("String that is not in array", await Cypher.hash(passes[i])) !== false) {
                throw (new Error("Different strings must not be equals after hashing"));
            }
        }
    });
});