const AlertSQL = require("../../model/sql/alerts");
const UserSQL = require("../../model/sql/user");
const TaskSQL = require("../../model/sql/task");
const assert = require("assert");

let testUserLogin = "testUserLogin";
let taskid, taskid2, taskid3, userid, userid2, userid3, userid4;
let alertid, alertid2, alertid3, alertid4, alertid5, alertid6;

describe("Tests of AlertSQL", function () {
    it("Init", async () => {
        let make_user = async (num) => {
            await new Promise((resolve, reject) => UserSQL.create("No name", testUserLogin + num, "No password", resolve, reject));
            return await new Promise((resolve, reject) => UserSQL.read_where({ login: testUserLogin + num },
                _ => resolve(_[0].id), reject));
        };

        userid = await make_user("");
        userid2 = await make_user("2");
        userid3 = await make_user("3");
        userid4 = await make_user("4");

        let make_task = async (owner) => {
            return (await TaskSQL.create("Test task", "Description", new Date(), 5, owner)).insertId;
        }

        taskid = await make_task(userid);
        taskid2 = await make_task(userid2);
        taskid3 = await make_task(userid2);
    });

    // Subscribe and isSubscribe
    it("Write", async () => {
        alertid = (await AlertSQL.write(userid4, taskid, "Test alert1")).insertId;
        alertid2 = (await AlertSQL.write(userid3, taskid, "Test alert2")).insertId;
        alertid3 = (await AlertSQL.write(userid4, taskid2, "Test alert3")).insertId;
        alertid4 = (await AlertSQL.write(userid2, taskid2, "Test alert4")).insertId;
        alertid5 = (await AlertSQL.write(userid2, taskid3, "Test alert5")).insertId;
        alertid6 = (await AlertSQL.write(userid3, taskid3, "Test alert6")).insertId;
    });

    it("getByUser1", async () => {
        let arr = (await AlertSQL.getByUser(userid));
        assert(arr.length == 2);
        arr = arr.map((el) => el.id).sort();
        assert("" + arr == "" + [alertid, alertid2].sort());
    });

    it("getByUser2", async () => {
        let arr = (await AlertSQL.getByUser(userid2));
        assert(arr.length == 4);
        arr = arr.map((el) => el.id).sort();
        assert("" + arr == "" + [alertid3, alertid4, alertid5, alertid6].sort());
    });

    it("getByUser3", async () => {
        let arr = (await AlertSQL.getByUser(userid3));
        assert(arr.length == 0);
    });

    it("getByUser4", async () => {
        let arr = (await AlertSQL.getByUser(userid4));
        assert(arr.length == 0);
    });

    it("getByTask1", async () => {
        let arr = (await AlertSQL.getByTask(taskid));
        assert(arr.length == 2);
        arr = arr.map((el) => el.id).sort();
        assert("" + arr == "" + [alertid, alertid2].sort());
    });

    it("getByTask2", async () => {
        let arr = (await AlertSQL.getByTask(taskid2));
        assert(arr.length == 2);
        arr = arr.map((el) => el.id).sort();
        assert("" + arr == "" + [alertid3, alertid4].sort());
    });
    
    it("getByTask3", async () => {
        let arr = (await AlertSQL.getByTask(taskid3));
        assert(arr.length == 2);
        arr = arr.map((el) => el.id).sort();
        assert("" + arr == "" + [alertid5, alertid6].sort());
    });

    it("Change", async () => {
        AlertSQL.change(alertid, "New alert desc");
        let arr = (await AlertSQL.getByUser(userid));
        assert(arr.length == 2);
        arr = arr.map((el) => el.descript).sort();
        assert("" + arr == "" + ["New alert desc", "Test alert2"].sort());
    });


    it("Close", async () => {
        await AlertSQL.close(alertid);
        let arr = (await AlertSQL.getByUser(userid));
        assert(arr.length == 2);
        arr = arr.map((el) => el.isclosed).sort();
        assert("" + arr == "" + [0, 1]);       
    });

    it("Open", async () => {
        await AlertSQL.open(alertid);
        let arr = (await AlertSQL.getByUser(userid));
        assert(arr.length == 2);
        arr = arr.map((el) => el.isclosed).sort();
        assert("" + arr == "" + [0, 0]);       
    });

    it("Delete", async () => {
        await Promise.all([
            AlertSQL.delete(alertid),
            AlertSQL.delete(alertid2),
            AlertSQL.delete(alertid3),
            AlertSQL.delete(alertid4),
            AlertSQL.delete(alertid5),
            AlertSQL.delete(alertid6)
        ]);

        let ans = (await Promise.all([
            AlertSQL.getByUser(userid), 
            AlertSQL.getByUser(userid2) 
        ]));
        assert("" + ans == "" + [[], []]);
    });

    it("Clear tasks", async () => {
        let del_task = (taskid) => new Promise((resolve, reject) => TaskSQL.delete(taskid, resolve, reject));
        await Promise.all([
            del_task(taskid),
            del_task(taskid2),
            del_task(taskid3)
        ]);
    });

    it("Clear users", async () => {
        let del_user = (num) => UserSQL.delete(testUserLogin + num);
        await Promise.all([
            del_user(""),
            del_user("2"),
            del_user("3"),
            del_user("4")
        ]);
    });
});