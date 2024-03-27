class Message {
    constructor(messageid, messagetext, messageimportancelevel,
        messagedateofcreation, messageisglobal, messagehavebeenseen, userid) {
        this.messageid = messageid;
        this.messagetext = messagetext;
        this.messageimportancelevel = messageimportancelevel;
        this.messagedateofcreation = messagedateofcreation;
        this.userid = userid;
        this.messageisglobal = messageisglobal;
        this.messagehavebeenseen = messagehavebeenseen;
    }
}
module.exports = Message;