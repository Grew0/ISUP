const express = require('express');
const route = express.Router();

const read = require("./comments/read")
const sub = require("./comments/sub")
const write = require("./comments/write")
const chekout = require("./comments/chekout")

route.use("/", read);
route.use("/", sub);
route.use("/", write);
route.use("/", chekout);

module.exports = route;
