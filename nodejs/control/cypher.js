const bcrypt = require('bcrypt');

const round = 10;

class Cypher{
    async hash(str){ return  bcrypt.hash(str, round); }
    async compare(str, hashed){ return bcrypt.compare(str, hashed); }
}
  
module.exports = new Cypher();