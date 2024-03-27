// const myClass = require("./test2");

// const a = new myClass("sasan");
// console.log(a.name);
var cookieparser = require("cookie-parser");
var express = require("express");
var cors = require("cors");
var jwt = require("jsonwebtoken");
var app = express();
app.use(cors());
app.use(cookieparser());
var user = { nme: "sasan" };
var secret = "xvcfdtruekyfbcdldk";
app.get("/", (req, res) => {
    var accessToken = jwt.sign(user, secret)
    res.cookie("jwtToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
    res.send("ok");
})
app.listen(4500, () => {
    console.log("start server on port 4500");
})