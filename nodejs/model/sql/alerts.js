const Table = require("./table");
const TaskSQL = require('./task');
const UserSQL = require('./user')

class AlertSQL {
    constructor() {
        this.table = new Table("alerts");
    }

    change(id, descript) {
        return new Promise((resolve, reject) => {
            this.table.update({id: id}, {descript: descript}, ()=>{
                this.table.read(result=>resolve(result[0].task), {id: id}, reject);
            }, reject);
        });
    }

    write(writer, task, descript) {
        return new Promise((resolve, reject) => {
            this.table.create({ writer: writer, task: task, descript: descript }, resolve, reject);
        });
    }

    getByUser(ownerid) {
        return new Promise((resolve, reject) => {
            TaskSQL.table
                .join_on(this.table, "task", "id")
                .join_on(UserSQL.table, "id", this.table, "writer")
                .add_alias(this.table, "id", "id").add_alias(TaskSQL.table, "name", "task_name")
                .read({ "ownerid": ownerid })
                .then((data) => {
                    for (let i in data) {
                        data[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            login: data[i].login,
                            descript: data[i].descript,
                            isclosed: data[i].isclosed,
                            writer: data[i].writer,
                            task: data[i].task,
                            login: data[i].login,
                            task_name: data[i].task_name
                        }
                    }
                    resolve(data);
                }, reject);
        });
    }

    getByTask(taskId) {
        return new Promise((resolve, reject) => {
            TaskSQL.table
                .join_on(this.table, "task", "id")
                .join_on(UserSQL.table, "id", this.table, "writer")
                .add_alias(this.table, "id", "id").add_alias(TaskSQL.table, "name", "task_name")
                .read({ "task": taskId })
                .then((data) => {
                    for (let i in data) {
                        data[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            login: data[i].login,
                            descript: data[i].descript,
                            isclosed: data[i].isclosed,
                            writer: data[i].writer,
                            task: data[i].task,
                            login: data[i].login,
                            task_name: data[i].task_name,
                            ownerid: data[i].ownerid,
                        }
                    }
                    resolve(data);
                }, reject);
        });
    }

    open(id) {
        return new Promise((res, rej) => this.table.update({ id: id }, { isclosed: 0 }, res, rej));
    }

    close(id) {
        return new Promise((res, rej) => this.table.update({ id: id }, { isclosed: 1 }, res, rej));
    }

    delete(id) {
        return new Promise((res, rej) => this.table.delete({ id: id }, res, rej));
    }
}

module.exports = new AlertSQL();