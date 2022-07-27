var nconf = require('nconf');
var path =  require('path');
module.exports = nconf.argv().env().file({
    file: path.join(__dirname, 'config.json')
});


