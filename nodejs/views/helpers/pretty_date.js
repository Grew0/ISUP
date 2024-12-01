const hbs = require('hbs');

let DATEFORMAT, DATEFORMAT_2;

DATEFORMAT = function(date){
    let ans = date.toLocaleString("ru-RU").split(":");
    ans.pop();
    return ans.join(":");
};

DATEFORMAT_2 = function(date){
    let ans = date.toISOString().split(":");
    ans.pop();
    return ans.join(":");
};

hbs.registerHelper("DATEFORMAT", DATEFORMAT);
hbs.registerHelper("DATEFORMAT_2", DATEFORMAT_2);

module.exports = {DATEFORMAT: DATEFORMAT, DATEFORMAT_2: DATEFORMAT_2};