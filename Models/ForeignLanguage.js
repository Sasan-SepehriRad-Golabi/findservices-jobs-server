class ForeignLanguages {
    constructor(zabanId, zabanName1, zabanName2,
        readingLevel1, readingLevel2, writingLevel1, writingLevel2,
        dialogLevel1, dialogLevel2, listenLevel1, listenLevel2,
        zabanCert1, zabanCert2, userid) {
        this.zabanId = zabanId;
        this.zabanName1 = zabanName1;
        this.zabanName2 = zabanName2;
        this.readingLevel1 = readingLevel1;
        this.readingLevel2 = readingLevel2;
        this.writingLevel1 = writingLevel1;
        this.writingLevel2 = writingLevel2;
        this.dialogLevel1 = dialogLevel1;
        this.dialogLevel2 = dialogLevel2;
        this.listenLevel1 = listenLevel1;
        this.listenLevel2 = listenLevel2;
        this.zabanCert1 = zabanCert1 ? zabanCert1.toString("base64") : "";
        this.zabanCert2 = zabanCert2 ? zabanCert2.toString("base64") : "";
        this.userid = userid;
    }


}
module.exports = ForeignLanguages;