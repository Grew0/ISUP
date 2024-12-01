const Table = require("./table");
const SubsSQL = require('./subs');

class ComSQL{
    constructor(){
        this.table = new Table("comments");
    }

    async write(content, writer, task){
        await SubsSQL.aware(task);

        return new Promise((resolve, reject)=>{
            this.table.create({content:content, writer: writer, task: task}, resolve, reject);
        });
    }

    async get(task){
        return new Promise((resolve, reject)=>{
            this.table.read(resolve, {task: task}, reject);
        });
    }
}

module.exports = new ComSQL();