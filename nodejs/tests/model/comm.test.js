const UserSQL = require("../../model/sql/user");
const CommSQL = require("../../model/sql/comments");
const TaskSQL = require("../../model/sql/task");

let testUserLogin = "testUserLogin";
let userid;
let taskid;
describe("Tests of CommSQL", function () {
    // Write and read
    it("write and read", async () => {
        userid = (await new Promise((res, rej) => UserSQL.create("", testUserLogin, "", res, rej))).insertId;
        taskid = (await TaskSQL.create("", "", new Date(), 1, userid)).insertId;

        await CommSQL.write("Anything is possible", userid, taskid);

        let comments = await CommSQL.get(taskid);
        if (comments.length != 1 || comments[0].writer != userid ||
            comments[0].task != taskid ||
            comments[0].content != "Anything is possible")
            throw new Error("Comments are wrong " + JSON.stringify(comments) + "\n" + JSON.stringify({taskid: taskid, userid: userid}));
    });

    it("clearing info", async () => {
        await new Promise((resolve, reject) => TaskSQL.delete(taskid, resolve, reject));
        await UserSQL.delete(testUserLogin);
    })
});