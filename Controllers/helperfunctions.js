const Caches = require("./Caches");
const Message = require("../Models/Message");
const UniversityCertificate = require("../Models/UniversityCertificate")
const ForeignLanguage = require("../Models/ForeignLanguage")
const jobInterests = require("../Models/jobInterests");
const Skill = require("../Models/Skill");
const User = require("../Models/User");
module.exports = {

    countdown: function (value) {
        const intervalId = setInterval(() => {
            value--;
            console.log(value);
            if (value <= 0) {
                clearInterval(intervalId);
                return "f";
            }
        }, 1000)
    },
    loginCountDownTime: 50,
    createRepositories: (objArray) => {
        let userMessages = [];
        let userSkills = [];
        let userInterests = [];
        let userZabans = [];
        let userPersonalInfos = {}
        let userUniversity = {};
        if (objArray && objArray.length > 0) {
            let userInfo = objArray;
            userInfo.forEach(user => {
                let message = new Message(user.messageid, user.messagetext, user.messageimportancelevel, user.messagedateofcreation,
                    user.messageisglobal, user.messagehavebeenseen, user.id);
                Caches.messagesArray.push(message);
            });
            userInfo.forEach(user => {
                let skill = new Skill(user.skillid, user.skillname, user.skillyearsofpractice,
                    user.skillmahalhayeghabliekar,
                    user.skillhaveofficialtraining, user.skillofficialcertificate, user.skillcompleted, user.id);
                Caches.skillsArray.push(skill);
            });
            userInfo.forEach(user => {
                let interest = new Interest(user.interestid, user.interestname, user.inerestcompleted, user.id);
                Caches.interestsArray.push(interest);
            });
            userInfo.forEach(user => {
                let foreignlanguage = new ForeignLanguage(user.zabanid, user.zanbanname, user.zabanwritingability, user.zabanzabanwritinglevel,
                    user.zabanreadinability, user.zabanreadinglevel, user.zabanspeakingability, user.zabanspeakinglevel,
                    user.zabanlisteningability, user.zabanlisteninglevel, user.zabanhavingofficialmadrak, user.zabanofficialmadrak,
                    user.zabankharejicompleted, user.id)
                Caches.ForeignLanguageArray.push(foreignlanguage);
            });
            userPersonalInfos = {
                phone: userInfo[0].phoneNumber,
                name: userInfo[0].name,
                lastName: userInfo[0].lastname,
                addresses: userInfo[0].addresses,
                mahalletavallod: userInfo[0].mahalletavallod,
                ashomarehmelli: userInfo[0].ashomarehmelli,
                officialimage: userInfo[0].officialimage,
                tasvirekartemelli: userInfo[0].tasvirekartemelli,
                tasvireshenasnameh1: userInfo[0].tasvireshenasnameh1,
                tasvireshenasnameh2: userInfo[0].tasvireshenasnameh2,
                moteahhel: userInfo[0].moteahhel,
                sabeghehbimeh: userInfo[0].sabeghehbimeh,
                shomarehsabet: userInfo[0].shomarehsabet,
                minimumhoghoghedarkhasti: userInfo[0].minimumhoghoghedarkhasti,

            }
            userUniversity = {
                uniName: userInfo[0].daneshgahname,
                uniOstan: userInfo[0].daneshgahostan,
                uniMoaddel: userInfo[0].daneshgahmoddle,
                uniReshtehTahsili: userInfo[0].daneshgahreshtehtahsili,
                uniType: userInfo[0].daneshgahdaneshgahtype,
                uniMadrak: userInfo[0].daneshgahofficialmadrak,
            }
            console.log(userPersonalInfos);
            console.log(userUniversity);
        }
    }
}