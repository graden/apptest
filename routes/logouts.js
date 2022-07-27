var logs  = require('libs/logs')('CON');
exports.get = function(req, res) {
    var user = (!req.session.username) ? 'nouser': req.session.username;
    logs.warn('%s - %s',user, 'Logout');
    req.session.destroy();
    res.redirect('/login');
};