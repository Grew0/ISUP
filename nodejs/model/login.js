const UserSQL = require("./sql/user");
const SubsSQL = require('./sql/subs');

class Login{
    session
    constructor(req){ this.session = req.session; }
    
    isLoged(){
        return !!(this.session?.login?.user); 
    }

    setLastURL(url){
        this.session.lastURL = url;
    }

    getLastURL(url){
        return this.session?.lastURL;
    }

    setLogged(login, id){
        this.session.login = {user:{
            id: id,
            login: login
        }};
    }

    async enter(login, password){
        let fun = async (resolve, reject)=>{
            UserSQL.enter(login, password).then( (res)=>{
                this.setLogged(res.login, res.id);
                resolve(this.session?.login?.user);
            }, (err) => reject(err) ); 
        };
        return new Promise(fun);
    }

    async register(name, login, password){ 
        return new Promise(async(resolve, reject) => {
            UserSQL.register(login, password, name).then(res=>{
                this.enter(login, password).then((rs)=>{
                    resolve(rs);
                }, err=>reject(err));
            }, err=>{reject(err);}); 
        });
    }

    exit(){
        this.session.login = null;
    }

    getLogin(){
        return Number(this.session?.login?.user?.id);
    }

    async subscribe(task){
        return SubsSQL.subscribe(Number(this.getLogin()), Number(task));
    }

    async unsubscribe(task){
        return SubsSQL.unsubscribe(Number(this.getLogin()), Number(task));
    }

    async isSubscribed(task){
        return SubsSQL.isSubscribed(Number(task), Number(this.getLogin()));
    }    
}

module.exports = function(req){ return new Login(req); }