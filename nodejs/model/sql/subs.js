const Table = require("./table");
const SQLRaw = require("./sql");

class SubsSQL{
    constructor(){
        this.table = new Table("subs");
    } 

    async subscribe(user, task){
        return new Promise((resolve, reject)=>{
            this.table.create({user: user, task: task}, resolve, err=>{
                if(err.message.includes("Duplicate"))
                    resolve();
                else reject(err);
            });
        });
    }

    async unsubscribe(user, task){
        return new Promise((resolve, reject)=>{
            this.table.delete({user: user, task: task}, resolve, reject);
        });
    }

    async aware(task){
        return new Promise((resolve, reject)=>{
            this.table.update({task: Number(task)}, {watched: 0}, resolve, reject);
        });
    }

    async isSubscribed(task, user){
        return new Promise((resolve, reject)=>{
            this.table.read((result)=>{
                if(result.length == 1)resolve(true);
                else resolve(false);
            }, {user: Number(user), task: Number(task)}, reject);
        });

    }

    async watch(task, user){
        return new Promise((resolve, reject)=>{
            this.table.update({user: Number(user), task: Number(task)}, {watched: 1}, resolve, reject);
        });
    }

    async isawared(task, user){
        return new Promise((resolve, reject)=> {
            this.table.read((result)=>{
                if(result.length != 1)reject(new Error('no such entry'));
                else resolve(Boolean(result[0].watched));
            }, {task: Number(task), user: Number(user)}, reject);
        })
    }

    async getSubs(user){
        return new Promise((resolve, reject)=>{
            SQLRaw.simple("select name, id, watched from subs as s join tasks as t on " + 
                " t.id = s.task where user = " + user + " order by watched", resolve, reject);
        });
    }
}

module.exports = new SubsSQL();