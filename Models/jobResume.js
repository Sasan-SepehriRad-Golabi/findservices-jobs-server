class jobResume {
    constructor(jobId, jobname1, jobname2, jobname3, joboveralllocation1, joboveralllocation2, joboveralllocation3,
        jobdesc1, jobdesc2, jobdesc3, jobmoddatekar1, jobmoddatekar2, jobmoddatekar3, jobdetaillocation1, jobdetaillocation2, jobdetaillocation3,
        jobleftreason1, jobleftreason2, jobleftreason3, jobsabeghebimehfile, userid) {
        this.jobId = jobId;
        this.jobname1 = jobname1;
        this.jobname2 = jobname2;
        this.jobname3 = jobname3;
        this.joboveralllocation1 = joboveralllocation1;
        this.joboveralllocation2 = joboveralllocation2;
        this.joboveralllocation3 = joboveralllocation3;
        this.jobdesc1 = jobdesc1;
        this.jobdesc2 = jobdesc2;
        this.jobdesc3 = jobdesc3;
        this.jobmoddatekar1 = jobmoddatekar1;
        this.jobmoddatekar2 = jobmoddatekar2;
        this.jobmoddatekar3 = jobmoddatekar3;
        this.jobdetaillocation1 = jobdetaillocation1;
        this.jobdetaillocation2 = jobdetaillocation2;
        this.jobdetaillocation3 = jobdetaillocation3;
        this.jobleftreason1 = jobleftreason1;
        this.jobleftreason2 = jobleftreason2;
        this.jobleftreason3 = jobleftreason3;
        this.userid = userid;
        this.jobsabeghebimehfile = jobsabeghebimehfile ? jobsabeghebimehfile.toString("base64") : "";
    }
}
module.exports = jobResume;