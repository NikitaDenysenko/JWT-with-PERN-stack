const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    password: "root1234",
    host: "localhost",
    port: 5432,
    database: 'jwttutorial'
})

module.exports = pool;