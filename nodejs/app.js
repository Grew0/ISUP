const express = require('express');
const compileApp = require('./control/compileApp');

let app = express();

(async()=>{
    await compileApp.compile(app);

    app.listen(3000, ()=>{
        console.log("Listening on 3000");
    });
})();

