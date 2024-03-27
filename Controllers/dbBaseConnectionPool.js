const sql = require('mssql')
var configs = require("../configs");

const poolPromise = new sql.ConnectionPool(configs.sqlconfig)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL')
        return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports.dbBase = {
    sql,
    poolPromise
}