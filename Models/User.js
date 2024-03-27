const Caches = require("../Controllers/Caches");
const Message = require("./Message");
const UniversityCertificate = require("./UniversityCertificate")
const ForeignLanguage = require("./ForeignLanguage")
const jobInterests = require("./jobInterests");
const Skill = require("./Skill");
const jobResume = require("./jobResume")
class User {
    constructor(type, tel, ipaddress, logincode, logincodeok) {
        this.usertype = type;
        this.tel = tel;
        this.ipaddress = ipaddress;
        this.logincode = logincode;
        this.logincodeok = logincodeok;
    }
    id = 0;
    phoneNumber = 0;
    ipAdddress = "";
    iProfileCompleted = false;
    name = "";
    lastname = "";
    namePedar = "";
    tarikhetavallod = "";
    shomarehShenasnameh = "";
    ostanetavallod = "";
    selectedKeyWords = [];
    email = "";
    addresses = "";
    lastVisited = "";
    mahalletavallod = "";
    shomarehmelli = "";
    noeKareDarkhasti = "";
    officialimage = null;
    tasvirekartemellijolo = null;
    tasvirekartemelliposht = null;
    tasvireshenasnameh1 = null;
    tasvireshenasnameh2 = null;
    moteahel = "";
    sabeghehbimeh = 0;
    tedadesalhayekarghabli = 0;
    mahlahayekareghabli = "";
    shomarehsabet = "";
    minimumhoghoghedarkhasti = 0;
    melliat = "";
    jensiat = "";
    tedadefarzandan = "";
    sarperastekhanevar = "";
    tedadeafradetahtetakaffol = "";
    ghad = "";
    vazn = "";
    specialill = "";
    sarbaziSayereTozihat = "";
    sarbazi = "";
    blocked = false;
    messages = [];
    skills = {};
    jobResume = {};
    jobinterests = {};
    foreignLanguages = {};
    universityCertificate = {};
    unreadedmessageNumbers = 0;
    readedmessageNumbers = 0;
    jobinterestcomplete = false;
    jobresumecomplete = false;
    isInterestsCompleted = false;
    isSkillsCompleted = false;
    isForeignLanguagesCompleted = false;
    isUniversityCertificateCompleted = false;
    isPersonalInfosCompleted = false;
    //###############################
    time = 0;
    ptr = null;
    userLoginCountDown = (time) => {
        this.time = time;
        clearInterval(this.ptr);
        this.ptr = setInterval(() => {
            this.time--;
            console.log(this.time);
            if (this.time <= 0) {
                clearInterval(this.ptr);
                this.logincodeok = false;
            }
        }, 1000);
    }
    exposeJobInterestInfos = () => {
        return JSON.stringify({
            unji1: this.jobinterests.interestjob1,
            unji2: this.jobinterests.interestjob2,
            unji3: this.jobinterests.interestjob3,
            unjty: this.jobinterests.jobtype,
            unjti: this.jobinterests.jobtime,
            unsj: this.jobinterests.selfjob,
            undl: this.jobinterests.drivinglicence,
            unex: this.jobinterests.extraexplain
        })
    }
    exposeJobResumeInfo = () => {
        return JSON.stringify({
            unjn1: this.jobResume.jobname1,
            unjn2: this.jobResume.jobname2,
            unjn3: this.jobResume.jobname3,
            unjol1: this.jobResume.joboveralllocation1,
            unjol2: this.jobResume.joboveralllocation2,
            unjol3: this.jobResume.joboveralllocation3,
            unjd1: this.jobResume.jobdesc1,
            unjd2: this.jobResume.jobdesc2,
            unjd3: this.jobResume.jobdesc3,
            unjmk1: this.jobResume.jobmoddatekar1,
            unjmk2: this.jobResume.jobmoddatekar2,
            unjmk3: this.jobResume.jobmoddatekar3,
            unjdl1: this.jobResume.jobdetaillocation1,
            unjdl2: this.jobResume.jobdetaillocation2,
            unjdl3: this.jobResume.jobdetaillocation3,
            unjlr1: this.jobResume.jobleftreason1,
            unjlr2: this.jobResume.jobleftreason2,
            unjlr3: this.jobResume.jobleftreason3,
            unjsbf: this.jobResume.jobsabeghebimehfile
        })
    }
    exposeSkillInfos = () => {
        return JSON.stringify({
            unst1: this.skills.skillType1,
            unst2: this.skills.skillType2,
            unst3: this.skills.skillType3,
            unst4: this.skills.skillType4,
            unsl1: this.skills.skillLevel1,
            unsl2: this.skills.skillLevel2,
            unsl3: this.skills.skillLevel3,
            unsl4: this.skills.skillLevel4,
            unsm1: this.skills.sabeghehMaharat1,
            unsm2: this.skills.sabeghehMaharat2,
            unsm3: this.skills.sabeghehMaharat3,
            unsm4: this.skills.sabeghehMaharat,
            unsnf1: this.skills.noeFaragirieMaharat1,
            unsnf2: this.skills.noeFaragirieMaharat2,
            unsnf3: this.skills.noeFaragirieMaharat3,
            unsnf4: this.skills.noeFaragirieMaharat4,
            unsnfe1: this.skills.noeFaragirieMaharatext1,
            unsnfe2: this.skills.noeFaragirieMaharatext2,
            unsnfe3: this.skills.noeFaragirieMaharatext3,
            unsnfe4: this.skills.noeFaragirieMaharatext4,
        })
    }
    exposeZabanInfos = () => {
        return JSON.stringify({
            unzn1: this.foreignLanguages.zabanName1,
            unzn2: this.foreignLanguages.zabanName2,
            unrl1: this.foreignLanguages.readingLevel1,
            unrl2: this.foreignLanguages.readingLevel2,
            unwr1: this.foreignLanguages.writingLevel1,
            unwr2: this.foreignLanguages.writingLevel2,
            undi1: this.foreignLanguages.dialogLevel1,
            undi2: this.foreignLanguages.dialogLevel2,
            unli1: this.foreignLanguages.listenLevel1,
            unli2: this.foreignLanguages.listenLevel2,
            uncer1: this.foreignLanguages.zabanCert1,
            uncer2: this.foreignLanguages.zabanCert2
        })
    }
    exposeUniInfos = () => {
        return JSON.stringify({
            uncert: this.universityCertificate.uniCert,
            uncertext: this.universityCertificate.uniCertext,
            unname: this.universityCertificate.uniName,
            unmajor: this.universityCertificate.majorName,
            unmad1: this.universityCertificate.tasviremadrak1,
            unmad2: this.universityCertificate.tasviremadrak2,
            unmad3: this.universityCertificate.tasviremadrak3

        })
    }
    exposeUserInfos = () => {
        return JSON.stringify({
            uph: this.phoneNumber,
            umlt: this.melliat,
            ujn: this.jensiat,
            utfar: this.tedadefarzandan,
            usarp: this.sarperastekhanevar,
            utafttk: this.tedadeafradetahtetakaffol,
            ughd: this.ghad,
            uzn: this.vazn,
            uspil: this.specialill,
            usarb: this.sarbazi,
            usarbext: this.sarbaziSayereTozihat,
            un: this.name,
            ulastn: this.lastName,
            uttv: this.tarikhetavallod,
            uaddr: this.addresses,
            unp: this.namePedar,
            ue: this.email,
            ushshen: this.shomarehShenasnameh,
            umote: this.moteahel,
            ushs: this.shomarehsabet,
            ushm: this.shomarehmelli,
            uot: this.ostanetavallod,
            unk: this.noeKareDarkhasti,
            uhdh: this.minimumhoghoghedarkhasti,
            uofi: this.officialimage,
            ushen1: this.tasvireshenasnameh1,
            ushen2: this.tasvireshenasnameh2,
            ukmj: this.tasvirekartemellijolo,
            ukmp: this.tasvirekartemelliposht,
            usw: this.selectedKeyWords,
            ubl: this.blocked

        })
    }
    createRealatedObjects = (objArray) => {
        if (objArray && objArray.length > 0) {
            let userInfo = objArray;
            userInfo.forEach(user => {
                let message = new Message(user.messageid, user.messagetext, user.messageimportancelevel, user.messagedateofcreation,
                    user.messageisglobal, user.messagehavebeenseen, user.id);
                this.messages.push(message);
                if (user.messageid && user.messagehavebeenseen) {
                    this.readedmessageNumbers++;
                }
                if (user.messageid && !user.messagehavebeenseen) {
                    this.unreadedmessageNumbers++;
                }
            });
            this.jobinterests = new jobInterests(userInfo[0].interestjobId, userInfo[0].interestjob1,
                userInfo[0].interestjob2,
                userInfo[0].interestjob3,
                userInfo[0].jobtype,
                userInfo[0].jobtime,
                userInfo[0].selfjob,
                userInfo[0].drivinglicence,
                userInfo[0].extraexplain, this.id
            )
            this.jobResume = new jobResume(
                userInfo[0].jobId, userInfo[0].jobname1, userInfo[0].jobname2, userInfo[0].jobname3,
                userInfo[0].joboveralllocation1, userInfo[0].joboveralllocation2, userInfo[0].joboveralllocation3,
                userInfo[0].jobdesc1, userInfo[0].jobdesc2, userInfo[0].jobdesc3, userInfo[0].jobmoddatekar1,
                userInfo[0].jobmoddatekar2, userInfo[0].jobmoddatekar3, userInfo[0].jobdetaillocation1,
                userInfo[0].jobdetaillocation2, userInfo[0].jobdetaillocation3,
                userInfo[0].jobleftreason1, userInfo[0].jobleftreason2, userInfo[0].jobleftreason3,
                userInfo[0].jobsabeghebimehfile, this.id
            )
            this.skills = new Skill(userInfo[0].skillId, userInfo[0].skillType1, userInfo[0].skillType2, userInfo[0].skillType3, userInfo[0].skillType4,
                userInfo[0].skillLevel1, userInfo[0].skillLevel2, userInfo[0].skillLevel3, userInfo[0].skillLevel4, userInfo[0].sabeghehMaharat1,
                userInfo[0].sabeghehMaharat2, userInfo[0].sabeghehMaharat3, userInfo[0].sabeghehMaharat4,
                userInfo[0].noeFaragirieMaharat1, userInfo[0].noeFaragirieMaharat2,
                userInfo[0].noeFaragirieMaharat3, userInfo[0].noeFaragirieMaharat4, userInfo[0].noeFaragirieMaharatext1,
                userInfo[0].noeFaragirieMaharatext2, userInfo[0].noeFaragirieMaharatext3,
                userInfo[0].noeFaragirieMaharatext4, this.id)

            this.foreignLanguages = new ForeignLanguage(userInfo[0].zabanId, userInfo[0].zabanName1, userInfo[0].zabanName2,
                userInfo[0].readingLevel1, userInfo[0].readingLevel2, userInfo[0].writingLevel1, userInfo[0].writingLevel2,
                userInfo[0].dialogLevel1, userInfo[0].dialogLevel2, userInfo[0].listenLevel1, userInfo[0].listenLevel2,
                userInfo[0].zabanCert1, userInfo[0].zabanCert2, this.id)

            this.universityCertificate = new UniversityCertificate(userInfo[0].uniCertId, userInfo[0].uniName,
                userInfo[0].uniCert, userInfo[0].uniCertext, userInfo[0].majorName,
                userInfo[0].tasviremadrak1, userInfo[0].tasviremadrak2,
                userInfo[0].tasviremadrak3, this.id);
            if (userInfo[0].jobresumecomplete) {
                this.jobresumecomplete = true;
            }
            if (userInfo[0].jobinterestcomplete) {
                this.jobinterestcomplete = true;
            }
            if (userInfo[0].skillscomplete) {
                this.isSkillsCompleted = true;
            }
            if (userInfo[0].zabancomplete) {
                this.isForeignLanguagesCompleted = true;
            }
            if (userInfo[0].uniCertComplete) {
                this.isUniversityCertificateCompleted = true;
            }
            if (userInfo[0].iProfileCompleted) {
                this.isPersonalInfosCompleted = true;
            }
            this.id = userInfo[0].id;
            this.blocked = userInfo[0].blocked;
            this.melliat = userInfo[0].melliat;
            this.namePedar = userInfo[0].namePedar;
            this.jensiat = userInfo[0].jensiat;
            this.tedadefarzandan = userInfo[0].tedadefarzandan
            this.sarperastekhanevar = userInfo[0].sarperastekhanevar;
            this.tedadeafradetahtetakaffol = userInfo[0].tedadeafradetahtetakaffol;
            this.ghad = userInfo[0].ghad;
            this.vazn = userInfo[0].vazn;
            this.specialill = userInfo[0].specialill;
            this.sarbaziSayereTozihat = userInfo[0].sarbaziSayereTozihat;
            this.sarbazi = userInfo[0].sarbazi;
            this.phone = userInfo[0].phoneNumber;
            this.phoneNumber = userInfo[0].phoneNumber;
            this.name = userInfo[0].name;
            this.email = userInfo[0].email;
            this.shomarehShenasnameh = userInfo[0].shomarehshenasnameh;
            this.tarikhetavallod = userInfo[0].tarikhetavallod;
            this.noeKareDarkhasti = userInfo[0].noeKareDarkhasti;
            this.lastName = userInfo[0].lastname;
            this.addresses = userInfo[0].addresses;
            this.ostanetavallod = userInfo[0].ostanetavallod;
            this.mahalletavallod = userInfo[0].mahalletavallod;
            this.shomarehmelli = userInfo[0].shomarehmelli;
            this.officialimage = userInfo[0].officialimage ? userInfo[0].officialimage.toString("base64") : "";
            this.tasvirekartemellijolo = userInfo[0].tasvirekartemellijolo ? userInfo[0].tasvirekartemellijolo.toString("base64") : "";
            this.tasvirekartemelliposht = userInfo[0].tasvirekartemelliposht ? userInfo[0].tasvirekartemelliposht.toString("base64") : "";
            this.tasvireshenasnameh1 = userInfo[0].tasvireshenasnameh1 ? userInfo[0].tasvireshenasnameh1.toString("base64") : "";
            this.tasvireshenasnameh2 = userInfo[0].tasvireshenasnameh2 ? userInfo[0].tasvireshenasnameh2.toString("base64") : "";
            this.moteahel = userInfo[0].moteahhel;
            this.sabeghehbimeh = userInfo[0].sabeghehbimeh;
            this.shomarehsabet = userInfo[0].shomarehsabet;
            this.minimumhoghoghedarkhasti = userInfo[0].minimumhoghoghedarkhasti;
            let selectedWordsArray = [];
            try {
                selectedWordsArray = JSON.parse(userInfo[0].selectedKeyWords);
                this.selectedKeyWords = selectedWordsArray;
            }
            catch (err) {
                this.selectedKeyWords = [];
            }

        }
    }
}
module.exports = User