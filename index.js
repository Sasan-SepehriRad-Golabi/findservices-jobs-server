require("dotenv").config();
var dbapi = require('./Controllers/dbapi');
var helperFuncs = require("./Controllers/helperfunctions");
var User = require("./Models/User");
var Caches = require("./Controllers/Caches");
var cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const sharp = require("sharp");
const { resolve } = require("path");
const { rejects } = require("assert");
const app = express();
const httpserver = http.createServer(app);
app.use(express.static(path.join(__dirname, "client", "dist")));
app.use(express.static(path.join(__dirname, "admin", "dist")));
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
logedInAdminUsers = [];
usersFromAdmin = [];
app.get("/", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (token == null) {
                    res.send(JSON.stringify([{
                        result: "R4" //security problem, do registering again.
                    }]))
                }
                var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                if (foundUser) {
                    proxyOfRecordsets = [{ res: foundUser.isPersonalInfosCompleted ? "update2" : "update1" },
                    [{
                        up: { upn: foundUser.name, upln: foundUser.lastName, upi: foundUser.officialimage },
                        uc: foundUser.isPersonalInfosCompleted,
                        mr: foundUser.readedmessageNumbers,
                        mu: foundUser.unreadedmessageNumbers,
                        unc: foundUser.isUniversityCertificateCompleted,
                        sc: foundUser.isSkillsCompleted,
                        ic: foundUser.jobinterestcomplete,
                        jrc: foundUser.jobresumecomplete,
                        flc: foundUser.isForeignLanguagesCompleted,
                    }]];
                    res.send(proxyOfRecordsets);
                }
                else {
                    proxyOfRecordsets = [{ res: "R5" },
                    [{
                        up: { upn: "", upln: "", upi: "" },
                        uc: false,
                        mr: false,
                        mu: false,
                        unc: false,
                        sc: false,
                        ic: false,
                        flc: false,
                    }]];
                    res.send(proxyOfRecordsets);
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/test", (req, res) => {
    try {
        setTimeout(() => {
            let newpath = path.join(__dirname, "testFiles");
            fs.mkdirSync(newpath, { recursive: true });
            const form = new formidable.IncomingForm({
                uploadDir: newpath,
                multiples: true,
                keepExtensions: true
            });
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    res.send(JSON.stringify([{
                        result: "R5" //problem in parsing the form, do register again.
                    }]))
                }
                else {
                    let imagesrc = [];
                    files.images.forEach((file, index) => {
                        sharp(fs.readFileSync(file.filepath))
                            .resize(300, 300)
                            .toBuffer()
                            .then((data) => {
                                let x = Buffer.from(data);
                                let y = Buffer.from(data);
                                let z = Buffer.from(data, 'base64');
                                let h = x == y;
                                imagesrc.push(data.toString("base64"))
                                fs.writeFileSync(path.join(__dirname, "testFiles", `test-${index}-300.jpg`), data);
                                if (imagesrc.length == files.images.length) {
                                    res.send(JSON.stringify({
                                        src: imagesrc
                                    }))
                                }
                            });
                    });
                }
            })
        }, 5000);
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }

})
app.post("/admin/getjobinterestsFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let foundUser = usersFromAdmin.find(user => user.id == req.body.userId ? req.body.userId : 0);
        if (foundUser) {
            res.send(foundUser.exposeJobInterestInfos());
        }
        else {
            res.send(JSON.stringify([{
                result: "R8" //security problem, do registering again.
            }]));
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getjobinterests", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        res.send(foundUser.exposeJobInterestInfos());
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/updatejobinterestsFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let newpath = path.join(__dirname, "uploadedFiles");
        fs.mkdirSync(newpath, { recursive: true });
        const form = new formidable.IncomingForm({
            uploadDir: newpath,
            multiples: true,
            keepExtensions: true
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                var userUpdateResult = [{ res: "R5" }];
                res.send(JSON.stringify(userUpdateResult));
            }
            else {
                let images = [];
                new Promise((resolve, reject) => {
                    if (images.length > 0) {
                        images.forEach((file, index) => {
                            sharp(fs.readFileSync(file.filepath))
                                .resize(300, 300)
                                .toBuffer()
                                .then((data) => {
                                    let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                                    fs.writeFileSync(path.join(newpath, foundUser.tel ? foundUser.tel : "", "reduced-300" + file.originalFilename.toString()), data);
                                    fs.renameSync(file.filepath, path.join(newpath, foundUser.tel ? foundUser.tel : "", file.originalFilename.toString()));
                                    if ((/jobsabeghebimehfile/gi).test(file.originalFilename)) {
                                        reducedjobsabeghebimehfile = Buffer.from(data);
                                    }
                                    if (index == images.length - 1) {
                                        resolve("ok");
                                    }
                                });
                        })
                    }
                    else {
                        resolve("ok");
                    }

                })
                    .then((val) => {
                        //update userInfo in Database
                        let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                        if (foundUser.id) {
                            dbapi.executesql("updatejobinterests",
                                [{ name: 'interestjob1', type: 'nvarchar(max)', value: fields.interestjob1 && fields.interestjob1[0] ? fields.interestjob1[0] : null },
                                { name: 'interestjob2', type: 'nvarchar(max)', value: fields.interestjob2 && fields.interestjob2[0] ? fields.interestjob2[0] : null },
                                { name: 'interestjob3', type: 'nvarchar(max)', value: fields.interestjob3 && fields.interestjob3[0] ? fields.interestjob3[0] : null },
                                { name: 'jobtype', type: 'nvarchar(max)', value: fields.jobtype && fields.jobtype[0] ? fields.jobtype[0] : null },
                                { name: 'jobtime', type: 'nvarchar(max)', value: fields.jobtime && fields.jobtime[0] ? fields.jobtime[0] : null },
                                { name: 'selfjob', type: 'nvarchar(max)', value: fields.selfjob && fields.selfjob[0] ? fields.selfjob[0] : null },
                                { name: 'drivinglicence', type: 'nvarchar(max)', value: fields.drivinglicence && fields.drivinglicence[0] ? fields.drivinglicence[0] : null },
                                { name: 'extraexplain', type: 'nvarchar(max)', value: fields.extraexplain && fields.extraexplain[0] ? fields.extraexplain[0] : null },
                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                ],
                                [], (err, userUpdateResult) => {
                                    if (err) {
                                        var userUpdateResult = [{ res: "R6" }];
                                        res.send(JSON.stringify(userUpdateResult));
                                    }
                                    else {
                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                        if (userUpdateResult.recordset &&
                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                            res.send(foundUser.exposeJobInterestInfos());

                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R6" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    }
                                })
                        }
                        else {
                            var userUpdateResult = [{ res: "R4" }];
                            res.send(JSON.stringify(userUpdateResult));
                        }
                    })

            }
        });
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/updatejobinterests", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let newpath = path.join(__dirname, "uploadedFiles", foundUser.tel);
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {
                                let images = [];
                                new Promise((resolve, reject) => {
                                    if (images.length > 0) {
                                        images.forEach((file, index) => {
                                            sharp(fs.readFileSync(file.filepath))
                                                .resize(300, 300)
                                                .toBuffer()
                                                .then((data) => {
                                                    fs.writeFileSync(path.join(newpath, "reduced-300" + file.originalFilename.toString()), data);
                                                    fs.renameSync(file.filepath, path.join(newpath, file.originalFilename.toString()));
                                                    if ((/jobsabeghebimehfile/gi).test(file.originalFilename)) {
                                                        reducedjobsabeghebimehfile = Buffer.from(data);
                                                    }
                                                    if (index == images.length - 1) {
                                                        resolve("ok");
                                                    }
                                                });
                                        })
                                    }
                                    else {
                                        resolve("ok");
                                    }

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        if (foundUser.id) {
                                            dbapi.executesql("updatejobinterests",
                                                [{ name: 'interestjob1', type: 'nvarchar(max)', value: fields.interestjob1 && fields.interestjob1[0] ? fields.interestjob1[0] : null },
                                                { name: 'interestjob2', type: 'nvarchar(max)', value: fields.interestjob2 && fields.interestjob2[0] ? fields.interestjob2[0] : null },
                                                { name: 'interestjob3', type: 'nvarchar(max)', value: fields.interestjob3 && fields.interestjob3[0] ? fields.interestjob3[0] : null },
                                                { name: 'jobtype', type: 'nvarchar(max)', value: fields.jobtype && fields.jobtype[0] ? fields.jobtype[0] : null },
                                                { name: 'jobtime', type: 'nvarchar(max)', value: fields.jobtime && fields.jobtime[0] ? fields.jobtime[0] : null },
                                                { name: 'selfjob', type: 'nvarchar(max)', value: fields.selfjob && fields.selfjob[0] ? fields.selfjob[0] : null },
                                                { name: 'drivinglicence', type: 'nvarchar(max)', value: fields.drivinglicence && fields.drivinglicence[0] ? fields.drivinglicence[0] : null },
                                                { name: 'extraexplain', type: 'nvarchar(max)', value: fields.extraexplain && fields.extraexplain[0] ? fields.extraexplain[0] : null },
                                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                                ],
                                                [], (err, userUpdateResult) => {
                                                    if (err) {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                    else {
                                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                        if (userUpdateResult.recordset &&
                                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                            res.send(foundUser.exposeJobInterestInfos());

                                                        }
                                                        else {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                    }
                                                })
                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R4" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    })

                            }
                        });

                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getjobresumeFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let foundUser = usersFromAdmin.find((user) => user.id == req.body.userId ? req.body.userId : 0);
        if (foundUser) {
            res.send(foundUser.exposeJobResumeInfo());
        }
        else {
            res.send(JSON.stringify([{
                result: "R8" //security problem, do registering again.
            }]));
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getjobresume", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        res.send(foundUser.exposeJobResumeInfo());
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/checkadmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        if (req.adminUser) {
            res.send({ result: "R0" })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/adminExit", checkIsAdminMiddleWare, (req, res) => {
    try {
        if (req.adminUser) {
            logedInAdminUsers.splice(logedInAdminUsers.indexOf(req.adminUser), 1);
        }
        res.cookie("token1", "", { httpOnly: true, maxAge: 1000 })
        res.send({ result: "OK" })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/updateJobResumeFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let newpath = path.join(__dirname, "uploadedFiles");
        fs.mkdirSync(newpath, { recursive: true });
        const form = new formidable.IncomingForm({
            uploadDir: newpath,
            multiples: true,
            keepExtensions: true
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                var userUpdateResult = [{ res: "R5" }];
                res.send(JSON.stringify(userUpdateResult));
            }
            else {
                let images = [];
                if (files.jobsabeghebimehfile) {
                    images.push(files.jobsabeghebimehfile[0]);
                }
                let reducedjobsabeghebimehfile = null;
                new Promise((resolve, reject) => {
                    if (images.length > 0) {
                        images.forEach((file, index) => {
                            sharp(fs.readFileSync(file.filepath))
                                .resize(300, 300)
                                .toBuffer()
                                .then((data) => {
                                    let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                                    fs.writeFileSync(path.join(newpath, foundUser.tel ? foundUser.tel : "", "reduced-300" + file.originalFilename.toString()), data);
                                    fs.renameSync(file.filepath, path.join(newpath, foundUser.tel ? foundUser.tel : "", file.originalFilename.toString()));
                                    if ((/jobsabeghebimehfile/gi).test(file.originalFilename)) {
                                        reducedjobsabeghebimehfile = Buffer.from(data);
                                    }
                                    if (index == images.length - 1) {
                                        resolve("ok");
                                    }
                                });
                        })
                    }
                    else {
                        resolve("ok");
                    }

                })
                    .then((val) => {
                        //update userInfo in Database
                        let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                        if (foundUser.id) {
                            dbapi.executesql("updatejobresume",
                                [{ name: 'jobname1', type: 'nvarchar(max)', value: fields.jobname1 && fields.jobname1[0] ? fields.jobname1[0] : null },
                                { name: 'jobname2', type: 'nvarchar(max)', value: fields.jobname2 && fields.jobname2[0] ? fields.jobname2[0] : null },
                                { name: 'jobname3', type: 'nvarchar(max)', value: fields.jobname3 && fields.jobname3[0] ? fields.jobname3[0] : null },
                                { name: 'joboveralllocation1', type: 'nvarchar(max)', value: fields.joboveralllocation1 && fields.joboveralllocation1[0] ? fields.joboveralllocation1[0] : null },
                                { name: 'joboveralllocation2', type: 'nvarchar(max)', value: fields.joboveralllocation2 && fields.joboveralllocation2[0] ? fields.joboveralllocation2[0] : null },
                                { name: 'joboveralllocation3', type: 'nvarchar(max)', value: fields.joboveralllocation3 && fields.joboveralllocation3[0] ? fields.joboveralllocation3[0] : null },
                                { name: 'jobdesc1', type: 'nvarchar(max)', value: fields.jobdesc1 && fields.jobdesc1[0] ? fields.jobdesc1[0] : null },
                                { name: 'jobdesc2', type: 'nvarchar(max)', value: fields.jobdesc2 && fields.jobdesc2[0] ? fields.jobdesc2[0] : null },
                                { name: 'jobdesc3', type: 'nvarchar(max)', value: fields.jobdesc3 && fields.jobdesc3[0] ? fields.jobdesc3[0] : null },
                                { name: 'jobmoddatekar1', type: 'nvarchar(max)', value: fields.jobmoddatekar1 && fields.jobmoddatekar1[0] ? fields.jobmoddatekar1[0] : null },
                                { name: 'jobmoddatekar2', type: 'nvarchar(max)', value: fields.jobmoddatekar2 && fields.jobmoddatekar2[0] ? fields.jobmoddatekar2[0] : null },
                                { name: 'jobmoddatekar3', type: 'nvarchar(max)', value: fields.jobmoddatekar3 && fields.jobmoddatekar3[0] ? fields.jobmoddatekar3[0] : null },
                                { name: 'jobdetaillocation1', type: 'nvarchar(max)', value: fields.jobdetaillocation1 && fields.jobdetaillocation1[0] ? fields.jobdetaillocation1[0] : null },
                                { name: 'jobdetaillocation2', type: 'nvarchar(max)', value: fields.jobdetaillocation2 && fields.jobdetaillocation2[0] ? fields.jobdetaillocation2[0] : null },
                                { name: 'jobdetaillocation3', type: 'nvarchar(max)', value: fields.jobdetaillocation3 && fields.jobdetaillocation3[0] ? fields.jobdetaillocation3[0] : null },
                                { name: 'jobleftreason1', type: 'nvarchar(max)', value: fields.jobleftreason1 && fields.jobleftreason1[0] ? fields.jobleftreason1[0] : null },
                                { name: 'jobleftreason2', type: 'nvarchar(max)', value: fields.jobleftreason2 && fields.jobleftreason2[0] ? fields.jobleftreason2[0] : null },
                                { name: 'jobleftreason3', type: 'nvarchar(max)', value: fields.jobleftreason3 && fields.jobleftreason3[0] ? fields.jobleftreason3[0] : null },
                                { name: 'jobsabeghebimehfile', type: 'varbinary(max)', value: reducedjobsabeghebimehfile ? reducedjobsabeghebimehfile : null },
                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                ],
                                [], (err, userUpdateResult) => {
                                    if (err) {
                                        var userUpdateResult = [{ res: "R6" }];
                                        res.send(JSON.stringify(userUpdateResult));
                                    }
                                    else {
                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                        if (userUpdateResult.recordset &&
                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                            res.send(foundUser.exposeJobResumeInfo());

                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R6" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    }
                                })
                        }
                        else {
                            var userUpdateResult = [{ res: "R4" }];
                            res.send(JSON.stringify(userUpdateResult));
                        }
                    })

            }
        });
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/updatejobresume", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let newpath = path.join(__dirname, "uploadedFiles", foundUser.tel);
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {
                                let images = [];
                                if (files.jobsabeghebimehfile) {
                                    images.push(files.jobsabeghebimehfile[0]);
                                }
                                let reducedjobsabeghebimehfile = null;
                                new Promise((resolve, reject) => {
                                    if (images.length > 0) {
                                        images.forEach((file, index) => {
                                            sharp(fs.readFileSync(file.filepath))
                                                .resize(300, 300)
                                                .toBuffer()
                                                .then((data) => {
                                                    fs.writeFileSync(path.join(newpath, "reduced-300" + file.originalFilename.toString()), data);
                                                    fs.renameSync(file.filepath, path.join(newpath, file.originalFilename.toString()));
                                                    if ((/jobsabeghebimehfile/gi).test(file.originalFilename)) {
                                                        reducedjobsabeghebimehfile = Buffer.from(data);
                                                    }
                                                    if (index == images.length - 1) {
                                                        resolve("ok");
                                                    }
                                                });
                                        })
                                    }
                                    else {
                                        resolve("ok");
                                    }

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        if (foundUser.id) {
                                            dbapi.executesql("updatejobresume",
                                                [{ name: 'jobname1', type: 'nvarchar(max)', value: fields.jobname1 && fields.jobname1[0] ? fields.jobname1[0] : null },
                                                { name: 'jobname2', type: 'nvarchar(max)', value: fields.jobname2 && fields.jobname2[0] ? fields.jobname2[0] : null },
                                                { name: 'jobname3', type: 'nvarchar(max)', value: fields.jobname3 && fields.jobname3[0] ? fields.jobname3[0] : null },
                                                { name: 'joboveralllocation1', type: 'nvarchar(max)', value: fields.joboveralllocation1 && fields.joboveralllocation1[0] ? fields.joboveralllocation1[0] : null },
                                                { name: 'joboveralllocation2', type: 'nvarchar(max)', value: fields.joboveralllocation2 && fields.joboveralllocation2[0] ? fields.joboveralllocation2[0] : null },
                                                { name: 'joboveralllocation3', type: 'nvarchar(max)', value: fields.joboveralllocation3 && fields.joboveralllocation3[0] ? fields.joboveralllocation3[0] : null },
                                                { name: 'jobdesc1', type: 'nvarchar(max)', value: fields.jobdesc1 && fields.jobdesc1[0] ? fields.jobdesc1[0] : null },
                                                { name: 'jobdesc2', type: 'nvarchar(max)', value: fields.jobdesc2 && fields.jobdesc2[0] ? fields.jobdesc2[0] : null },
                                                { name: 'jobdesc3', type: 'nvarchar(max)', value: fields.jobdesc3 && fields.jobdesc3[0] ? fields.jobdesc3[0] : null },
                                                { name: 'jobmoddatekar1', type: 'nvarchar(max)', value: fields.jobmoddatekar1 && fields.jobmoddatekar1[0] ? fields.jobmoddatekar1[0] : null },
                                                { name: 'jobmoddatekar2', type: 'nvarchar(max)', value: fields.jobmoddatekar2 && fields.jobmoddatekar2[0] ? fields.jobmoddatekar2[0] : null },
                                                { name: 'jobmoddatekar3', type: 'nvarchar(max)', value: fields.jobmoddatekar3 && fields.jobmoddatekar3[0] ? fields.jobmoddatekar3[0] : null },
                                                { name: 'jobdetaillocation1', type: 'nvarchar(max)', value: fields.jobdetaillocation1 && fields.jobdetaillocation1[0] ? fields.jobdetaillocation1[0] : null },
                                                { name: 'jobdetaillocation2', type: 'nvarchar(max)', value: fields.jobdetaillocation2 && fields.jobdetaillocation2[0] ? fields.jobdetaillocation2[0] : null },
                                                { name: 'jobdetaillocation3', type: 'nvarchar(max)', value: fields.jobdetaillocation3 && fields.jobdetaillocation3[0] ? fields.jobdetaillocation3[0] : null },
                                                { name: 'jobleftreason1', type: 'nvarchar(max)', value: fields.jobleftreason1 && fields.jobleftreason1[0] ? fields.jobleftreason1[0] : null },
                                                { name: 'jobleftreason2', type: 'nvarchar(max)', value: fields.jobleftreason2 && fields.jobleftreason2[0] ? fields.jobleftreason2[0] : null },
                                                { name: 'jobleftreason3', type: 'nvarchar(max)', value: fields.jobleftreason3 && fields.jobleftreason3[0] ? fields.jobleftreason3[0] : null },
                                                { name: 'jobsabeghebimehfile', type: 'varbinary(max)', value: reducedjobsabeghebimehfile ? reducedjobsabeghebimehfile : null },
                                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                                ],
                                                [], (err, userUpdateResult) => {
                                                    if (err) {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                    else {
                                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                        if (userUpdateResult.recordset &&
                                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                            res.send(foundUser.exposeJobResumeInfo());

                                                        }
                                                        else {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                    }
                                                })
                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R4" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    })

                            }
                        });

                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getskillsFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let foundUser = usersFromAdmin.find((user) => user.id == req.body.userId ? req.body.userId : 0);
        if (foundUser) {
            res.send(foundUser.exposeSkillInfos());
        }
        else {
            res.send(JSON.stringify([{
                result: "R8" //security problem, do registering again.
            }]));
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getskills", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        res.send(foundUser.exposeSkillInfos());
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/updateSkillsFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let newpath = path.join(__dirname, "uploadedFiles");
        fs.mkdirSync(newpath, { recursive: true });
        const form = new formidable.IncomingForm({
            uploadDir: newpath,
            multiples: true,
            keepExtensions: true
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                var userUpdateResult = [{ res: "R5" }];
                res.send(JSON.stringify(userUpdateResult));
            }
            else {

                new Promise((resolve, reject) => {
                    resolve("ok");

                })
                    .then((val) => {
                        //update userInfo in Database
                        let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                        if (foundUser.id) {
                            dbapi.executesql("updateskills",
                                [{ name: 'skillType1', type: 'nvarchar(max)', value: fields.skillType1 && fields.skillType1[0] ? fields.skillType1[0] : null },
                                { name: 'skillType2', type: 'nvarchar(max)', value: fields.skillType2 && fields.skillType2[0] ? fields.skillType2[0] : null },
                                { name: 'skillType3', type: 'nvarchar(max)', value: fields.skillType3 && fields.skillType3[0] ? fields.skillType3[0] : null },
                                { name: 'skillType4', type: 'nvarchar(max)', value: fields.skillType4 && fields.skillType4[0] ? fields.skillType4[0] : null },
                                { name: 'skillLevel1', type: 'nvarchar(max)', value: fields.skillLevel1 && fields.skillLevel1[0] ? fields.skillLevel1[0] : null },
                                { name: 'skillLevel2', type: 'nvarchar(max)', value: fields.skillLevel2 && fields.skillLevel2[0] ? fields.skillLevel2[0] : null },
                                { name: 'skillLevel3', type: 'nvarchar(max)', value: fields.skillLevel3 && fields.skillLevel3[0] ? fields.skillLevel3[0] : null },
                                { name: 'skillLevel4', type: 'nvarchar(max)', value: fields.skillLevel4 && fields.skillLevel4[0] ? fields.skillLevel4[0] : null },
                                { name: 'sabeghehMaharat1', type: 'nvarchar(max)', value: fields.sabeghehMaharat1 && fields.sabeghehMaharat1[0] ? fields.sabeghehMaharat1[0] : null },
                                { name: 'sabeghehMaharat2', type: 'nvarchar(max)', value: fields.sabeghehMaharat2 && fields.sabeghehMaharat2[0] ? fields.sabeghehMaharat2[0] : null },
                                { name: 'sabeghehMaharat3', type: 'nvarchar(max)', value: fields.sabeghehMaharat3 && fields.sabeghehMaharat3[0] ? fields.sabeghehMaharat3[0] : null },
                                { name: 'sabeghehMaharat4', type: 'nvarchar(max)', value: fields.sabeghehMaharat4 && fields.sabeghehMaharat4[0] ? fields.sabeghehMaharat4[0] : null },
                                { name: 'noeFaragirieMaharat1', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat1 && fields.noeFaragirieMaharat1[0] ? fields.noeFaragirieMaharat1[0] : null },
                                { name: 'noeFaragirieMaharat2', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat2 && fields.noeFaragirieMaharat2[0] ? fields.noeFaragirieMaharat2[0] : null },
                                { name: 'noeFaragirieMaharat3', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat3 && fields.noeFaragirieMaharat3[0] ? fields.noeFaragirieMaharat3[0] : null },
                                { name: 'noeFaragirieMaharat4', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat4 && fields.noeFaragirieMaharat4[0] ? fields.noeFaragirieMaharat4[0] : null },
                                { name: 'noeFaragirieMaharatext1', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext1 && fields.noeFaragirieMaharatext1[0] ? fields.noeFaragirieMaharatext1[0] : null },
                                { name: 'noeFaragirieMaharatext2', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext2 && fields.noeFaragirieMaharatext2[0] ? fields.noeFaragirieMaharatext2[0] : null },
                                { name: 'noeFaragirieMaharatext3', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext3 && fields.noeFaragirieMaharatext3[0] ? fields.noeFaragirieMaharatext3[0] : null },
                                { name: 'noeFaragirieMaharatext4', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext4 && fields.noeFaragirieMaharatext4[0] ? fields.noeFaragirieMaharatext4[0] : null },
                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                ],
                                [], (err, userUpdateResult) => {
                                    if (err) {
                                        var userUpdateResult = [{ res: "R6" }];
                                        res.send(JSON.stringify(userUpdateResult));
                                    }
                                    else {
                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                        if (userUpdateResult.recordset &&
                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                            res.send(foundUser.exposeSkillInfos());

                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R6" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    }
                                })
                        }
                        else {
                            var userUpdateResult = [{ res: "R4" }];
                            res.send(JSON.stringify(userUpdateResult));
                        }
                    })

            }
        });
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/updateSkills", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let newpath = path.join(__dirname, "uploadedFiles", foundUser.tel);
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {

                                new Promise((resolve, reject) => {
                                    resolve("ok");

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        if (foundUser.id) {
                                            dbapi.executesql("updateskills",
                                                [{ name: 'skillType1', type: 'nvarchar(max)', value: fields.skillType1 && fields.skillType1[0] ? fields.skillType1[0] : null },
                                                { name: 'skillType2', type: 'nvarchar(max)', value: fields.skillType2 && fields.skillType2[0] ? fields.skillType2[0] : null },
                                                { name: 'skillType3', type: 'nvarchar(max)', value: fields.skillType3 && fields.skillType3[0] ? fields.skillType3[0] : null },
                                                { name: 'skillType4', type: 'nvarchar(max)', value: fields.skillType4 && fields.skillType4[0] ? fields.skillType4[0] : null },
                                                { name: 'skillLevel1', type: 'nvarchar(max)', value: fields.skillLevel1 && fields.skillLevel1[0] ? fields.skillLevel1[0] : null },
                                                { name: 'skillLevel2', type: 'nvarchar(max)', value: fields.skillLevel2 && fields.skillLevel2[0] ? fields.skillLevel2[0] : null },
                                                { name: 'skillLevel3', type: 'nvarchar(max)', value: fields.skillLevel3 && fields.skillLevel3[0] ? fields.skillLevel3[0] : null },
                                                { name: 'skillLevel4', type: 'nvarchar(max)', value: fields.skillLevel4 && fields.skillLevel4[0] ? fields.skillLevel4[0] : null },
                                                { name: 'sabeghehMaharat1', type: 'nvarchar(max)', value: fields.sabeghehMaharat1 && fields.sabeghehMaharat1[0] ? fields.sabeghehMaharat1[0] : null },
                                                { name: 'sabeghehMaharat2', type: 'nvarchar(max)', value: fields.sabeghehMaharat2 && fields.sabeghehMaharat2[0] ? fields.sabeghehMaharat2[0] : null },
                                                { name: 'sabeghehMaharat3', type: 'nvarchar(max)', value: fields.sabeghehMaharat3 && fields.sabeghehMaharat3[0] ? fields.sabeghehMaharat3[0] : null },
                                                { name: 'sabeghehMaharat4', type: 'nvarchar(max)', value: fields.sabeghehMaharat4 && fields.sabeghehMaharat4[0] ? fields.sabeghehMaharat4[0] : null },
                                                { name: 'noeFaragirieMaharat1', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat1 && fields.noeFaragirieMaharat1[0] ? fields.noeFaragirieMaharat1[0] : null },
                                                { name: 'noeFaragirieMaharat2', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat2 && fields.noeFaragirieMaharat2[0] ? fields.noeFaragirieMaharat2[0] : null },
                                                { name: 'noeFaragirieMaharat3', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat3 && fields.noeFaragirieMaharat3[0] ? fields.noeFaragirieMaharat3[0] : null },
                                                { name: 'noeFaragirieMaharat4', type: 'nvarchar(max)', value: fields.noeFaragirieMaharat4 && fields.noeFaragirieMaharat4[0] ? fields.noeFaragirieMaharat4[0] : null },
                                                { name: 'noeFaragirieMaharatext1', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext1 && fields.noeFaragirieMaharatext1[0] ? fields.noeFaragirieMaharatext1[0] : null },
                                                { name: 'noeFaragirieMaharatext2', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext2 && fields.noeFaragirieMaharatext2[0] ? fields.noeFaragirieMaharatext2[0] : null },
                                                { name: 'noeFaragirieMaharatext3', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext3 && fields.noeFaragirieMaharatext3[0] ? fields.noeFaragirieMaharatext3[0] : null },
                                                { name: 'noeFaragirieMaharatext4', type: 'nvarchar(max)', value: fields.noeFaragirieMaharatext4 && fields.noeFaragirieMaharatext4[0] ? fields.noeFaragirieMaharatext4[0] : null },
                                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                                ],
                                                [], (err, userUpdateResult) => {
                                                    if (err) {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                    else {
                                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                        if (userUpdateResult.recordset &&
                                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                            res.send(foundUser.exposeSkillInfos());

                                                        }
                                                        else {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                    }
                                                })
                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R4" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    })

                            }
                        });

                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getzabanFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let foundUser = usersFromAdmin.find((user) => user.id == req.body.userId ? req.body.userId : 0);
        if (foundUser) {
            res.send(foundUser.exposeZabanInfos());
        }
        else {
            res.send(JSON.stringify([{
                result: "R8" //security problem, do registering again.
            }]));
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getzaban", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        res.send(foundUser.exposeZabanInfos());
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/updateZabanFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let newpath = path.join(__dirname, "uploadedFiles");
        fs.mkdirSync(newpath, { recursive: true });
        const form = new formidable.IncomingForm({
            uploadDir: newpath,
            multiples: true,
            keepExtensions: true
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                var userUpdateResult = [{ res: "R5" }];
                res.send(JSON.stringify(userUpdateResult));
            }
            else {
                let images = [];
                if (files.zabanCert1) {
                    images.push(files.zabanCert1[0]);
                }
                if (files.zabanCert2) {
                    images.push(files.zabanCert2[0]);
                }
                let reducedzabanCert1 = null;
                let reducedzabanCert2 = null;
                new Promise((resolve, reject) => {
                    if (images.length > 0) {
                        images.forEach((file, index) => {
                            sharp(fs.readFileSync(file.filepath))
                                .resize(300, 300)
                                .toBuffer()
                                .then((data) => {
                                    let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                                    fs.writeFileSync(path.join(newpath, foundUser.tel ? foundUser.tel : "", "reduced-300" + file.originalFilename.toString()), data);
                                    fs.renameSync(file.filepath, path.join(newpath, foundUser.tel ? foundUser.tel : "", file.originalFilename.toString()));
                                    if ((/zabanCert1/gi).test(file.originalFilename)) {
                                        reducedzabanCert1 = Buffer.from(data);
                                    }
                                    else if ((/zabanCert2/gi).test(file.originalFilename)) {
                                        reducedzabanCert2 = Buffer.from(data);
                                    }
                                    if (index == images.length - 1) {
                                        resolve("ok");
                                    }
                                });
                        })
                    }
                    else {
                        resolve("ok");
                    }

                })
                    .then((val) => {
                        let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                        if (foundUser.id) {
                            dbapi.executesql("updatezabancert",
                                [{ name: 'zabanName1', type: 'nvarchar(max)', value: fields.zabanName1 && fields.zabanName1[0] ? fields.zabanName1[0] : null },
                                { name: 'zabanName2', type: 'nvarchar(max)', value: fields.zabanName2 && fields.zabanName2[0] ? fields.zabanName2[0] : null },
                                { name: 'readingLevel1', type: 'nvarchar(max)', value: fields.readingLevel1 && fields.readingLevel1[0] ? fields.readingLevel1[0] : null },
                                { name: 'readingLevel2', type: 'nvarchar(max)', value: fields.readingLevel2 && fields.readingLevel2[0] ? fields.readingLevel2[0] : null },
                                { name: 'writingLevel1', type: 'nvarchar(max)', value: fields.writingLevel1 && fields.writingLevel1[0] ? fields.writingLevel1[0] : null },
                                { name: 'writingLevel2', type: 'nvarchar(max)', value: fields.writingLevel2 && fields.writingLevel2[0] ? fields.writingLevel2[0] : null },
                                { name: 'dialogLevel1', type: 'nvarchar(max)', value: fields.dialogLevel1 && fields.dialogLevel1[0] ? fields.dialogLevel1[0] : null },
                                { name: 'dialogLevel2', type: 'nvarchar(max)', value: fields.dialogLevel2 && fields.dialogLevel2[0] ? fields.dialogLevel2[0] : null },
                                { name: 'listenLevel1', type: 'nvarchar(max)', value: fields.listenLevel1 && fields.listenLevel1[0] ? fields.listenLevel1[0] : null },
                                { name: 'listenLevel2', type: 'nvarchar(max)', value: fields.listenLevel2 && fields.listenLevel2[0] ? fields.listenLevel2[0] : null },
                                { name: 'zabanCert1', type: 'varbinary(max)', value: reducedzabanCert1 ? reducedzabanCert1 : null },
                                { name: 'zabanCert2', type: 'varbinary(max)', value: reducedzabanCert2 ? reducedzabanCert2 : null },
                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                ],
                                [], (err, userUpdateResult) => {
                                    if (err) {
                                        var userUpdateResult = [{ res: "R6" }];
                                        res.send(JSON.stringify(userUpdateResult));
                                    }
                                    else {
                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                        if (userUpdateResult.recordset &&
                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                            res.send(foundUser.exposeZabanInfos());

                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R6" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    }
                                })
                        }
                        else {
                            var userUpdateResult = [{ res: "R8" }];
                            res.send(JSON.stringify(userUpdateResult));
                        }
                    })

            }
        });
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/updatezaban", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let newpath = path.join(__dirname, "uploadedFiles", foundUser.tel);
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {
                                let images = [];
                                if (files.zabanCert1) {
                                    images.push(files.zabanCert1[0]);
                                }
                                if (files.zabanCert2) {
                                    images.push(files.zabanCert2[0]);
                                }
                                let reducedzabanCert1 = null;
                                let reducedzabanCert2 = null;
                                new Promise((resolve, reject) => {
                                    if (images.length > 0) {
                                        images.forEach((file, index) => {
                                            sharp(fs.readFileSync(file.filepath))
                                                .resize(300, 300)
                                                .toBuffer()
                                                .then((data) => {
                                                    fs.writeFileSync(path.join(newpath, "reduced-300" + file.originalFilename.toString()), data);
                                                    fs.renameSync(file.filepath, path.join(newpath, file.originalFilename.toString()));
                                                    if ((/zabanCert1/gi).test(file.originalFilename)) {
                                                        reducedzabanCert1 = Buffer.from(data);
                                                    }
                                                    else if ((/zabanCert2/gi).test(file.originalFilename)) {
                                                        reducedzabanCert2 = Buffer.from(data);
                                                    }
                                                    if (index == images.length - 1) {
                                                        resolve("ok");
                                                    }
                                                });
                                        })
                                    }
                                    else {
                                        resolve("ok");
                                    }

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        if (foundUser.id) {
                                            dbapi.executesql("updatezabancert",
                                                [{ name: 'zabanName1', type: 'nvarchar(max)', value: fields.zabanName1 && fields.zabanName1[0] ? fields.zabanName1[0] : null },
                                                { name: 'zabanName2', type: 'nvarchar(max)', value: fields.zabanName2 && fields.zabanName2[0] ? fields.zabanName2[0] : null },
                                                { name: 'readingLevel1', type: 'nvarchar(max)', value: fields.readingLevel1 && fields.readingLevel1[0] ? fields.readingLevel1[0] : null },
                                                { name: 'readingLevel2', type: 'nvarchar(max)', value: fields.readingLevel2 && fields.readingLevel2[0] ? fields.readingLevel2[0] : null },
                                                { name: 'writingLevel1', type: 'nvarchar(max)', value: fields.writingLevel1 && fields.writingLevel1[0] ? fields.writingLevel1[0] : null },
                                                { name: 'writingLevel2', type: 'nvarchar(max)', value: fields.writingLevel2 && fields.writingLevel2[0] ? fields.writingLevel2[0] : null },
                                                { name: 'dialogLevel1', type: 'nvarchar(max)', value: fields.dialogLevel1 && fields.dialogLevel1[0] ? fields.dialogLevel1[0] : null },
                                                { name: 'dialogLevel2', type: 'nvarchar(max)', value: fields.dialogLevel2 && fields.dialogLevel2[0] ? fields.dialogLevel2[0] : null },
                                                { name: 'listenLevel1', type: 'nvarchar(max)', value: fields.listenLevel1 && fields.listenLevel1[0] ? fields.listenLevel1[0] : null },
                                                { name: 'listenLevel2', type: 'nvarchar(max)', value: fields.listenLevel2 && fields.listenLevel2[0] ? fields.listenLevel2[0] : null },
                                                { name: 'zabanCert1', type: 'varbinary(max)', value: reducedzabanCert1 ? reducedzabanCert1 : null },
                                                { name: 'zabanCert2', type: 'varbinary(max)', value: reducedzabanCert2 ? reducedzabanCert2 : null },
                                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                                ],
                                                [], (err, userUpdateResult) => {
                                                    if (err) {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                    else {
                                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                        if (userUpdateResult.recordset &&
                                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                            res.send(foundUser.exposeZabanInfos());

                                                        }
                                                        else {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                    }
                                                })
                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R4" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    })

                            }
                        });

                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getUniCertFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let foundUser = usersFromAdmin.find((user) => user.id == req.body.userId && req.body.userId ? req.body.userId : 0);
        if (foundUser) {
            res.send(foundUser.exposeUniInfos());
        }
        else {
            res.send(JSON.stringify([{
                result: "R3" //security problem, do registering again.
            }]));
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }

})
app.post("/getUniCert", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        res.send(foundUser.exposeUniInfos());
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/updateUniCertFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        let newpath = path.join(__dirname, "uploadedFiles");
        fs.mkdirSync(newpath, { recursive: true });
        const form = new formidable.IncomingForm({
            uploadDir: newpath,
            multiples: true,
            keepExtensions: true
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                var userUpdateResult = [{ res: "R5" }];
                res.send(JSON.stringify(userUpdateResult));
            }
            else {
                let images = [];
                if (files.tasviremadraketahsili1) {
                    images.push(files.tasviremadraketahsili1[0]);
                }
                if (files.tasviremadraketahsili2) {
                    images.push(files.tasviremadraketahsili2[0]);
                }
                if (files.tasviremadraketahsili3) {
                    images.push(files.tasviremadraketahsili3[0]);
                }
                let reducedTasvireMadrake1 = null;
                let reducedTasvireMadrake2 = null;
                let reducedTasvireMadrake3 = null;
                new Promise((resolve, reject) => {
                    if (images.length > 0) {
                        images.forEach((file, index) => {
                            sharp(fs.readFileSync(file.filepath))
                                .resize(300, 300)
                                .toBuffer()
                                .then((data) => {
                                    let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : "0");
                                    if (!fs.existsSync(path.join(newpath, foundUser.tel ? foundUser.tel : ""))) {
                                        fs.mkdirSync(path.join(newpath, foundUser.tel ? foundUser.tel : ""));
                                    }
                                    fs.writeFileSync(path.join(newpath, foundUser.tel ? foundUser.tel : "", "reduced-300" + file.originalFilename.toString()), data);
                                    fs.renameSync(file.filepath, path.join(newpath, foundUser.tel ? foundUser.tel : "", file.originalFilename.toString()));
                                    if ((/tasvireMadrak-1/gi).test(file.originalFilename)) {
                                        reducedTasvireMadrake1 = Buffer.from(data);
                                    }
                                    else if ((/tasvireMadrak-2/gi).test(file.originalFilename)) {
                                        reducedTasvireMadrake2 = Buffer.from(data);
                                    }
                                    else if ((/tasvireMadrak-3/gi).test(file.originalFilename)) {
                                        reducedTasvireMadrake3 = Buffer.from(data);
                                    }
                                    if (index == images.length - 1) {
                                        resolve("ok");
                                    }
                                });
                        })
                    }
                    else {
                        resolve("ok");
                    }

                })
                    .then((val) => {
                        //update userInfo in Database
                        let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : "0");
                        if (foundUser.id) {
                            dbapi.executesql("updateunicertFromAdmin",
                                [
                                    { name: 'uniCert', type: 'nvarchar(max)', value: fields.uniCert && fields.uniCert[0] ? fields.uniCert[0] : null },
                                    { name: 'uniCertext', type: 'nvarchar(max)', value: fields.uniCertext && fields.uniCertext[0] ? fields.uniCertext[0] : null },
                                    { name: 'uniName', type: 'nvarchar(max)', value: fields.uniName && fields.uniName[0] ? fields.uniName[0] : null },
                                    { name: 'majorName', type: 'nvarchar(max)', value: fields.majorName && fields.majorName[0] ? fields.majorName[0] : null },
                                    { name: 'tasviremadrak1', type: 'varbinary(max)', value: reducedTasvireMadrake1 ? reducedTasvireMadrake1 : null },
                                    { name: 'tasviremadrak2', type: 'varbinary(max)', value: reducedTasvireMadrake2 ? reducedTasvireMadrake2 : null },
                                    { name: 'tasviremadrak3', type: 'varbinary(max)', value: reducedTasvireMadrake3 ? reducedTasvireMadrake3 : null },
                                    { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                ],
                                [], (err, userUpdateResult) => {
                                    if (err) {
                                        var userUpdateResult = [{ res: "R6" }];
                                        res.send(JSON.stringify(userUpdateResult));
                                    }
                                    else {
                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                        if (userUpdateResult.recordset &&
                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                            res.send(foundUser.exposeUniInfos());

                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R6" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    }
                                })
                        }
                        else {
                            var userUpdateResult = [{ res: "R4" }];
                            res.send(JSON.stringify(userUpdateResult));
                        }
                    })

            }
        });
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/updateUniCert", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let newpath = path.join(__dirname, "uploadedFiles", foundUser.tel);
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {
                                let images = [];
                                if (files.tasviremadraketahsili1) {
                                    images.push(files.tasviremadraketahsili1[0]);
                                }
                                if (files.tasviremadraketahsili2) {
                                    images.push(files.tasviremadraketahsili2[0]);
                                }
                                if (files.tasviremadraketahsili3) {
                                    images.push(files.tasviremadraketahsili3[0]);
                                }
                                let reducedTasvireMadrake1 = null;
                                let reducedTasvireMadrake2 = null;
                                let reducedTasvireMadrake3 = null;
                                new Promise((resolve, reject) => {
                                    if (images.length > 0) {
                                        images.forEach((file, index) => {
                                            sharp(fs.readFileSync(file.filepath))
                                                .resize(300, 300)
                                                .toBuffer()
                                                .then((data) => {
                                                    fs.writeFileSync(path.join(newpath, "reduced-300" + file.originalFilename.toString()), data);
                                                    fs.renameSync(file.filepath, path.join(newpath, file.originalFilename.toString()));
                                                    if ((/tasvireMadrak-1/gi).test(file.originalFilename)) {
                                                        reducedTasvireMadrake1 = Buffer.from(data);
                                                    }
                                                    else if ((/tasvireMadrak-2/gi).test(file.originalFilename)) {
                                                        reducedTasvireMadrake2 = Buffer.from(data);
                                                    }
                                                    else if ((/tasvireMadrak-3/gi).test(file.originalFilename)) {
                                                        reducedTasvireMadrake3 = Buffer.from(data);
                                                    }
                                                    if (index == images.length - 1) {
                                                        resolve("ok");
                                                    }
                                                });
                                        })
                                    }
                                    else {
                                        resolve("ok");
                                    }

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        if (foundUser.id) {
                                            dbapi.executesql("updateunicert",
                                                [{ name: 'uniCert', type: 'nvarchar(max)', value: fields.uniCert && fields.uniCert[0] ? fields.uniCert[0] : null },
                                                { name: 'uniCertext', type: 'nvarchar(max)', value: fields.uniCertext && fields.uniCertext[0] ? fields.uniCertext[0] : null },
                                                { name: 'uniName', type: 'nvarchar(max)', value: fields.uniName && fields.uniName[0] ? fields.uniName[0] : null },
                                                { name: 'majorName', type: 'nvarchar(max)', value: fields.majorName && fields.majorName[0] ? fields.majorName[0] : null },
                                                { name: 'tasviremadrak1', type: 'varbinary(max)', value: reducedTasvireMadrake1 ? reducedTasvireMadrake1 : null },
                                                { name: 'tasviremadrak2', type: 'varbinary(max)', value: reducedTasvireMadrake2 ? reducedTasvireMadrake2 : null },
                                                { name: 'tasviremadrak3', type: 'varbinary(max)', value: reducedTasvireMadrake3 ? reducedTasvireMadrake3 : null },
                                                { name: 'userid', type: 'int', value: foundUser.id ? foundUser.id : 0 },
                                                ],
                                                [], (err, userUpdateResult) => {
                                                    if (err) {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                    else {
                                                        foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                        if (userUpdateResult.recordset &&
                                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                            res.send(foundUser.exposeUniInfos());

                                                        }
                                                        else {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                    }
                                                })
                                        }
                                        else {
                                            var userUpdateResult = [{ res: "R4" }];
                                            res.send(JSON.stringify(userUpdateResult));
                                        }
                                    })

                            }
                        });

                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getSearchedEmployers", (req, res) => {
    try {
        let searchedKeyWords1 = req.body.searchKeyWords;
        if (searchedKeyWords1) {
            dbapi.executesql("getSearchedEmployers",
                [{ name: "searchedKeyWordslevel1", type: "nvarchar(max)", value: searchedKeyWords1.level1 ? searchedKeyWords1.level1 : "" },
                { name: "searchedKeyWordslevel2", type: "nvarchar(max)", value: searchedKeyWords1.level2 ? searchedKeyWords1.level2 : "" },
                { name: "searchedKeyWordslevel3", type: "nvarchar(max)", value: searchedKeyWords1.level3 ? searchedKeyWords1.level3 : "" }],
                [], (err, dbres) => {
                    if (err) {
                        res.send({ result: "R3" })
                    }
                    else {
                        let employers = dbres.recordset;
                        let distinctIds = [];
                        let distinctObjects = [];
                        let distictFeedBaks = [];
                        for (let i = 0; i < employers.length; i++) {
                            if (distinctIds.includes(employers[i].id)) {
                                continue;
                            }
                            else {
                                distinctIds.push(employers[i].id);
                                employers.filter((item) => item.id == employers[i].id).forEach(element => {
                                    if (element.jobFeedbackFromCreator && element.jobFeedbackFromCreator.length && element.jobFeedbackFromCreator.length > 0) {
                                        distictFeedBaks.push({
                                            text: element.jobFeedbackFromCreator,
                                            tarikh: element.jobFeedbackFromCreatorDateInPersian

                                        })
                                    }
                                });
                                distinctObjects.push({
                                    un: employers[i].name,
                                    unc: employers[i].id,
                                    unjn: employers[i].jensiat,
                                    unml: employers[i].melliat,
                                    unts: employers[i].dateOfCreationInPersian,
                                    unsc: employers[i].score,
                                    unmd: employers[i].iProfileCompleted == 1 ? "مدارک کامل و تایید شده" : "نقص مدارک",
                                    unspi: employers[i].specialill,
                                    untakh: employers[i].selectedKeyWords,
                                    unnz: JSON.stringify(distictFeedBaks)
                                })
                                distictFeedBaks = [];
                            }
                        }
                        res.send(distinctObjects)
                    }

                })
        }
        else {
            res.send({ result: "R4" })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/checkIfUserRegistered", (req, res) => {
    try {
        let token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        var userUpdateResult = [{ res: "R0", type: foundUser.usertype }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/registerJobToEmployee", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let employeeCode = req.body.employeeCode ? req.body.employeeCode : 0;
                        if (employeeCode) {
                            //                         jobStatusCode:
                            // 0->wait for verify by admin
                            // 1->verified by admin and waiting for employee to assign
                            // 2->rejected by admin
                            // 3->applied to employees
                            // 4->finished
                            // 5->onstruggle 
                            // 6->strugle resoleved
                            dbapi.executesql("registerJobToEmployee",
                                [
                                    { name: "employeeCode", type: "int", value: req.body.employeeCode ? req.body.employeeCode : "" },
                                    { name: "jobOnvan", type: "nvarchar(max)", value: req.body.jobOnvan ? req.body.jobOnvan : "" },
                                    { name: "jobtype", type: "nvarchar(max)", value: req.body.jobtype ? req.body.jobtype : "" },
                                    { name: "jobDateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                                    { name: "applyDateInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                                    { name: "jobSaateKartype", type: "nvarchar(max)", value: req.body.jobSaateKartype ? req.body.jobSaateKartype : "" },
                                    { name: "jobSaateKarDetail", type: "nvarchar(max)", value: req.body.jobSaateKarDetail ? req.body.jobSaateKarDetail : "" },
                                    { name: "jobRoozhayeKari", type: "nvarchar(max)", value: req.body.jobRoozhayeKari ? req.body.jobRoozhayeKari : "" },
                                    { name: "jobHoghoghePishnehadi", type: "nvarchar(max)", value: req.body.jobHoghoghePishnehadi ? req.body.jobHoghoghePishnehadi : "" },
                                    { name: "jobLocation", type: "nvarchar(max)", value: req.body.jobLocation ? req.body.jobLocation : "" },
                                    { name: "jobTelephoneSabet", type: "nvarchar(max)", value: req.body.jobTelephoneSabet ? req.body.jobTelephoneSabet : "" },
                                    { name: "jobCreatorNameAndLastName", type: "nvarchar(max)", value: req.body.jobCreatorNameAndLastName ? req.body.jobCreatorNameAndLastName : "" },
                                    { name: "jobMazayaAndNokat", type: "nvarchar(max)", value: req.body.jobMazayaAndNokat ? req.body.jobMazayaAndNokat : "" },
                                    { name: "jobImportanceLevel", type: "nvarchar(10)", value: req.body.jobImportanceLevel ? req.body.jobImportanceLevel : "" },
                                    { name: "jobStatusCode", type: "int", value: 0 },
                                    { name: "jobStatusText", type: "nvarchar(max)", value: 'در انتظار تایید' },
                                    { name: "userid", type: "int", value: foundUser.id }

                                ],
                                [
                                    { name: "result", type: "nvarchar(10)" }
                                ], (err, dbres) => {
                                    if (err) {
                                        res.send(JSON.stringify([{
                                            result: "R5" //DB Error.
                                        }]))
                                    }
                                    else {
                                        if (dbres.output && dbres.output.result && dbres.output.result == "ok") {
                                            res.send(JSON.stringify({
                                                result: "R0" //DB Error
                                            }))
                                        }
                                        else {
                                            res.send(JSON.stringify([{
                                                result: "R5" //DB Error
                                            }]))
                                        }
                                    }
                                }
                            )
                        }
                        else {
                            res.send(JSON.stringify([{
                                result: "R5" //DB Error
                            }]))
                        }
                    }
                    else {
                        res.send({
                            res: "R4"
                        })
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.send(JSON.stringify([{
            result: "R5" //DB Error
        }]))
    }
})
function checkIsAdminMiddleWare(req, res, next) {
    try {
        const token = req.cookies && req.cookies.token1;
        if (token == null) {
            res.send({ result: "R4" });
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
                if (err) {
                    res.send({ result: "R4" });
                }
                else {
                    var adminUser = logedInAdminUsers.find((user) => user.user == admin.user && user.pass == admin.pass);
                    if (adminUser) {
                        req.adminUser = adminUser;
                        next();
                    }
                    else {
                        res.send({
                            result: "R4"
                        })
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
}
app.post("/admin/sendMesssageToUser", checkIsAdminMiddleWare, (req, res) => {
    try {
        if (req.body.messageText && req.body.messageText.length > 0) {
            let result = "";
            dbapi.executesql("sendMesssageToUser", [{ name: "userId", type: "int", value: req.body.userId },
            { name: "messageText", type: "nvarchar(max)", value: req.body.messageText },
            {
                name: "messageDatefCreationInPersian", type: "nvarchar(max)",
                value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR")
            }], [], (err, dbres) => {
                if (err) {
                    res.send({
                        result: "R5"
                    })
                }
                else {
                    if (dbres.recordset && dbres.recordset.length > 0 &&
                        dbres.recordset[0].phoneNumber && dbres.recordset[0].phoneNumber.length == 11) {
                        axios({
                            method: 'post',
                            url: 'https://api.sms.ir/v1/send/verify',
                            data: JSON.stringify({
                                "mobile": dbres.recordset[0].phoneNumber,
                                "templateId": 200678,
                                "parameters": [
                                    {
                                        "name": "VERIFYEMPLOYER",
                                        "value": `${req.body.messageText}`
                                    }
                                ]
                            }),
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json",
                                'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
                            },
                        }).then((response) => {
                            if (response.status == 200) {
                                if (response.data && response.data.status) {
                                    if (response.data.status == 1) {
                                        result = "R0";
                                    }
                                    else {
                                        result = response.data.message;
                                    }
                                }
                                else {
                                    result = "R6";
                                }
                            }
                            else {
                                result = "R6";
                            }
                            if (result == "R1") {
                                dbapi.executesql("sendmessagetoemployer", [{ name: "employerId", type: "int", value: req.body.userId ? req.body.userId : 0 },
                                { name: "employerMessageText", type: "nvarchar(max)", value: req.body.messageText ? req.body.messageText : "" },
                                { name: "messageDatefCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err1, dbres1) => {
                                    if (err1) {
                                        res.send({
                                            result: "R15"
                                        })
                                    }
                                    else {
                                        res.send({
                                            result: "R11"
                                        })
                                    }
                                })
                            }
                            else {
                                res.send({
                                    result: result
                                })
                            }
                        })
                            .catch((err) => {
                                fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
                                result = "R7";
                                res.send({
                                    result: result
                                })
                            });
                    }
                    else {
                        res.send({
                            result: "R8"
                        })
                    }
                }
            })
        }
        else {
            res.send({
                result: "R3"
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }

})
app.post("/admin/unBlockPersonalInfo", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("unBlockPersonalInfo", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/blockPersonalInfo", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("blockPersonalInfo", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyUpdateSkills", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyUpdateSkills", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyUpdateZaban", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyUpdateZaban", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyUpdateUniCert", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyUpdateUniCert", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyUpdatejobinterests", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyUpdatejobinterests", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyUpdateJobResume", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyUpdateJobResume", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyPersonalInfo", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyPersonalInfo", [{ name: "userId", type: "int", value: req.body.userId }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/updatePersonalInfoFromAdmin", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token1;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var adminUser = logedInAdminUsers.find((user) => user.user == admin.user && user.pass == admin.pass);
                    if (adminUser) {
                        let newpath = path.join(__dirname, "uploadedFiles");
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {
                                let images = [];
                                if (files.Personeli) {
                                    images.push(files.Personeli[0]);
                                }
                                if (files.Shenasnameh1) {
                                    images.push(files.Shenasnameh1[0]);
                                }
                                if (files.Shenasnameh2) {
                                    images.push(files.Shenasnameh2[0]);
                                }
                                if (files.KarteMelliJolo) {
                                    images.push(files.KarteMelliJolo[0]);
                                }
                                if (files.KarteMelliPosht) {
                                    images.push(files.KarteMelliPosht[0]);
                                }
                                let reducedTasvirePersoneli = null;
                                let reducedTasvireShenasnameh1 = null;
                                let reducedTasvireShenasnameh2 = null;
                                let reducedTasvireKarteMelliJolo = null;
                                let reducedTasvireKarteMelliPosht = null;
                                new Promise((resolve, reject) => {
                                    if (images.length > 0) {
                                        images.forEach((file, index) => {
                                            sharp(fs.readFileSync(file.filepath))
                                                .resize(300, 300)
                                                .toBuffer()
                                                .then((data) => {
                                                    if (fields.userId && fields.userId[0] && fields.userId[0] != -1) {
                                                        let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                                                        if (!fs.existsSync(path.join(newpath, foundUser.tel ? foundUser.tel : ""))) {
                                                            fs.mkdirSync(path.join(newpath, foundUser.tel ? foundUser.tel : ""));
                                                        }
                                                        fs.writeFileSync(path.join(newpath, foundUser.tel ? foundUser.tel : "", "reduced-3000" + file.originalFilename.toString()), data);

                                                        fs.renameSync(file.filepath, path.join(newpath, foundUser.tel ? foundUser.tel : "", file.originalFilename.toString()));
                                                    }
                                                    else {
                                                        let phoneNumber = fields.phoneNumber && fields.phoneNumber[0] && fields.phoneNumber[0] ? fields.phoneNumber[0] : "0";
                                                        if (!fs.existsSync(path.join(newpath, phoneNumber))) {
                                                            fs.mkdirSync(path.join(newpath, phoneNumber));
                                                        }
                                                        fs.writeFileSync(path.join(newpath, phoneNumber, "reduced-3000" + file.originalFilename.toString()), data);

                                                        fs.renameSync(file.filepath, path.join(newpath, phoneNumber, file.originalFilename.toString()));
                                                    }
                                                    if ((/personeli/gi).test(file.originalFilename)) {
                                                        reducedTasvirePersoneli = Buffer.from(data);
                                                    }
                                                    else if ((/shenasnameh-1/gi).test(file.originalFilename)) {
                                                        reducedTasvireShenasnameh1 = Buffer.from(data);
                                                    }
                                                    else if ((/shenasnameh-2/gi).test(file.originalFilename)) {
                                                        reducedTasvireShenasnameh2 = Buffer.from(data);
                                                    }
                                                    else if ((/kartemelli-jolo/gi).test(file.originalFilename)) {
                                                        reducedTasvireKarteMelliJolo = Buffer.from(data);
                                                    }
                                                    else if ((/kartemelli-posht/gi).test(file.originalFilename)) {
                                                        reducedTasvireKarteMelliPosht = Buffer.from(data);
                                                    }
                                                    if (index == images.length - 1) {
                                                        resolve("ok");
                                                    }
                                                });
                                        })
                                    }
                                    else {
                                        resolve("ok");
                                    }

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        if (fields.userId && fields.userId[0] && fields.userId[0] == -1) {
                                            dbapi.executesql("updatePersonalInfoFromAdmin",
                                                [
                                                    { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString() + "--" + new Date(Date.now()).toLocaleTimeString() },
                                                    { name: "userId", type: "int", value: fields.userId && fields.userId[0] ? fields.userId[0] : 0 },
                                                    { name: 'phoneNumber', type: 'nvarchar(100)', value: fields.phoneNumber && fields.phoneNumber[0] ? fields.phoneNumber[0] : "0" },
                                                    { name: 'melliat', type: 'nvarchar(max)', value: fields.melliat && fields.melliat[0] ? fields.melliat[0] : null },
                                                    { name: 'selectedKeyWords', type: 'nvarchar(max)', value: fields.selectedKeyWords && fields.selectedKeyWords[0] ? fields.selectedKeyWords[0] : null },
                                                    { name: 'lastvisitedInPersian', type: 'nvarchar(max)', value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                                                    { name: 'jensiat', type: 'nvarchar(max)', value: fields.jensiat && fields.jensiat[0] ? fields.jensiat[0] : null },
                                                    { name: 'tedadefarzandan', type: 'nvarchar(max)', value: fields.tedadefarzandan && fields.tedadefarzandan[0] ? fields.tedadefarzandan[0] : null },
                                                    { name: 'sarperastekhanevar', type: 'nvarchar(max)', value: fields.sarperastekhanevar && fields.sarperastekhanevar[0] ? fields.sarperastekhanevar[0] : null },
                                                    { name: 'tedadeafradetahtetakaffol', type: 'nvarchar(max)', value: fields.tedadeafradetahtetakaffol && fields.tedadeafradetahtetakaffol[0] ? fields.tedadeafradetahtetakaffol[0] : null },
                                                    { name: 'ghad', type: 'nvarchar(max)', value: fields.ghad && fields.ghad[0] ? fields.ghad[0] : null },
                                                    { name: 'vazn', type: 'nvarchar(max)', value: fields.vazn && fields.vazn[0] ? fields.vazn[0] : null },
                                                    { name: 'specialill', type: 'nvarchar(max)', value: fields.specialill && fields.specialill[0] ? fields.specialill[0] : null },
                                                    { name: 'sarbazi', type: 'nvarchar(max)', value: fields.sarbazi && fields.sarbazi[0] ? fields.sarbazi[0] : null },
                                                    { name: 'sarbaziSayereTozihat', type: 'nvarchar(max)', value: fields.sarbaziSayereTozihat && fields.sarbaziSayereTozihat[0] ? fields.sarbaziSayereTozihat[0] : null },
                                                    { name: 'name', type: 'nvarchar(100)', value: fields.name && fields.name[0] ? fields.name[0] : null },
                                                    { name: 'lastName', type: 'nvarchar(100)', value: fields.lastName && fields.lastName[0] ? fields.lastName[0] : null },
                                                    { name: 'namePedar', type: 'nvarchar(max)', value: fields.namePedar && fields.namePedar[0] ? fields.namePedar[0] : null },
                                                    { name: 'tarikhTavallod', type: 'nvarchar(max)', value: fields.tarikhTavallod && fields.tarikhTavallod[0] ? fields.tarikhTavallod[0] : null },
                                                    { name: 'shomarehShenasnameh', type: 'nvarchar(max)', value: fields.shomarehShenasnameh && fields.shomarehShenasnameh[0] ? fields.shomarehShenasnameh[0] : null },
                                                    { name: 'ostaneTavallod', type: 'nvarchar(max)', value: fields.ostaneTavallod && fields.ostaneTavallod[0] ? fields.ostaneTavallod[0] : null },
                                                    { name: 'shomarehmelli', type: 'nvarchar(max)', value: fields.shomarehMelli && fields.shomarehMelli[0] ? fields.shomarehMelli[0] : null },
                                                    { name: 'address', type: 'nvarchar(max)', value: fields.address && fields.address[0] ? fields.address[0] : null },
                                                    { name: 'email', type: 'nvarchar(max)', value: fields.email && fields.email[0] ? fields.email[0] : null },
                                                    { name: 'moteahel', type: 'nvarchar(max)', value: fields.moteahel && fields.moteahel[0] ? fields.moteahel[0] : null },
                                                    { name: 'shomarehSabet', type: 'nvarchar(max)', value: fields.shomarehSabet && fields.shomarehSabet[0] ? fields.shomarehSabet[0] : null },
                                                    { name: 'noeKareDarkhasti', type: 'nvarchar(max)', value: fields.noeKareDarkhasti && fields.noeKareDarkhasti[0] ? fields.noeKareDarkhasti[0] : null },
                                                    { name: 'haddeaghalHoghogheDarkhasti', type: 'nvarchar(max)', value: fields.haddeaghalHoghogheDarkhasti && fields.haddeaghalHoghogheDarkhasti[0] ? fields.haddeaghalHoghogheDarkhasti[0] : null },
                                                    { name: 'tasvirePersoneli', type: 'varbinary(max)', value: reducedTasvirePersoneli },
                                                    { name: 'tasvireShenasnameh1', type: 'varbinary(max)', value: reducedTasvireShenasnameh1 },
                                                    { name: 'tasvireShenasnameh2', type: 'varbinary(max)', value: reducedTasvireShenasnameh2 },
                                                    { name: 'tasvireKarteMelliJolo', type: 'varbinary(max)', value: reducedTasvireKarteMelliJolo },
                                                    { name: 'tasvireKarteMelliPosht', type: 'varbinary(max)', value: reducedTasvireKarteMelliPosht },
                                                ],
                                                [], (err, userUpdateResult) => {
                                                    if (err) {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                    else {
                                                        let user = new User(userUpdateResult.recordset[0].usertype, userUpdateResult.recordset[0].phoneNumber, userUpdateResult.recordset[0].ipAdddress, 1212, true);
                                                        let userIndex = -1;
                                                        for (let i = 0; i < usersFromAdmin.length; i++) {
                                                            if (usersFromAdmin[i].tel == userUpdateResult.recordset[0].phoneNumber) {
                                                                userIndex = i;
                                                                break;
                                                            }
                                                        }
                                                        if (userIndex != -1) {
                                                            usersFromAdmin.splice(userIndex, 1);
                                                        }
                                                        usersFromAdmin.push(user);
                                                        user.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                        if (userUpdateResult.recordset &&
                                                            userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                            res.send(user.exposeUserInfos());

                                                        }
                                                        else {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                    }
                                                })
                                        }
                                        else {
                                            let foundUser = usersFromAdmin.find((user) => user.id == fields.userId && fields.userId[0] ? fields.userId[0] : 0);
                                            if (foundUser) {
                                                dbapi.executesql("updatePersonalInfoFromAdmin",
                                                    [
                                                        { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString() + "--" + new Date(Date.now()).toLocaleTimeString() },
                                                        { name: "userId", type: "int", value: fields.userId && fields.userId[0] ? fields.userId[0] : 0 },
                                                        { name: 'phoneNumber', type: 'nvarchar(100)', value: foundUser.tel ? foundUser.tel : "" },
                                                        { name: 'melliat', type: 'nvarchar(max)', value: fields.melliat && fields.melliat[0] ? fields.melliat[0] : null },
                                                        { name: 'selectedKeyWords', type: 'nvarchar(max)', value: fields.selectedKeyWords && fields.selectedKeyWords[0] ? fields.selectedKeyWords[0] : null },
                                                        { name: 'lastvisitedInPersian', type: 'nvarchar(max)', value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                                                        { name: 'jensiat', type: 'nvarchar(max)', value: fields.jensiat && fields.jensiat[0] ? fields.jensiat[0] : null },
                                                        { name: 'tedadefarzandan', type: 'nvarchar(max)', value: fields.tedadefarzandan && fields.tedadefarzandan[0] ? fields.tedadefarzandan[0] : null },
                                                        { name: 'sarperastekhanevar', type: 'nvarchar(max)', value: fields.sarperastekhanevar && fields.sarperastekhanevar[0] ? fields.sarperastekhanevar[0] : null },
                                                        { name: 'tedadeafradetahtetakaffol', type: 'nvarchar(max)', value: fields.tedadeafradetahtetakaffol && fields.tedadeafradetahtetakaffol[0] ? fields.tedadeafradetahtetakaffol[0] : null },
                                                        { name: 'ghad', type: 'nvarchar(max)', value: fields.ghad && fields.ghad[0] ? fields.ghad[0] : null },
                                                        { name: 'vazn', type: 'nvarchar(max)', value: fields.vazn && fields.vazn[0] ? fields.vazn[0] : null },
                                                        { name: 'specialill', type: 'nvarchar(max)', value: fields.specialill && fields.specialill[0] ? fields.specialill[0] : null },
                                                        { name: 'sarbazi', type: 'nvarchar(max)', value: fields.sarbazi && fields.sarbazi[0] ? fields.sarbazi[0] : null },
                                                        { name: 'sarbaziSayereTozihat', type: 'nvarchar(max)', value: fields.sarbaziSayereTozihat && fields.sarbaziSayereTozihat[0] ? fields.sarbaziSayereTozihat[0] : null },
                                                        { name: 'name', type: 'nvarchar(100)', value: fields.name && fields.name[0] ? fields.name[0] : null },
                                                        { name: 'lastName', type: 'nvarchar(100)', value: fields.lastName && fields.lastName[0] ? fields.lastName[0] : null },
                                                        { name: 'namePedar', type: 'nvarchar(max)', value: fields.namePedar && fields.namePedar[0] ? fields.namePedar[0] : null },
                                                        { name: 'tarikhTavallod', type: 'nvarchar(max)', value: fields.tarikhTavallod && fields.tarikhTavallod[0] ? fields.tarikhTavallod[0] : null },
                                                        { name: 'shomarehShenasnameh', type: 'nvarchar(max)', value: fields.shomarehShenasnameh && fields.shomarehShenasnameh[0] ? fields.shomarehShenasnameh[0] : null },
                                                        { name: 'ostaneTavallod', type: 'nvarchar(max)', value: fields.ostaneTavallod && fields.ostaneTavallod[0] ? fields.ostaneTavallod[0] : null },
                                                        { name: 'shomarehmelli', type: 'nvarchar(max)', value: fields.shomarehMelli && fields.shomarehMelli[0] ? fields.shomarehMelli[0] : null },
                                                        { name: 'address', type: 'nvarchar(max)', value: fields.address && fields.address[0] ? fields.address[0] : null },
                                                        { name: 'email', type: 'nvarchar(max)', value: fields.email && fields.email[0] ? fields.email[0] : null },
                                                        { name: 'moteahel', type: 'nvarchar(max)', value: fields.moteahel && fields.moteahel[0] ? fields.moteahel[0] : null },
                                                        { name: 'shomarehSabet', type: 'nvarchar(max)', value: fields.shomarehSabet && fields.shomarehSabet[0] ? fields.shomarehSabet[0] : null },
                                                        { name: 'noeKareDarkhasti', type: 'nvarchar(max)', value: fields.noeKareDarkhasti && fields.noeKareDarkhasti[0] ? fields.noeKareDarkhasti[0] : null },
                                                        { name: 'haddeaghalHoghogheDarkhasti', type: 'nvarchar(max)', value: fields.haddeaghalHoghogheDarkhasti && fields.haddeaghalHoghogheDarkhasti[0] ? fields.haddeaghalHoghogheDarkhasti[0] : null },
                                                        { name: 'tasvirePersoneli', type: 'varbinary(max)', value: reducedTasvirePersoneli },
                                                        { name: 'tasvireShenasnameh1', type: 'varbinary(max)', value: reducedTasvireShenasnameh1 },
                                                        { name: 'tasvireShenasnameh2', type: 'varbinary(max)', value: reducedTasvireShenasnameh2 },
                                                        { name: 'tasvireKarteMelliJolo', type: 'varbinary(max)', value: reducedTasvireKarteMelliJolo },
                                                        { name: 'tasvireKarteMelliPosht', type: 'varbinary(max)', value: reducedTasvireKarteMelliPosht },
                                                    ],
                                                    [], (err, userUpdateResult) => {
                                                        if (err) {
                                                            var userUpdateResult = [{ res: "R6" }];
                                                            res.send(JSON.stringify(userUpdateResult));
                                                        }
                                                        else {
                                                            foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                            if (userUpdateResult.recordset &&
                                                                userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                                res.send(foundUser.exposeUserInfos());

                                                            }
                                                            else {
                                                                var userUpdateResult = [{ res: "R6" }];
                                                                res.send(JSON.stringify(userUpdateResult));
                                                            }
                                                        }
                                                    })
                                            }
                                            else {
                                                var userUpdateResult = [{ res: "R6" }];
                                                res.send(JSON.stringify(userUpdateResult));
                                            }
                                        }

                                    })
                            }
                        });
                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/updatePersonalInfo", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            var userUpdateResult = [{ res: "R4" }];
            res.send(JSON.stringify(userUpdateResult));
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        let newpath = path.join(__dirname, "uploadedFiles", foundUser.tel);
                        fs.mkdirSync(newpath, { recursive: true });
                        const form = new formidable.IncomingForm({
                            uploadDir: newpath,
                            multiples: true,
                            keepExtensions: true
                        });
                        form.parse(req, async (err, fields, files) => {
                            if (err) {
                                var userUpdateResult = [{ res: "R5" }];
                                res.send(JSON.stringify(userUpdateResult));
                            }
                            else {
                                let images = [];
                                if (files.Personeli) {
                                    images.push(files.Personeli[0]);
                                }
                                if (files.Shenasnameh1) {
                                    images.push(files.Shenasnameh1[0]);
                                }
                                if (files.Shenasnameh2) {
                                    images.push(files.Shenasnameh2[0]);
                                }
                                if (files.KarteMelliJolo) {
                                    images.push(files.KarteMelliJolo[0]);
                                }
                                if (files.KarteMelliPosht) {
                                    images.push(files.KarteMelliPosht[0]);
                                }
                                let reducedTasvirePersoneli = null;
                                let reducedTasvireShenasnameh1 = null;
                                let reducedTasvireShenasnameh2 = null;
                                let reducedTasvireKarteMelliJolo = null;
                                let reducedTasvireKarteMelliPosht = null;
                                new Promise((resolve, reject) => {
                                    if (images.length > 0) {
                                        images.forEach((file, index) => {
                                            sharp(fs.readFileSync(file.filepath))
                                                .resize(300, 300)
                                                .toBuffer()
                                                .then((data) => {
                                                    fs.writeFileSync(path.join(newpath, "reduced-300" + file.originalFilename.toString()), data);
                                                    fs.renameSync(file.filepath, path.join(newpath, file.originalFilename.toString()));
                                                    if ((/personeli/gi).test(file.originalFilename)) {
                                                        reducedTasvirePersoneli = Buffer.from(data);
                                                    }
                                                    else if ((/shenasnameh-1/gi).test(file.originalFilename)) {
                                                        reducedTasvireShenasnameh1 = Buffer.from(data);
                                                    }
                                                    else if ((/shenasnameh-2/gi).test(file.originalFilename)) {
                                                        reducedTasvireShenasnameh2 = Buffer.from(data);
                                                    }
                                                    else if ((/kartemelli-jolo/gi).test(file.originalFilename)) {
                                                        reducedTasvireKarteMelliJolo = Buffer.from(data);
                                                    }
                                                    else if ((/kartemelli-posht/gi).test(file.originalFilename)) {
                                                        reducedTasvireKarteMelliPosht = Buffer.from(data);
                                                    }
                                                    if (index == images.length - 1) {
                                                        resolve("ok");
                                                    }
                                                });
                                        })
                                    }
                                    else {
                                        resolve("ok");
                                    }

                                })
                                    .then((val) => {
                                        //update userInfo in Database
                                        dbapi.executesql("updatePersonalInfo",
                                            [{ name: 'phoneNumber', type: 'nvarchar(100)', value: foundUser.tel ? foundUser.tel : "" },
                                            { name: 'melliat', type: 'nvarchar(max)', value: fields.melliat && fields.melliat[0] ? fields.melliat[0] : null },
                                            { name: 'selectedKeyWords', type: 'nvarchar(max)', value: fields.selectedKeyWords && fields.selectedKeyWords[0] ? fields.selectedKeyWords[0] : null },
                                            { name: 'lastvisitedInPersian', type: 'nvarchar(max)', value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                                            { name: 'jensiat', type: 'nvarchar(max)', value: fields.jensiat && fields.jensiat[0] ? fields.jensiat[0] : null },
                                            { name: 'tedadefarzandan', type: 'nvarchar(max)', value: fields.tedadefarzandan && fields.tedadefarzandan[0] ? fields.tedadefarzandan[0] : null },
                                            { name: 'sarperastekhanevar', type: 'nvarchar(max)', value: fields.sarperastekhanevar && fields.sarperastekhanevar[0] ? fields.sarperastekhanevar[0] : null },
                                            { name: 'tedadeafradetahtetakaffol', type: 'nvarchar(max)', value: fields.tedadeafradetahtetakaffol && fields.tedadeafradetahtetakaffol[0] ? fields.tedadeafradetahtetakaffol[0] : null },
                                            { name: 'ghad', type: 'nvarchar(max)', value: fields.ghad && fields.ghad[0] ? fields.ghad[0] : null },
                                            { name: 'vazn', type: 'nvarchar(max)', value: fields.vazn && fields.vazn[0] ? fields.vazn[0] : null },
                                            { name: 'specialill', type: 'nvarchar(max)', value: fields.specialill && fields.specialill[0] ? fields.specialill[0] : null },
                                            { name: 'sarbazi', type: 'nvarchar(max)', value: fields.sarbazi && fields.sarbazi[0] ? fields.sarbazi[0] : null },
                                            { name: 'sarbaziSayereTozihat', type: 'nvarchar(max)', value: fields.sarbaziSayereTozihat && fields.sarbaziSayereTozihat[0] ? fields.sarbaziSayereTozihat[0] : null },
                                            { name: 'name', type: 'nvarchar(100)', value: fields.name && fields.name[0] ? fields.name[0] : null },
                                            { name: 'lastName', type: 'nvarchar(100)', value: fields.lastName && fields.lastName[0] ? fields.lastName[0] : null },
                                            { name: 'namePedar', type: 'nvarchar(max)', value: fields.namePedar && fields.namePedar[0] ? fields.namePedar[0] : null },
                                            { name: 'tarikhTavallod', type: 'nvarchar(max)', value: fields.tarikhTavallod && fields.tarikhTavallod[0] ? fields.tarikhTavallod[0] : null },
                                            { name: 'shomarehShenasnameh', type: 'nvarchar(max)', value: fields.shomarehShenasnameh && fields.shomarehShenasnameh[0] ? fields.shomarehShenasnameh[0] : null },
                                            { name: 'ostaneTavallod', type: 'nvarchar(max)', value: fields.ostaneTavallod && fields.ostaneTavallod[0] ? fields.ostaneTavallod[0] : null },
                                            { name: 'shomarehmelli', type: 'nvarchar(max)', value: fields.shomarehMelli && fields.shomarehMelli[0] ? fields.shomarehMelli[0] : null },
                                            { name: 'address', type: 'nvarchar(max)', value: fields.address && fields.address[0] ? fields.address[0] : null },
                                            { name: 'email', type: 'nvarchar(max)', value: fields.email && fields.email[0] ? fields.email[0] : null },
                                            { name: 'moteahel', type: 'nvarchar(max)', value: fields.moteahel && fields.moteahel[0] ? fields.moteahel[0] : null },
                                            { name: 'shomarehSabet', type: 'nvarchar(max)', value: fields.shomarehSabet && fields.shomarehSabet[0] ? fields.shomarehSabet[0] : null },
                                            { name: 'noeKareDarkhasti', type: 'nvarchar(max)', value: fields.noeKareDarkhasti && fields.noeKareDarkhasti[0] ? fields.noeKareDarkhasti[0] : null },
                                            { name: 'haddeaghalHoghogheDarkhasti', type: 'nvarchar(max)', value: fields.haddeaghalHoghogheDarkhasti && fields.haddeaghalHoghogheDarkhasti[0] ? fields.haddeaghalHoghogheDarkhasti[0] : null },
                                            { name: 'tasvirePersoneli', type: 'varbinary(max)', value: reducedTasvirePersoneli },
                                            { name: 'tasvireShenasnameh1', type: 'varbinary(max)', value: reducedTasvireShenasnameh1 },
                                            { name: 'tasvireShenasnameh2', type: 'varbinary(max)', value: reducedTasvireShenasnameh2 },
                                            { name: 'tasvireKarteMelliJolo', type: 'varbinary(max)', value: reducedTasvireKarteMelliJolo },
                                            { name: 'tasvireKarteMelliPosht', type: 'varbinary(max)', value: reducedTasvireKarteMelliPosht },
                                            ],
                                            [], (err, userUpdateResult) => {
                                                if (err) {
                                                    var userUpdateResult = [{ res: "R6" }];
                                                    res.send(JSON.stringify(userUpdateResult));
                                                }
                                                else {
                                                    foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                                    if (userUpdateResult.recordset &&
                                                        userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                                        res.send(foundUser.exposeUserInfos());

                                                    }
                                                    else {
                                                        var userUpdateResult = [{ res: "R6" }];
                                                        res.send(JSON.stringify(userUpdateResult));
                                                    }
                                                }
                                            })
                                    })

                            }
                        });
                    }
                    else {
                        var userUpdateResult = [{ res: "R4" }];
                        res.send(JSON.stringify(userUpdateResult));
                    }
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getPersonalInfo", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        res.send(foundUser.exposeUserInfos());
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }

})
app.post("/exit", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (token == null) {
                    res.send(JSON.stringify([{
                        result: "R4" //security problem, do registering again.
                    }]))
                }
                var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                if (foundUser) {
                    Caches.usersArray.forEach((user, index) => {
                        if (user.tel == Proxyphone.userPhone) {
                            Caches.usersArray.splice(index, 1);
                        }
                    })
                    proxyOfRecordsets = [{ res: "exit" },
                    [{
                        up: { upn: "", upln: "", upi: "" },
                        uc: false,
                        mr: false,
                        mu: false,
                        unc: false,
                        sc: false,
                        ic: false,
                        flc: false,
                    }]];
                    res.cookie("token", "", { httpOnly: true, maxAge: 1000 })
                    res.send(proxyOfRecordsets);
                }
                else {
                    proxyOfRecordsets = [{ res: "R5" },
                    [{
                        up: { upn: "", upln: "", upi: "" },
                        uc: false,
                        mr: false,
                        mu: false,
                        unc: false,
                        sc: false,
                        ic: false,
                        flc: false,
                    }]];
                    res.send(proxyOfRecordsets);
                }
            });
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/applyEnvFile", (req, res) => {
    try {
        var bb = require("dotenv").config()
        Object.keys(process.env).forEach((key) => {
            if (bb.parsed[key]) {
                process.env[key] = bb.parsed[key];
            }
        })
        res.send(process.env.test);
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
function checkIfExistAsUser(phone) {
    try {
        return new Promise((resolve, reject) => {
            dbapi.executesql("checkifexistasuser", [
                { name: 'phone', type: 'nvarchar(max)', value: phone ? phone : null },
            ], [{ name: 'result', type: 'int' }], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result.output)
                }
            });
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
}
function checkIfExistAsEmployer(phone) {
    try {
        return new Promise((resolve, reject) => {
            dbapi.executesql("checkifexistasemployer", [
                { name: 'phone', type: 'nvarchar(max)', value: phone ? phone : null },
            ], [{ name: 'result', type: 'int' }], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result.output)
                }
            });
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
}
app.post("/employergetcode", (req, res) => {
    try {
        let phone = req.body.employerphone;
        if (phone) {
            let result = -1;
            axios({
                method: 'post',
                url: 'https://api.sms.ir/v1/send/verify',
                data: JSON.stringify({
                    "mobile": req.body.phone,
                    "templateId": 559989,
                    "parameters": [
                        {
                            "name": "VERIFYCODE",
                            "value": `${phone}`
                        }
                    ]
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
                },
            })
                .then((value) => {

                })
            checkIfExistAsUser(phone)
                .then((phone) => {
                    checkIfExistAsEmployer(phone)
                        .then((val) => {

                        })
                })
        }
        else {
            res.send(JSON.stringify({ res: 'err' }))
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/checkIfRegister", (req, res) => {
    // try {
    const token = req.cookies && req.cookies.token;
    if (token == null) {
        var userUpdateResult = { res: "R4" };
        res.send(JSON.stringify(userUpdateResult));
    }
    else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
            if (err) {
                var userUpdateResult = { res: "R4" };
                res.send(JSON.stringify(userUpdateResult));
            }
            else {
                var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                if (foundUser) {
                    let usertype = foundUser.usertype;
                    if (usertype == "0" || usertype == "1" || usertype == "2") {
                        if (usertype == "0") {
                            res.send(JSON.stringify({ res: "R0" }));
                        }
                        else if (usertype == "1") {
                            res.send(JSON.stringify({ res: "R1" }));
                        }
                        else if (usertype == "2") {
                            res.send(JSON.stringify({ res: "R2" }));
                        }
                        else {
                            res.send(JSON.stringify({ res: "R4" }));
                        }


                    }
                    else {
                        res.send(JSON.stringify({ res: "R4" }));
                    }
                }
                else {
                    var userUpdateResult = [{ res: "R4" }];
                    res.send(JSON.stringify(userUpdateResult));
                }
            }
        })
    }
    // }
    // catch (err) {
    //     fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
    //     res.end();
    // }
})
app.post("/closeAndMarkItAsRead", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    res.send(JSON.stringify({
                        result: "R4" //security problem, do registering again.
                    }))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        dbapi.executesql("closeAndMarkItAsRead", [{ name: "userid", type: "int", value: foundUser.id }, { name: "messageId", type: "int", value: req.body.messageId ? req.body.messageId : 0 }], [], (err, dbres) => {
                            if (err) {
                                res.send(JSON.stringify({
                                    result: "R5" //security problem, do registering again.
                                }))
                            }
                            let result = dbres.recordset;
                            res.send(JSON.stringify({ result: "R0", records: result }));
                        })
                    }
                    else {
                        res.send(JSON.stringify({
                            result: "R4" //security problem, do registering again.
                        }))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getuserMessages", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    res.send(JSON.stringify({
                        result: "R4" //security problem, do registering again.
                    }))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        dbapi.executesql("getuserMessages", [{ name: "userid", type: "int", value: foundUser.id }], [], (err, dbres) => {
                            let result = dbres.recordset;
                            res.send(JSON.stringify({ result: "R0", records: result }));
                        })
                    }
                    else {
                        res.send(JSON.stringify({
                            result: "R4" //security problem, do registering again.
                        }))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getuserJobs", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    res.send(JSON.stringify({
                        result: "R4" //security problem, do registering again.
                    }))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        dbapi.executesql("getUserJobs", [{ name: "userid", type: "int", value: foundUser.id }], [], (err, dbres) => {
                            let result = dbres.recordset;
                            res.send(JSON.stringify({ result: "R0", records: result }));
                        })
                    }
                    else {
                        res.send(JSON.stringify({
                            result: "R4" //security problem, do registering again.
                        }))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getuserRequestsById", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("getuserRequestsById", [{ name: "requestId", type: "int", value: req.body.requestId ? req.body.requestId : 0 }], [], (err, dbres) => {
            let result = dbres.recordset;
            res.send({ result: "R0", records: result });
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getuserRequests", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    res.send(JSON.stringify({
                        result: "R4" //security problem, do registering again.
                    }))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        dbapi.executesql("getUserRequests", [{ name: "userid", type: "int", value: foundUser.id }], [], (err, dbres) => {
                            let result = dbres.recordset;
                            res.send(JSON.stringify({ result: "R0", records: result }));
                        })
                    }
                    else {
                        res.send(JSON.stringify({
                            result: "R4" //security problem, do registering again.
                        }))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/applyUserForJob", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify({
                result: "R4" //security problem, do registering again.
            }))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    res.send(JSON.stringify({
                        result: "R4" //security problem, do registering again.
                    }))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        if (req.body.ji) {
                            dbapi.executesql("applyUserForJob", [{ name: "employeeId", type: "int", value: foundUser.id },
                            { name: "jobId", type: "int", value: req.body.ji },
                            { name: "applyDateInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString("fa-IR") }
                            ], [{ name: "result", type: "nvarchar(10)" }], (err, dbres) => {
                                if (err) {
                                    res.send(JSON.stringify({ result: "R5" }));
                                }
                                else {
                                    if (dbres.output && dbres.output.result && dbres.output.result == "ok") {
                                        res.send(JSON.stringify({ result: "R0" }));
                                    }
                                    else if (dbres.output && dbres.output.result && dbres.output.result == "per") {
                                        res.send(JSON.stringify({ result: "R1" }));
                                    }
                                    else {
                                        res.send(JSON.stringify({ result: "R2" }));
                                    }
                                }
                            })
                        }
                        else {
                            res.send(JSON.stringify({ result: "R3" }));
                        }
                    }
                    else {
                        res.send(JSON.stringify({
                            result: "R4" //security problem, do registering again.
                        }))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/getRecentJobs", (req, res) => {
    try {
        dbapi.executesql("getRecentJobs", [], [], (err, dbres) => {
            if (err) {
                res.send(JSON.stringify({
                    result: "R5" //security problem, do registering again.
                }))
            }
            else {
                let jobs = dbres.recordset.map((job) => {
                    return {
                        jon: job.jobOnvan,
                        jt: job.jobtype,
                        jsat: job.jobSaateKartype,
                        jsad: job.jobSaateKarDetail,
                        jrook: job.jobRoozhayeKari,
                        jhgp: job.jobHoghoghePishnehadi,
                        jl: job.jobLocation,
                        jman: job.jobMazayaAndNokat,
                        jdinp: job.jobDateOfCreationInPersian,
                        jst: job.jobStatusText,
                        ji: job.id
                    }
                })
                res.send(JSON.stringify({
                    result: "R0", records: jobs //security problem, do registering again.
                }))
            }

        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getrequests", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("getrequests", [], [], (err, dbres) => {
            if (err) {
                res.send({ result: "R5" })
            }
            else {
                res.send(dbres.recordset)
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/findRequestByEmployer", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("findRequestByEmployer", [{ name: "employerId", type: "int", value: req.body.employerId ? req.body.employerId : -1 }, { name: "employerName", type: "nvarchar(max)", value: req.body.employerName ? req.body.employerName : 'n' }], [], (err, dbres) => {
            if (err) {
                res.send({ result: "R5" })
            }
            else {
                res.send(dbres.recordset)
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/findRequestByEmployee", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("findRequestByEmployee", [{ name: "employeeId", type: "int", value: req.body.employeeId ? req.body.employeeId : -1 }, { name: "employeeName", type: "nvarchar(max)", value: req.body.employeeName ? req.body.employeeName : 'n' }], [], (err, dbres) => {
            if (err) {
                res.send({ result: "R5" })
            }
            else {
                res.send(dbres.recordset)
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/findRequestByJob", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("findRequestByJob", [{ name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : -1 }, { name: "jobOnvan", type: "nvarchar(max)", value: req.body.jobOnvan ? req.body.jobOnvan : 'n' }], [], (err, dbres) => {
            if (err) {
                res.send({ result: "R5" })
            }
            else {
                res.send(dbres.recordset)
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/rejectrequeststep1", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("rejectrequeststep1",
            [{ name: "requestId", type: "int", value: req.body.requestId ? req.body.requestId : 0 }],
            [{ name: "result", type: "nvarchar(10)" }], (err, dbres) => {
                if (err) {
                    res.send({ result: "R5" })
                }
                else {
                    res.send(dbres.output)
                }
            })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/rejectrequeststep2", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("rejectrequest", [{ name: "requestId", type: "int", value: req.body.requestId ? req.body.requestId : 0 },
        { name: "requestDateOfVerifyOrrejectInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send({
                    result: "R0"
                })
            }

        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/registerOpinion", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, proxyPhone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        result: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    let foundUser = Caches.usersArray.find(user => user.tel == proxyPhone.userPhone);
                    if (foundUser) {
                        dbapi.executesql("registerOpinion", [{ name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : -1 },
                        { name: "opinion", type: "nvarchar(max)", value: req.body.opinion ? req.body.opinion : "" },
                        { name: "jobFeedbackFromCreatorDateInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err, dbres) => {
                            if (err) {
                                res.send(JSON.stringify([{
                                    result: "R5" //security problem, do registering again.
                                }]));
                            }
                            else {
                                res.send(JSON.stringify([{
                                    result: "R0" //security problem, do registering again.
                                }]));
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify([{
                            result: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/finishJob", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("finishJob", [{ name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : -1 },
        { name: "jobDateOfFinishInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err, dbres) => {
            if (err) {
                res.send({ result: "R5" })
            }
            else {
                res.send({ result: "R0" })
            }

        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyrequest", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyrequest", [{ name: "requestId", type: "int", value: req.body.requestId ? req.body.requestId : 0 },
        { name: "requestDateOfVerifyOrrejectInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [{ name: "result", type: "nvarchar(10)" }], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send(dbres.output)
            }

        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/sendMessageToEmployer", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("getEmployerPhone", [{ name: "userId", type: "int", value: req.body.employerId ? req.body.employerId : 0 }], [], (err, dbres) => {
            if (err) {
                res.send({ result: "R5" })
            }
            else {
                let phoneNumber = dbres.recordset && dbres.recordset[0] && dbres.recordset[0].phoneNumber ? dbres.recordset[0].phoneNumber : 0;
                let result = "";
                axios({
                    method: 'post',
                    url: 'https://api.sms.ir/v1/send/verify',
                    data: JSON.stringify({
                        "mobile": phoneNumber,
                        "templateId": 200678,
                        "parameters": [
                            {
                                "name": "VERIFYEMPLOYER",
                                "value": `${req.body.employerMessageText}`
                            }
                        ]
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
                    },
                }).then((response) => {
                    if (response.status == 200) {
                        if (response.data && response.data.status) {
                            switch (response.data.status) {
                                case 1:
                                    result = "R1";
                                    break;
                                default:
                                    result = "R6";
                                    break;
                            }

                        }
                        else {
                            result = "R6";
                        }
                    }
                    else {
                        result = "R6";
                    }
                    if (result == "R1") {
                        dbapi.executesql("sendmessagetoemployer", [{ name: "employerId", type: "int", value: req.body.employerId ? req.body.employerId : 0 },
                        { name: "employerMessageText", type: "nvarchar(max)", value: req.body.employerMessageText ? req.body.employerMessageText : "" },
                        { name: "messageDatefCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err1, dbres1) => {
                            if (err1) {
                                res.send({
                                    result: "R15"
                                })
                            }
                            else {
                                res.send({
                                    result: "R11"
                                })
                            }
                        })
                    }
                    else {
                        res.send({
                            result: "R6"
                        })
                    }
                })
                    .catch((err) => {
                        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
                        result = "R7";
                        res.send({
                            result: result
                        })
                    });
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }

})
app.post("/admin/sendMessageToUser", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("getEmployeePhone",
            [{ name: "userId", type: "int", value: req.body.userId ? req.body.userId : 0 }], [], (err, dbres) => {
                if (err) {
                    res.send({ result: "R5" })
                }
                else {
                    let phoneNumber = dbres.recordset && dbres.recordset[0] && dbres.recordset[0].phoneNumber ? dbres.recordset[0].phoneNumber : 0;
                    let result = "";
                    axios({
                        method: 'post',
                        url: 'https://api.sms.ir/v1/send/verify',
                        data: JSON.stringify({
                            "mobile": phoneNumber,
                            "templateId": 200678,
                            "parameters": [
                                {
                                    "name": "VERIFYEMPLOYER",
                                    "value": `${req.body.userMessageText}`
                                }
                            ]
                        }),
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
                        },
                    }).then((response) => {
                        if (response.status == 200) {
                            if (response.data && response.data.status) {
                                switch (response.data.status) {
                                    case 1:
                                        result = "R1";
                                        break;
                                    default:
                                        result = "R6";
                                        break;
                                }
                            }
                            else {
                                result = "R6";
                            }
                        }
                        else {
                            result = "R6";
                        }
                        if (result == "R1") {
                            dbapi.executesql("sendmessagetoUser", [
                                { name: "employeeId", type: "int", value: req.body.userId ? req.body.user : 0 },
                                { name: "messageId", type: "int", value: req.body.messageId ? req.body.messageId : 0 },
                                { name: "employeeMessageText", type: "nvarchar(max)", value: req.body.userMessageText ? req.body.userMessageText : "" },
                                { name: "messageDatefCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err1, dbres1) => {
                                    if (err1) {
                                        res.send({
                                            result: "R15"
                                        })
                                    }
                                    else {
                                        res.send({
                                            result: "R11"
                                        })
                                    }
                                })
                        }
                        else {
                            res.send({
                                result: "R6"
                            })
                        }
                    })
                        .catch((err) => {
                            fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
                            result = "R7";
                            res.send({
                                result: result
                            })
                        });
                }
            })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/sendMessageToEmployee", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("getEmployeePhone",
            [{ name: "userId", type: "int", value: req.body.employeeId ? req.body.employeeId : 0 }], [], (err, dbres) => {
                if (err) {
                    res.send({ result: "R5" })
                }
                else {
                    let phoneNumber = dbres.recordset && dbres.recordset[0] && dbres.recordset[0].phoneNumber ? dbres.recordset[0].phoneNumber : 0;
                    let result = "";
                    axios({
                        method: 'post',
                        url: 'https://api.sms.ir/v1/send/verify',
                        data: JSON.stringify({
                            "mobile": phoneNumber,
                            "templateId": 200678,
                            "parameters": [
                                {
                                    "name": "VERIFYEMPLOYER",
                                    "value": `${req.body.employeeMessageText}`
                                }
                            ]
                        }),
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
                        },
                    }).then((response) => {
                        if (response.status == 200) {
                            if (response.data && response.data.status) {
                                switch (response.data.status) {
                                    case 1:
                                        result = "R1";
                                        break;
                                    default:
                                        result = "R6";
                                        break;
                                }
                            }
                            else {
                                result = "R6";
                            }
                        }
                        else {
                            result = "R6";
                        }
                        if (result == "R1") {
                            dbapi.executesql("sendmessagetoemployee", [
                                { name: "employeeId", type: "int", value: req.body.employeeId ? req.body.employeeId : 0 },
                                { name: "employeeMessageText", type: "nvarchar(max)", value: req.body.employeeMessageText ? req.body.employeeMessageText : "" },
                                { name: "messageDatefCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") }], [], (err1, dbres1) => {
                                    if (err1) {
                                        res.send({
                                            result: "R15"
                                        })
                                    }
                                    else {
                                        res.send({
                                            result: "R11"
                                        })
                                    }
                                })
                        }
                        else {
                            res.send({
                                result: "R6"
                            })
                        }
                    })
                        .catch((err) => {
                            fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
                            result = "R7";
                            res.send({
                                result: result
                            })
                        });
                }
            })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }

})
app.post("/admin/updateJobFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("updateJobFromAdmin",
            [
                { name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : 0 },
                { name: "jobOnvan", type: "nvarchar(max)", value: req.body.jobOnvan ? req.body.jobOnvan : "" },
                { name: "bankpeygiricode", type: "nvarchar(max)", value: req.body.bankpeygiricode ? req.body.bankpeygiricode : "" },
                { name: "employerPayment", type: "nvarchar(max)", value: req.body.employerPayment ? req.body.employerPayment : "" },
                { name: "jobtype", type: "nvarchar(max)", value: req.body.jobtype ? req.body.jobtype : "" },
                { name: "jobDateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                { name: "jobSaateKartype", type: "nvarchar(max)", value: req.body.jobSaateKartype ? req.body.jobSaateKartype : "" },
                { name: "jobSaateKarDetail", type: "nvarchar(max)", value: req.body.jobSaateKarDetail ? req.body.jobSaateKarDetail : "" },
                { name: "jobRoozhayeKari", type: "nvarchar(max)", value: req.body.jobRoozhayeKari ? req.body.jobRoozhayeKari : "" },
                { name: "jobHoghoghePishnehadi", type: "nvarchar(max)", value: req.body.jobHoghoghePishnehadi ? req.body.jobHoghoghePishnehadi : "" },
                { name: "jobLocation", type: "nvarchar(max)", value: req.body.jobLocation ? req.body.jobLocation : "" },
                { name: "jobTelephoneSabet", type: "nvarchar(max)", value: req.body.jobTelephoneSabet ? req.body.jobTelephoneSabet : "" },
                { name: "jobCreatorNameAndLastName", type: "nvarchar(max)", value: req.body.jobCreatorNameAndLastName ? req.body.jobCreatorNameAndLastName : "" },
                { name: "jobMazayaAndNokat", type: "nvarchar(max)", value: req.body.jobMazayaAndNokat ? req.body.jobMazayaAndNokat : "" },
                { name: "jobImportanceLevel", type: "nvarchar(10)", value: req.body.jobImportanceLevel ? req.body.jobImportanceLevel : "" },
                { name: "userid", type: "int", value: req.body.userid ? req.body.userid : 0 },
                { name: "dateOfVerifyInPersian", type: "nvarchar(max)", value: req.body.dateOfVerifyInPersian ? req.body.dateOfVerifyInPersian : "" },
                { name: "jobDateOfFinishInPersian", type: "nvarchar(max)", value: req.body.jobDateOfFinishInPersian ? req.body.jobDateOfFinishInPersian : "" },
                { name: "jobAcceptor", type: "int", value: req.body.jobAcceptor ? req.body.jobAcceptor : 0 },
                { name: "jobFinalConditionsAcceptedByBoth", type: "nvarchar(max)", value: req.body.jobFinalConditionsAcceptedByBoth ? req.body.jobFinalConditionsAcceptedByBoth : "" },
                { name: "jobFeedbackFromCreator", type: "nvarchar(max)", value: req.body.jobFeedbackFromCreator ? req.body.jobFeedbackFromCreator : "" },
                { name: "jobScoreToAcceptorByCreator", type: "int", value: req.body.jobScoreToAcceptorByCreator ? req.body.jobScoreToAcceptorByCreator : 0 },
                { name: "jobFeedbackFromCreatorDateInPersian", type: "nvarchar(max)", value: req.body.jobFeedbackFromCreatorDateInPersian ? req.body.jobFeedbackFromCreatorDateInPersian : "" }

            ], [{ name: "result", type: "nvarchar(10)" }], (err, dbres) => {
                if (err) {
                    res.send({
                        result: "R5"
                    })
                }
                else {
                    res.send({
                        result: dbres.output.result
                    })
                }
            })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/registerJobFromAdmin", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("registerJob",
            [
                { name: "jobOnvan", type: "nvarchar(max)", value: req.body.jobOnvan ? req.body.jobOnvan : "" },
                { name: "jobtype", type: "nvarchar(max)", value: req.body.jobtype ? req.body.jobtype : "" },
                { name: "jobDateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                { name: "jobSaateKartype", type: "nvarchar(max)", value: req.body.jobSaateKartype ? req.body.jobSaateKartype : "" },
                { name: "jobSaateKarDetail", type: "nvarchar(max)", value: req.body.jobSaateKarDetail ? req.body.jobSaateKarDetail : "" },
                { name: "jobRoozhayeKari", type: "nvarchar(max)", value: req.body.jobRoozhayeKari ? req.body.jobRoozhayeKari : "" },
                { name: "jobHoghoghePishnehadi", type: "nvarchar(max)", value: req.body.jobHoghoghePishnehadi ? req.body.jobHoghoghePishnehadi : "" },
                { name: "jobLocation", type: "nvarchar(max)", value: req.body.jobLocation ? req.body.jobLocation : "" },
                { name: "jobTelephoneSabet", type: "nvarchar(max)", value: req.body.jobTelephoneSabet ? req.body.jobTelephoneSabet : "" },
                { name: "jobCreatorNameAndLastName", type: "nvarchar(max)", value: req.body.jobCreatorNameAndLastName ? req.body.jobCreatorNameAndLastName : "" },
                { name: "jobMazayaAndNokat", type: "nvarchar(max)", value: req.body.jobMazayaAndNokat ? req.body.jobMazayaAndNokat : "" },
                { name: "jobImportanceLevel", type: "nvarchar(10)", value: req.body.jobImportanceLevel ? req.body.jobImportanceLevel : "" },
                { name: "jobStatusCode", type: "int", value: 0 },
                { name: "jobStatusText", type: "nvarchar(max)", value: 'در انتظار تایید' },
                { name: "userid", type: "int", value: -1 }

            ],
            [
                { name: "result", type: "nvarchar(10)" }
            ], (err, dbres) => {
                if (err) {
                    res.send({
                        result: "R5" //DB Error.
                    })
                }
                else {
                    if (dbres.output && dbres.output.result && dbres.output.result == "ok") {
                        res.send({
                            result: "R0" //DB Ok
                        })
                    }
                    else {
                        res.send({
                            result: "R5" //DB Error
                        })
                    }
                }
            }
        )
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/registerJob", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                result: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    res.send(JSON.stringify([{
                        result: "R4" //security problem, do registering again.
                    }]))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        //job status: 0-> note verified by admin, 1->verified by admin,2->rejected by admin,
                        //3-> accepted by employee and undergoing, 4->finished,5->delete by user
                        dbapi.executesql("registerJob",
                            [
                                { name: "jobOnvan", type: "nvarchar(max)", value: req.body.jobOnvan ? req.body.jobOnvan : "" },
                                { name: "jobtype", type: "nvarchar(max)", value: req.body.jobtype ? req.body.jobtype : "" },
                                { name: "jobDateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                                { name: "jobSaateKartype", type: "nvarchar(max)", value: req.body.jobSaateKartype ? req.body.jobSaateKartype : "" },
                                { name: "jobSaateKarDetail", type: "nvarchar(max)", value: req.body.jobSaateKarDetail ? req.body.jobSaateKarDetail : "" },
                                { name: "jobRoozhayeKari", type: "nvarchar(max)", value: req.body.jobRoozhayeKari ? req.body.jobRoozhayeKari : "" },
                                { name: "jobHoghoghePishnehadi", type: "nvarchar(max)", value: req.body.jobHoghoghePishnehadi ? req.body.jobHoghoghePishnehadi : "" },
                                { name: "jobLocation", type: "nvarchar(max)", value: req.body.jobLocation ? req.body.jobLocation : "" },
                                { name: "jobTelephoneSabet", type: "nvarchar(max)", value: req.body.jobTelephoneSabet ? req.body.jobTelephoneSabet : "" },
                                { name: "jobCreatorNameAndLastName", type: "nvarchar(max)", value: req.body.jobCreatorNameAndLastName ? req.body.jobCreatorNameAndLastName : "" },
                                { name: "jobMazayaAndNokat", type: "nvarchar(max)", value: req.body.jobMazayaAndNokat ? req.body.jobMazayaAndNokat : "" },
                                { name: "jobImportanceLevel", type: "nvarchar(10)", value: req.body.jobImportanceLevel ? req.body.jobImportanceLevel : "" },
                                { name: "jobStatusCode", type: "int", value: 0 },
                                { name: "jobStatusText", type: "nvarchar(max)", value: 'در انتظار تایید' },
                                { name: "userid", type: "int", value: foundUser.id }

                            ],
                            [
                                { name: "result", type: "nvarchar(10)" }
                            ], (err, dbres) => {
                                if (err) {
                                    res.send(JSON.stringify([{
                                        result: "R5" //DB Error.
                                    }]))
                                }
                                else {
                                    if (dbres.output && dbres.output.result && dbres.output.result == "ok") {
                                        res.send(JSON.stringify({
                                            result: "R0" //DB Ok
                                        }))
                                    }
                                    else {
                                        res.send(JSON.stringify([{
                                            result: "R5" //DB Error
                                        }]))
                                    }
                                }
                            }
                        )
                    }
                    else {
                        res.send(JSON.stringify([{
                            result: "R4" //security problem, do registering again.
                        }]))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/refreshdata", (req, res) => {
    try {
        let ipAddr = req.get("origin");
        let code = req.body.code;
        const token = req.cookies && req.cookies.token;
        if (token == null) {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                if (err) {
                    clearInterval(foundUser.ptr);
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]))
                }
                else {
                    var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                    if (foundUser) {
                        dbapi.executesql("refreshUser1",
                            [{ name: 'ipAdddress', type: 'nvarchar(100)', value: foundUser.ipaddress },
                            { name: 'phoneNumber', type: 'nvarchar(100)', value: foundUser.tel },
                            { name: "lastvisitedInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                            { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                            { name: 'usertype', type: 'nvarchar(10)', value: foundUser.usertype }],
                            [{ name: "result", type: "nvarchar(100)" }], (err, userCheckResult) => {
                                if (err) {
                                    var proxyOfRecordsets = [{ res: "error" }];
                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                                if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update2") {
                                    let proxyOfRecordsets = null;
                                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : []);
                                    if (userCheckResult.recordset &&
                                        userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                                        proxyOfRecordsets = [{ res: "update2" },
                                        [{
                                            up: {
                                                upn: foundUser.name,
                                                upln: foundUser.lastName,
                                                upi: "data:image/jpeg;base64," + foundUser.officialimage,
                                            },
                                            uc: foundUser.isPersonalInfosCompleted,
                                            mr: foundUser.readedmessageNumbers,
                                            mu: foundUser.unreadedmessageNumbers,
                                            unc: foundUser.isUniversityCertificateCompleted,
                                            sc: foundUser.isSkillsCompleted,
                                            ic: foundUser.jobinterestcomplete,
                                            jrc: foundUser.jobresumecomplete,
                                            uty: foundUser.usertype,
                                            flc: foundUser.isForeignLanguagesCompleted,
                                        }]];

                                    }
                                    else {
                                        proxyOfRecordsets = [{ res: "update2" }, []];
                                    }

                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update1") {
                                    let proxyOfRecordsets = null;
                                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : []);
                                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                                        proxyOfRecordsets = [{ res: "update1" },
                                        [{
                                            up: {
                                                upn: foundUser.name,
                                                upln: foundUser.lastName,
                                                upi: "data:image/jpeg;base64," + foundUser.officialimage,
                                            },
                                            uc: foundUser.isPersonalInfosCompleted,
                                            mr: foundUser.readedmessageNumbers,
                                            mu: foundUser.unreadedmessageNumbers,
                                            unc: foundUser.isUniversityCertificateCompleted,
                                            sc: foundUser.isSkillsCompleted,
                                            ic: foundUser.jobinterestcomplete,
                                            jrc: foundUser.jobresumecomplete,
                                            uty: foundUser.usertype,
                                            flc: foundUser.isForeignLanguagesCompleted
                                        }]];

                                    }
                                    else {
                                        proxyOfRecordsets = [{ res: "update1" }, []];
                                    }
                                    res.send(JSON.stringify(proxyOfRecordsets));

                                }
                                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update0") {
                                    let proxyOfRecordsets = null;
                                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : []);
                                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                                        proxyOfRecordsets = [{ res: "update0" },
                                        [{
                                            up: {
                                                upn: foundUser.name,
                                                upln: foundUser.lastName,
                                                upi: "data:image/jpeg;base64," + foundUser.officialimage,
                                            },
                                            uc: foundUser.isPersonalInfosCompleted,
                                            mr: foundUser.readedmessageNumbers,
                                            mu: foundUser.unreadedmessageNumbers,
                                            unc: foundUser.isUniversityCertificateCompleted,
                                            sc: foundUser.isSkillsCompleted,
                                            ic: foundUser.jobinterestcomplete,
                                            jrc: foundUser.jobresumecomplete,
                                            uty: foundUser.usertype,
                                            flc: foundUser.isForeignLanguagesCompleted,
                                        }]];

                                    }
                                    else {
                                        proxyOfRecordsets = [{ res: "update0" }, []];
                                    }
                                    res.send(JSON.stringify(proxyOfRecordsets));

                                }
                                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "blocked") {
                                    var proxyOfRecordsets = [{ res: "blocked" }];
                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                                else {
                                    var proxyOfRecordsets = [{ res: "error" }];
                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                            })
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R5" //user has not registered properly.
                        }]))
                    }

                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/authcode", (req, res) => {
    // try {
    let ipAddr = req.get("origin");
    let code = req.body.code;
    const token = req.cookies && req.cookies.token;
    if (token == null) {
        res.send(JSON.stringify([{
            res: "R4" //security problem, do registering again.
        }]))
    }
    else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
            if (err) {
                console.log(err)
                if (foundUser) { clearInterval(foundUser.ptr); }
                res.send(JSON.stringify([{
                    res: "R4" //security problem, do registering again.
                }]))
            }
            else {
                var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);
                if (foundUser) {
                    if (!foundUser.logincodeok) {
                        clearInterval(foundUser.ptr);
                        res.send(JSON.stringify([{
                            res: "R6" //user time to enter code finished.
                        }]))
                    }
                    else if (foundUser.logincodeok && (!code || code != foundUser.logincode)) {
                        res.send(JSON.stringify([{
                            res: "R7" //user entered wrong code.
                        }]))
                    }
                    else {
                        /*
                            Save User in Database...
                        */
                        clearInterval(foundUser.ptr);
                        dbapi.executesql("refreshUser",
                            [{ name: 'ipAdddress', type: 'nvarchar(100)', value: foundUser.ipaddress },
                            { name: 'phoneNumber', type: 'nvarchar(100)', value: foundUser.tel },
                            { name: "lastvisitedInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                            { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
                            { name: 'usertype', type: 'nvarchar(10)', value: foundUser.usertype }],
                            [{ name: "result", type: "nvarchar(100)" }], (err, userCheckResult) => {
                                if (err) {
                                    var proxyOfRecordsets = [{ res: "R5" }];
                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                                if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update2") {
                                    let proxyOfRecordsets = null;
                                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : []);
                                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                                        proxyOfRecordsets = [{ res: "update2" },
                                        [{
                                            up: {
                                                upn: foundUser.name,
                                                upln: foundUser.lastName,
                                                upi: "data:image/jpeg;base64," + foundUser.officialimage,
                                            },
                                            uc: foundUser.isPersonalInfosCompleted,
                                            mr: foundUser.readedmessageNumbers,
                                            mu: foundUser.unreadedmessageNumbers,
                                            unc: foundUser.isUniversityCertificateCompleted,
                                            sc: foundUser.isSkillsCompleted,
                                            ic: foundUser.jobinterestcomplete,
                                            jrc: foundUser.jobresumecomplete,
                                            flc: foundUser.isForeignLanguagesCompleted,
                                            uty: foundUser.usertype
                                        }]];
                                        res.send(JSON.stringify(proxyOfRecordsets));

                                    }
                                    else {
                                        proxyOfRecordsets = [{ res: "update2" }, []];
                                        res.send(JSON.stringify(proxyOfRecordsets));
                                    }
                                }
                                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update1") {
                                    let proxyOfRecordsets = null;
                                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : []);
                                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                                        proxyOfRecordsets = [{ res: "update1" },
                                        [{
                                            up: {
                                                upn: foundUser.name,
                                                upln: foundUser.lastName,
                                                upi: "data:image/jpeg;base64," + foundUser.officialimage,
                                            },
                                            uc: foundUser.isPersonalInfosCompleted,
                                            mr: foundUser.readedmessageNumbers,
                                            mu: foundUser.unreadedmessageNumbers,
                                            unc: foundUser.isUniversityCertificateCompleted,
                                            sc: foundUser.isSkillsCompleted,
                                            ic: foundUser.jobinterestcomplete,
                                            jrc: foundUser.jobresumecomplete,
                                            flc: foundUser.isForeignLanguagesCompleted,
                                            uty: foundUser.usertype
                                        }]];
                                        res.send(JSON.stringify(proxyOfRecordsets));
                                    }
                                    else {
                                        proxyOfRecordsets = [{ res: "update1" }, []];
                                        res.send(JSON.stringify(proxyOfRecordsets));
                                    }
                                }
                                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update0") {
                                    let proxyOfRecordsets = null;
                                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : []);
                                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                                        proxyOfRecordsets = [{ res: "update0" },
                                        [{
                                            up: {
                                                upn: foundUser.name,
                                                upln: foundUser.lastName,
                                                upi: "data:image/jpeg;base64," + foundUser.officialimage,
                                            },
                                            uc: foundUser.isPersonalInfosCompleted,
                                            mr: foundUser.readedmessageNumbers,
                                            mu: foundUser.unreadedmessageNumbers,
                                            unc: foundUser.isUniversityCertificateCompleted,
                                            sc: foundUser.isSkillsCompleted,
                                            ic: foundUser.jobinterestcomplete,
                                            jrc: foundUser.jobresumecomplete,
                                            flc: foundUser.isForeignLanguagesCompleted,
                                            uty: foundUser.usertype
                                        }]];
                                        res.send(JSON.stringify(proxyOfRecordsets));
                                    }
                                    else {
                                        proxyOfRecordsets = [{ res: "update0" }, []];
                                        res.send(JSON.stringify(proxyOfRecordsets));
                                    }
                                }
                                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "blocked") {
                                    var proxyOfRecordsets = [{ res: "blocked" }];
                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                                else {
                                    var proxyOfRecordsets = [{ res: "R5" }];
                                    res.send(JSON.stringify(proxyOfRecordsets));
                                }
                            })
                    }
                }
                else {
                    res.send(JSON.stringify([{
                        res: "R4" //user has not registered properly.
                    }]))
                }

            }
        })
    }
    // }
    // catch (err) {
    //     fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
    //     res.end();
    // }
})
app.post("/verifytel", (req, res) => {
    try {
        let verefCode = Math.floor(Math.random() * 999 + 1000);
        let ipAddr = req.get("origin");
        let result;
        if (req.body.phone && req.body.phone.trim().length == 11) {
            let usertype = req.body.type ? req.body.type : "0";
            axios({
                method: 'post',
                url: 'https://api.sms.ir/v1/send/verify',
                data: JSON.stringify({
                    "mobile": req.body.phone,
                    "templateId": 559989,
                    "parameters": [
                        {
                            "name": "VERIFYCODE",
                            "value": `${verefCode}`
                        }
                    ]
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
                },
            }).then((response) => {
                if (response.status == 200) {
                    if (response.data && response.data.status) {
                        switch (response.data.status) {
                            case 1:
                                result = "R1";
                                break;
                            case 0:
                                result = "R2";
                                break;
                            case 104:
                                result = "R3";
                                break;
                            case 101:
                                result = "R4";
                                break;
                            case 104:
                                result = "R5";
                                break;
                            default:
                                result = "R6";
                                break;
                        }

                    }
                    else {
                        result = "R6";
                    }
                }
                else {
                    result = "R6";
                }
                if (result == "R1") {
                    Caches.usersArray.forEach((user, index) => {
                        if (user.tel == req.body.phone) {
                            clearInterval(Caches.usersArray[index].ptr);
                            Caches.usersArray.splice(index, 1);
                        }
                    })
                    let user = new User(usertype, req.body.phone, ipAddr, verefCode, true);
                    user.userLoginCountDown(helperFuncs.loginCountDownTime);
                    let jwttoken = jwt.sign({ userPhone: req.body.phone, type: usertype }, process.env.ACCESS_TOKEN_SECRET);
                    Caches.usersArray.push(user);
                    res.cookie("token", jwttoken, { sameSite: "none", secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
                    res.send(JSON.stringify({
                        result: result,
                        time: helperFuncs.loginCountDownTime
                    }))
                }
                else {
                    res.send(JSON.stringify({
                        result: result
                    }))
                }
            })
                .catch((err) => {
                    fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
                    result = "R7";
                    res.send(JSON.stringify({
                        result: result
                    }))
                });
        }
        else {
            result = "R7";
            res.send(JSON.stringify({
                result: result
            }))
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/sendMessageByUser", (req, res) => {
    try {
        if (!req.body.mtitle || !req.body.mtext) {
            res.send({
                result: "R3"
            })
        }
        else {
            const token = req.cookies && req.cookies.token;
            if (token == null) {
                res.send({
                    result: "R4" //security problem, do registering again.
                })
            }
            else {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, Proxyphone) => {
                    if (err) {
                        res.send({
                            result: "R4" //security problem, do registering again.
                        })
                    }
                    else {
                        var foundUser = Caches.usersArray.find((user) => user.tel == Proxyphone.userPhone);

                        if (foundUser) {
                            dbapi.executesql("sendMessageByUser",
                                [{ name: "messageTitle", type: "nvarchar(max)", value: req.body.mtitle },
                                { name: "userid", type: "int", value: foundUser.id },
                                { name: "messageText", type: "nvarchar(max)", value: req.body.mtext },
                                { name: "messageDateInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString("fa-IR") }
                                ], [], (err, dbres) => {
                                    if (err) {
                                        res.send({
                                            result: "R5"
                                        })
                                    }
                                    else {
                                        res.send({
                                            result: "R0"
                                        })
                                    }

                                })
                        }
                        else {
                            res.send({
                                result: "R4" //security problem, do registering again.
                            })
                        }
                    }
                })
            }
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/checkisvalid", (req, res) => {
    res.send("ok");
})
app.post("/admin/getPersonalInfoFromAdmin", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token1;
        if (token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
                if (err) {
                    res.send(JSON.stringify([{
                        res: "R4" //security problem, do registering again.
                    }]));
                }
                else {
                    var adminUser = logedInAdminUsers.find((user) => user.user == admin.user && user.pass == admin.pass);
                    if (adminUser) {
                        dbapi.executesql("getPersonlInfoFromAdmin", [{ name: "userid", type: "int", value: req.body.uerId }], [], (err, dbres) => {
                            if (err) {
                                res.send(JSON.stringify([{
                                    res: "R8" //security problem, error in finding user.
                                }]));
                            }
                            else {
                                if (dbres.recordset &&
                                    dbres.recordset.length && dbres.recordset.length > 0) {
                                    let user = new User(dbres.recordset[0].usertype, dbres.recordset[0].phoneNumber, dbres.recordset[0].ipAdddress, 1212, true);
                                    let userIndex = -1;
                                    for (let i = 0; i < usersFromAdmin.length; i++) {
                                        if (usersFromAdmin[i].tel == dbres.recordset[0].phoneNumber) {
                                            userIndex = i;
                                            break;
                                        }
                                    }
                                    if (userIndex != -1) {
                                        usersFromAdmin.splice(userIndex, 1);
                                    }
                                    usersFromAdmin.push(user);
                                    user.createRealatedObjects(dbres.recordset ? [...dbres.recordset] : []);
                                    res.send(user.exposeUserInfos());
                                }
                                else {
                                    res.send(JSON.stringify([{
                                        res: "R8" //security problem, error in finding user.
                                    }]));
                                }
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify([{
                            res: "R4" //security problem, do registering again.
                        }]));
                    }
                }
            })
        }
        else {
            res.send(JSON.stringify([{
                res: "R4" //security problem, do registering again.
            }]));
        };
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/findUser", checkIsAdminMiddleWare, (req, res) => {
    try {
        let userId = req.body.userId ? req.body.userId : 0;
        let userName = req.body.userName ? req.body.userName : "";
        let userLastName = req.body.userLastName ? req.body.userLastName : "";
        dbapi.executesql("findUser", [{ name: "userId", type: "int", value: userId }, { name: "userName", type: "nvarchar(100)", value: userName }, { name: "userLastName", type: "nvarchar(100)", value: userLastName }], [], (err, dbres) => {
            if (err) {
                res.send(JSON.stringify({
                    result: "R3"
                }))
            }
            else {
                res.send(dbres.recordset)
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/verifyJob", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("verifyJob",
            [
                { name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : 0 },
                {
                    name: "jobDateOfVerifyInPersian", type: "nvarchar(max)",
                    value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR")
                }], [{ name: "result", type: "nvarchar(10)" }], (err, dbres) => {
                    if (err) {
                        res.send({
                            result: "R5"
                        })
                    }
                    else {
                        res.send({
                            result: dbres.output.result
                        })
                    }
                })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/rejectJob", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("rejectJob",
            [
                { name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : 0 },
                {
                    name: "jobDateOfRejectInPersian", type: "nvarchar(max)",
                    value: new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR")
                }], [], (err, dbres) => {
                    if (err) {
                        res.send({
                            result: "R5"
                        })
                    }
                    else {
                        res.send({
                            result: "R0"
                        })
                    }
                })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/getJobdetails", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("getJobdetails", [{ name: "jobId", type: "int", value: req.body.jobId ? req.body.jobId : 0 }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                res.send(dbres.recordset)
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/admingetMessages", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("admingetMessages", [], [], (err, dbres) => {
            if (dbres.recordset) {
                res.send(dbres.recordset)
            }
            else {
                res.send({
                    result: "R4" //no user in database
                })
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/admingetJobs", checkIsAdminMiddleWare, (req, res) => {
    try {
        dbapi.executesql("admingetJobs", [], [], (err, dbres) => {
            if (dbres.recordset) {
                res.send(dbres.recordset)
            }
            else {
                res.send(JSON.stringify({
                    result: "R4" //no user in database
                }))
            }
        })
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/admingetUsers", (req, res) => {
    try {
        const token = req.cookies && req.cookies.token1;

        if (token == null) {
            res.send(JSON.stringify({
                result: "R4" //security problem, do registering again.
            }))
        }
        else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
                if (err) {
                    res.send(JSON.stringify({
                        result: "R4" //security problem, do registering again.
                    }))
                }
                else {
                    var adminUser = logedInAdminUsers.find((user) => user.user == admin.user && user.pass == admin.pass);
                    if (adminUser) {
                        dbapi.executesql("admingetUsers", [], [], (err, dbres) => {
                            if (dbres.recordset) {
                                res.send(dbres.recordset)
                            }
                            else {
                                res.send(JSON.stringify({
                                    result: "R4" //no user in database
                                }))
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify({
                            result: "R4" //security problem, do registering again.
                        }))
                    }
                }
            })
        }
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.post("/admin/admincheckvalidity", (req, res) => {
    console.log("Hereeee")
    // try {
    if (req.body.user && req.body.pass) {
        dbapi.executesql("admincheckvalidity", [{ name: 'user', type: 'nvarchar(max)', value: req.body.user },
        { name: 'pass', type: 'nvarchar(max)', value: req.body.pass }], [], (err, dbres) => {
            if (err) {
                res.send({
                    result: "R5"
                })
            }
            else {
                if (dbres.recordset) {
                    if (dbres.recordset.length > 0) {
                        let jwttoken = jwt.sign({ user: req.body.user, pass: req.body.pass }, process.env.ACCESS_TOKEN_SECRET);
                        res.cookie("token1", jwttoken, { sameSite: "none", secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
                        logedInAdminUsers = [];
                        logedInAdminUsers.push({
                            user: req.body.user,
                            pass: req.body.pass,
                        })
                        res.send({
                            result: "R0"
                        })
                    }
                    else {
                        res.send({
                            result: "R4"
                        })
                    }
                }
                else {
                    res.send({
                        result: "R4"
                    })
                }
            }
        })
    }
    else {
        res.send({
            result: "R3"
        })
    }
    // }
    // catch (err) {
    //     fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
    //     res.end();
    // }

})
app.get("/admin*", (req, res) => {
    try {
        fs.createReadStream(path.join(__dirname, "admin/dist/index.html")).pipe(res)
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.get("*", (req, res) => {
    try {
        fs.createReadStream("./client/dist/index.html").pipe(res);
    }
    catch (err) {
        fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
        res.end();
    }
})
app.listen(3000, () => {
    console.log(`server started on port 3000`);
})