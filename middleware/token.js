const jwt = require('jsonwebtoken')

accessTokenSecret = 'yourtopsecretmydeviceisgoodyourgoingtohome';

exports.verifyToken = function(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("authHeader:" + authHeader); 
    if (authHeader) {
        const token = authHeader.split(' ')[1]; 
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) { 
                console('err:' + err);   
                return res.redirect('/login');
            }
            console.log("get token from client:" + token);
            //req.user = user;
            next();
        });
    } else {
        res.redirect('/login');
    }
}

exports.accessToken = function(user) {
  return jwt.sign({ username: user.username,  role: user.role }, accessTokenSecret);
}
	
