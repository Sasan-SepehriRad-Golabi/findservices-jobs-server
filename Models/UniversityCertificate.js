class universityCertificate {
    constructor(uniCertId, uniName, uniCert, uniCertext,
        majorName, tasviremadrak1, tasviremadrak2,
        tasviremadrak3, userId) {
        this.uniCertId = uniCertId;
        this.uniName = uniName;
        this.uniCert = uniCert;
        this.uniCertext = uniCertext;
        this.majorName = majorName;
        this.userId = userId;
        this.tasviremadrak1 = tasviremadrak1 ? tasviremadrak1.toString("base64") : "";
        this.tasviremadrak2 = tasviremadrak2 ? tasviremadrak2.toString("base64") : "";
        this.tasviremadrak3 = tasviremadrak3 ? tasviremadrak3.toString("base64") : "";
    }


}
module.exports = universityCertificate;