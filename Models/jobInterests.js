class jobInterests {
    constructor(interestjobId, interestjob1,
        interestjob2,
        interestjob3,
        jobtype,
        jobtime,
        selfjob,
        drivinglicence,
        extraexplain, userid) {
        this.interestjobId = interestjobId;
        this.interestjob1 = interestjob1;
        this.interestjob2 = interestjob2;
        this.interestjob3 = interestjob3;
        this.jobtype = jobtype;
        this.jobtime = jobtime;
        this.selfjob = selfjob;
        this.drivinglicence = drivinglicence;
        this.extraexplain = extraexplain;
        this.userid = userid;
    }
}
module.exports = jobInterests;