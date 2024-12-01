const mysql = require("mysql2");

class SQL {
    conn;
    constructor(host, user, pass, db) {
        this.conn = mysql.createConnection({
            host: host,
            user: user,
            password: pass,
            database: db,
            charset: 'utf8'
        });
        this.conn.connect(function(err) { if (err) console.log(err.message); });
    }

    static simple(query, lambda, error=null){ this.make().query(query, lambda, error).close(); }
    

    static make(){
        return new SQL('db', 'user', 'password', 'appDB');    
    }

    query(query, lambda, lambda_error=null){
        console.log("\t\tSQL query", query);
        this.conn.query(query, (err, res, fields)=>{
            if(err){
                console.log(err);
                if(lambda_error)
                    lambda_error(err);
            }else if(lambda) lambda(res);
        });
        return this;
    }

    close(){
        this.conn.end(function(err) { if (err) console.log(err.message); });
    }
}

module.exports = SQL;