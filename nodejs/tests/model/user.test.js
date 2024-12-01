const UserSQL = require("../../model/sql/user");

let threrr = (err) => { throw err; };

let login = "I love spiders", name = "Test name user", password = "password", id;

describe("Tests of UserSQL", function () {

    //Create a user
    it("create user", (done) => {
        UserSQL.create(name, login, password, () => {
            UserSQL.read_where({ login: login }, (result) => {
                if (result.length != 1) {
                    throw new Error(" the result is not correct: " + JSON.stringify(result) +
                        `instead of {login:"${login}", name:"${name}" password:/*some hash*/ }`);
                }
                if (result[0].login != login)
                    throw new Error("Login is incorrect: " + result[0].login + " instead of " + login);
                if (result[0].name != name)
                    throw new Error("Name is incorrect: " + result[0].name + " instead of " + name);
                id = result[0].id;
                done();
            }, threrr);
        }, threrr);
    });

    //getById a user
    it("getById user", (done) => {
        UserSQL.getById(id).then((user) => {
            if (id != user.id) throw new Error("Id is incorrect " + user.id + " != " + id);
            if (login != user.login) throw new Error("Login is incorrect " + user.login + " != " + login);
            if (name != user.name) throw new Error("Name is incorrect " + user.name + " != " + name);
            done();
        }).catch(threrr);
    });

    //delete user
    it("delete user", (done) => {
        UserSQL.delete(login).catch(threrr).then(_=>{
            UserSQL.read_where({ login: login }, (result) => {
                if (result.length != 0) throw new Error("User wasn't deleted " + result);
                done();
            }, threrr);
    
        });
    });

    // Registration
    it("register user", async () => {
        return await UserSQL.register(login, password, name);
    });

    // Entering
    it("enter as user", async () => {
        return await UserSQL.enter(login, password);
    });

    it("clearing data", async ()=>{
        return await UserSQL.delete(login);
    });
});
