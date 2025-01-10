const TaskSQL = require("../../model/sql/task");
const UserSQL = require("../../model/sql/user");
const { DATEFORMAT } = require("../../views/helpers/pretty_date");

let threrr = (err) => { throw err; };

let name = "name", desc = "desc", deadline = new Date(), ownerid, priority = 5;
let taskid;
let testUserLogin = "test login";

describe("Tests of TestSQL", function () {
    // Create a task
    it("create task (and a user)", async () => {
        await new Promise((resolve, reject) => UserSQL.create("name", testUserLogin, "pass", resolve, reject));
        let id = (await new Promise((res, rej) => UserSQL.read_where({ login: testUserLogin }, res, rej)))[0].id;
        ownerid = id;
        let _ = await TaskSQL.create(name, desc, deadline, priority, id);
        let result = await new Promise((res, rej) => TaskSQL.read_where({ ownerid: id }, res, rej));
        if (result.length != 1) throw new Error("Task is incorrect: " + result);
        result = result[0];
        taskid = result.id;
        if (result.name != name || result.descript != desc || DATEFORMAT(result.deadline) != DATEFORMAT(deadline)
            || result.priority != priority) {
            throw new Error("Wrong result: " + JSON.stringify(result) + " " +
                JSON.stringify({ name: name, descript: desc, deadline: deadline, priority: priority }));
        }
    });
    // Change a task
    it("update task", async () => {
        name += " new";
        desc += " new";
        deadline = new Date();
        priority += 2;

        let _ = await TaskSQL.update(taskid, { name: name, descript: desc, deadline: deadline, priority: priority });
        let result = await new Promise((res, rej) => TaskSQL.read_where({ id: taskid }, res, rej));
        if (result.length != 1) throw new Error("can't read a task");
        result = result[0];
        if (DATEFORMAT(result.deadline) != DATEFORMAT(deadline) || result.name != name
            || result.descript != desc || result.priority != priority)
            throw new Error("Wrong result: " + JSON.stringify(result) + " " +
                JSON.stringify({ name: name, desc: desc, deadline: deadline, priority: priority }));
    });


    let ownerid2, ownerid3;
    let taskid2, taskid4;

    //Creating subtasks
    it("create children", async () => {
        await new Promise((resolve, reject) => UserSQL.create("name", testUserLogin + "2", "pass", resolve, reject));
        await new Promise((resolve, reject) => UserSQL.create("name", testUserLogin + "3", "pass", resolve, reject));

        await new Promise((resolve, reject) => UserSQL.read_where({ login: testUserLogin + '2' }, (result) => {
            ownerid2 = result[0].id; resolve();
        }, reject));

        await new Promise((resolve, reject) => UserSQL.read_where({ login: testUserLogin + '3' }, (result) => {
            ownerid3 = result[0].id; resolve();
        }, reject));

        await Promise.all([
            TaskSQL.create(name + "2", desc, deadline, priority, ownerid2, taskid),
            TaskSQL.create(name + "3", desc, deadline, priority, ownerid3, taskid)]);

        let children = await new Promise((resolve, reject) => {
            TaskSQL.read_where({ toplevelid: taskid }, resolve, reject);
        });

        if (children.length != 2) throw new Error("Wrong children 1: " + JSON.stringify(children));
        let ownerids = [children[0].ownerid, children[1].ownerid];
        if (ownerids.indexOf(ownerid2) == -1 || ownerids.indexOf(ownerid3) == -1)
            throw new Error("Wrong children 2: " + JSON.stringify(children) + " with ownerid must be in {" + ownerid2 + ", " + ownerid3 + "}");

        let child = children[0];
        if (child.login != testUserLogin + "2") child = children[1];
        taskid2 = child.id;

        await TaskSQL.create(name + "4", desc, deadline, priority, ownerid3, taskid2);
        let result = await new Promise((res, rej) => TaskSQL.read_where({ toplevelid: taskid2 }, res, rej));
        taskid4 = result[0].id;
    });

    // Getting subtasks
    it("get children", async () => {
        let children = await TaskSQL.getChildren(taskid);
        if (children.length != 2) throw new Error("Wrong children " + children);
        let ownerids = [children[0].ownerid, children[1].ownerid];
        if (ownerids.indexOf(ownerid2) == -1 || ownerids.indexOf(ownerid3) == -1)
            throw new Error("Wrong children 2: " + JSON.stringify(children) + " with ownerid must be in {" + ownerid2 + ", " + ownerid3 + "}");
    });


    // checkOwner
    it("checkOwner", async () => {
        let res1 = await TaskSQL.checkOwner(ownerid, taskid); // true
        let res2 = await TaskSQL.checkOwner(ownerid, taskid2); // 2
        let res3 = await TaskSQL.checkOwner(ownerid, taskid4); // false

        if (res1 !== true)
            throw new Error(`task1 ${taskid}, owner1 ${ownerid}, res is ${res1} must be true`);
        if (res2 !== 2)
            throw new Error(`task2 ${taskid2}, owner1 ${ownerid}, res is ${res2} must be 2`);
        if (res3 !== false)
            throw new Error(`task4 ${taskid4}, owner1 ${ownerid}, res is ${res3} must be false`);
    });

    // Close
    it("Close", async () => {
        if (await TaskSQL.close(taskid) !== false)
            throw new Error(`Task1 ${taskid} must be open - its subtasks are open`);

        if (await TaskSQL.close(taskid4) !== true)
            throw new Error(`Task4 ${taskid4} must be closed - no subtasks`);

        if (await TaskSQL.close(taskid2) !== true)
            throw new Error(`Task2 ${taskid2} must be closed - no subtasks`);
    });
    // Open
    it("Open", async () => {
        if (await TaskSQL.open(taskid) !== false)
            throw new Error(`Task1 ${taskid} is open on its own`);

        if (await TaskSQL.open(taskid4) !== false)
            throw new Error(`Task4 ${taskid4} cannot be opened - task2 must be closed`);

        if (await TaskSQL.open(taskid2) !== true)
            throw new Error(`Task2 ${taskid2} must be easy to open`);

        if (await TaskSQL.open(taskid4) !== true)
            throw new Error(`Task4 ${taskid4} must be easy to open`);
    });

    it("delete", async () => {
        await new Promise((resolve, reject) => TaskSQL.delete(taskid, resolve, reject));

        let reses = await Promise.all([
            new Promise((resolve, reject) => TaskSQL.read_where({ id: taskid }, resolve, reject)),
            new Promise((resolve, reject) => TaskSQL.read_where({ id: taskid2 }, resolve, reject)),
            new Promise((resolve, reject) => TaskSQL.read_where({ id: taskid4 }, resolve, reject))
        ]);

        Array.from(reses).forEach(i => {
            if (i.length != 0)
                throw new Error("Task must be deleted " + i);
        });

        await Promise.all([UserSQL.delete(testUserLogin), UserSQL.delete(testUserLogin + "2"), UserSQL.delete(testUserLogin + "3")])
    });
});