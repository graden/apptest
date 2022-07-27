var fb  = require("firebird")
var con = fb.createConnection();
con.connectSync('localhost:helper2','sysdba','pharaon','')
module.exports = con