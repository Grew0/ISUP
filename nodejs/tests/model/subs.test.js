const SubsSQL = require("../../model/sql/subs");
const UserSQL = require("../../model/sql/user");
const TaskSQL = require("../../model/sql/task");

let testUserLogin = "testUserLogin";
let taskid, userid, userid2;

describe("Tests of SubsSQL", function () {

    // Subscribe and isSubscribe
    it("Subscribe", async () => {
        await new Promise((resolve, reject) => UserSQL.create("", testUserLogin, "", resolve, reject));
        await new Promise((resolve, reject) => UserSQL.create("", testUserLogin + "2", "", resolve, reject));

        userid = (await new Promise((resolve, reject) => UserSQL.
            read_where({ login: testUserLogin }, resolve, reject)))[0].id;
        userid2 = (await new Promise((resolve, reject) => UserSQL.
            read_where({ login: testUserLogin + "2" }, resolve, reject)))[0].id;

        await TaskSQL.create("", "", new Date(), 2, userid);
        taskid = (await new Promise((resolve, reject) => TaskSQL.
            read_where({ ownerid: userid }, resolve, reject)))[0].id;

        if (await SubsSQL.isSubscribed(taskid, userid) !== true)
            throw new Error("User must be subscribed on his own task");
        if (await SubsSQL.isSubscribed(taskid, userid2) !== false)
            throw new Error("User2 must not be subscribed yet");
        await SubsSQL.subscribe(userid2, taskid);
        if (await SubsSQL.isSubscribed(taskid, userid) !== true)
            throw new Error("Now user2 must be subscribed");
    });


    // Unsubscribe
    it("unsubscribe", async () => {
        await SubsSQL.unsubscribe(userid, taskid);
        if (await SubsSQL.isSubscribed(taskid, userid) !== false)
            throw new Error("Now user must be unsubscribed");
    });

    
    // Awering and watching
    it("aweare&watch", async () => {
        await SubsSQL.aware(taskid);
        if (await SubsSQL.isawared(taskid, userid2) !== false)
            throw new Error("User2 must not be awared");
        await SubsSQL.watch(taskid, userid2);
        if (await SubsSQL.isawared(taskid, userid2) !== true)
            throw new Error("User2 must be awared: The task is watched");
    });

    it("clearing info", async () => {
        await new Promise((resolve, reject) => TaskSQL.delete(taskid, resolve, reject));

        await Promise.all([
            UserSQL.delete(testUserLogin),
            UserSQL.delete(testUserLogin + "2")
        ]);

    });
});