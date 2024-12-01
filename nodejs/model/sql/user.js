const Table = require("./table");
const Cypher = require("../../control/cypher");

class UserSQL{
    table 
    constructor(){
        this.table = new Table("users");
    }

    create(name, login, password, func=null, error=null){
        (async ()=>{ this.table.create({name: name, login: login, password: await Cypher.hash(password)}, func, error) })();
    }

    read(func, error = null){
        this.read_where(null, func, error);
    }

    read_where(where, func, error = null){
        this.table.read(func, where, error);
    }

    delete(login){
        return new Promise((resolve, reject)=>this.table.delete({login: login}, resolve, reject));
    }

    enter(login, password){
        let fun = (resolve, reject)=>{
            this.read_where({login: login}, async (res)=>{
                if(res.length != 1) {
                    reject(new Error('login is wrong'));
                    return;
                }
                    
                if(!res[0]?.password){
                    reject(new Error('no password given'));
                    return;
                }
                if(await Cypher.compare(password, res[0].password)){
                    resolve(res[0]);
                }else{ reject(new Error("password is wrong")); }
            }, (err)=>{ reject(err); });
        };
        return new Promise(fun);
    }

    register(login, password, name){
        let fun = (resolve, reject) => this.create(name, login, password, resolve, reject);
        return new Promise(fun);
    }

    getById(id){
        return new Promise(async (resolve, reject)=>{
            this.table.read(result=>{
                result.length == 1? resolve(result[0]): reject(new Error("No such user"));
            }, {id: id}, reject);
        });
    }

    likeLoginOrName(string){
        return new Promise(async (resolve, reject)=>{
            this.table.read_where_SQL(resolve, `name like "%${string}%" or login like "%${string}%"`, reject);
        })
    }
}

module.exports = new UserSQL();