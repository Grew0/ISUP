const express = require('express');
const route = express.Router();

route.use("/", require("./comments/read"));
route.use("/", require("./comments/sub"));
route.use("/", require("./comments/write"));
route.use("/", require("./comments/chekout"));

module.exports = route;
