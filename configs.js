const sqlconfig = {
    user: 'jobapp_admin',
    password: 'Rr@123456',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
    database: 'jobFindApp',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}
module.exports.sqlconfig = sqlconfig;