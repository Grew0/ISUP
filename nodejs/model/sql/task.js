const Table = require("./table");
const SubsSQL = require("./subs");
const { DATEFORMAT_2 } = require("../../views/helpers/pretty_date");
const DateFormat = (date) => {return DATEFORMAT_2(date).replace(" ", "T") };

class TaskSQL {
    table
    constructor() {
        this.table = new Table("tasks");
    }

    async create(name, description, deadline, priority, ownerid, top_level = null) {
        return new Promise((resolve, reject) => {
            this.table.create({
                name: name,
                descript: description,
                deadline: DateFormat(deadline),
                priority: priority,
                isclosed: false,
                ownerid: ownerid,
                toplevelid: top_level
            }, _ => {
                SubsSQL.subscribe(ownerid, _.insertId).then(__ => resolve(_), reject);
            }, reject);
        })
    }

    read(func, error = null) {
        this.read_where(null, (result) => {
            for (let i in result) {
                if (result[i].isclosed) result[i].name += " (Закрыто)";
            }
            func(result);
        }, error);
    }

    read_where(where, func, error = null) {
        this.table.read((result) => {
            for (let i in result) {
                if (result[i].isclosed) result[i].name += " (Закрыто)";
            }
            func(result);
        }, where, error);
    }

    delete(id, result, error) {
        if (id == null) return;
        this.table.delete({ id: id }, result, error);
    }

    async getChildren(parentId) {
        return new Promise((resolve, reject) => {
            this.table.read(resolve, { toplevelid: parentId }, reject);
        });
    }

    async update(id, entry) {
        return new Promise((res, rej) => {
            if (entry.deadline) entry.deadline = DateFormat(entry.deadline);
            if (entry.ownerid)
                SubsSQL.subscribe(Number(entry.ownerid), id).then(() => {
                    this.table.update({ id: Number(id) }, entry, res, rej);
                }, rej);
            else this.table.update({ id: Number(id) }, entry, res, rej);
        });
    }


    async checkOwner(ownerid, taskid) {
        // true if task eather owned, or toplevel owned 
        ownerid = Number(ownerid); taskid = Number(taskid);
        return new Promise((res, rej) => {
            this.read_where({ id: taskid }, (entry => {
                if (entry.length != 1) {
                    rej(new Error("task is not found"));
                } else if (ownerid == entry[0].ownerid) {
                    res(true);
                } else this.read_where({ id: entry[0].toplevelid }, (entry) => {
                    if (entry.length != 1) {
                        res(false);
                    } else if (ownerid == entry[0].ownerid) {
                        res(2);
                    } else res(false);
                }, rej);
            }), rej);
        });
    }

    async close(taskid) {
        return new Promise((res, rej) => {
            this.table.read((result) => {
                console.log(result);
                if (result.length == 0)
                    this.table.update({ id: taskid }, { isclosed: 1 }, _ => res(true), rej);
                else res(false);
            }, { toplevelid: taskid, isclosed: 0 }, rej);
        });
    }

    async open(taskid) {
        return new Promise((res, rej) => {
            this.table.read((result) => {
                if (result.length != 1) {
                    res(false);
                    return;
                }
                this.table.read((result) => {
                    if (result.length == 0)
                        this.table.update({ id: taskid }, { isclosed: 0 }, _ => res(true), rej);
                    else res(false);
                }, { id: result[0].toplevelid || -1, isclosed: 1 }, rej);
            }, { id: taskid, isclosed: 1 }, rej);
        });
    }
}

module.exports = new TaskSQL();