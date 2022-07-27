const fbConn = require('../middleware/fbConnect'),
  authenticateJWT  = require('../middleware/token'),
  checkAuth  = require('../middleware/checkAuth');

const router = (app, dir) => {
    app.post('/login', (req, res) => {
      const uu = JSON.parse(req.body.request);
      const { username, password } = uu.record;
      var sql = "select * from users";
      var ds = fbConn.querySync(sql);
      var users = ds.fetchSync("all",true);
      const user = users.find(u => { return u.USERNAME === username && u.PASSWORD === password });
      if (user) {
        req.session.username = user.USERNAME;
        res.status(200).json(`done`);
      } else {
        res.status(201).json(`Неверный логин или пароль! Попробуйте снова!`);
      }
    })	

    app.get('/sessions', (req, res) => {
      req.sessionStore.length((err, data) => {
        res.status(200).send('length sessions: '+ data);
        console.log('length sessions: '+ data);
      });
    });
    
    app.get('/removeUsers', (req, res) => {
      console.log(req.query);
      //console.log(res.body);                     						
    });
 
    app.post('/saveUsers', (req, res) => {
      const uu = JSON.parse(req.body.request);
      console.log(uu.record); 
      const { METHOD, ID, FULLNAME, USERNAME, ROLE } = uu.record;
      if (METHOD == 'edit') {
        var sql = `update users set fullname = '${FULLNAME}', username = '${USERNAME}', role = ${ROLE} where id = ${ID}`;
       } else {
        //var sqlID = `SELECT GEN_ID(GEN_USERS_ID, 1) ID FROM RDB$DATABASE`;
        //let ds = fbConn.querySync(sqlID);
        //let usersID = ds.fetchSync("all",true);
        //let insID = usersID[0].ID; 
        var sql = `insert into users (fullname, username, role) values ('${FULLNAME}', '${USERNAME}', ${ROLE})`;
      }
      fbConn.querySync(sql);
      fbConn.commit(err => {
      	if (err) { 
          res.status(201).json({"status": "error", "message": err}); 
        } else {
          //let sqlNew = `select u.*, r.text from users u left join roles r on u.role=r.id where u.id = ${IDID}`;
          //let ds = fbConn.querySync(sqlNew);
          //let users = ds.fetchSync("all",true);
          //res.status(200).json({"status" : "success", "record" : users[0]});
          res.status(200).json({"status" : "success", "message" : "Удачный полет"});
        }
      });
    });

    app.get('/listRoles', (req, res) => {
      //console.log(req.query);
      let sql = "select * from roles";
      let ds = fbConn.querySync(sql);
      let out = new Array();
      let roles = ds.fetchSync("all",true);
      roles.forEach(function(r) {
        let itemRole = {};
        itemRole["id"] = r.ID;
        itemRole["text"] = r.TEXT;
        out.push(itemRole);
      });
      console.log(out);
      res.json(out);
    });

    app.get('/listUsers', (req, res) => {
      let sql = "select u.*, r.text from users u left join roles r on u.role=r.id";
      let ds = fbConn.querySync(sql);
      let users = ds.fetchSync("all",true);
      let out = new Object();
      out["records"] = users;       
      out["total"] = users.length;
      out["status"] = "success";
      res.json(out);
    });

    app.get('/', checkAuth, (req, res) => {
      res.sendFile(dir + '/setting.html');
    });

    app.get('/login', (req, res) => {
      res.sendFile(dir + '/login.html');
    });

	
    app.get('/logout', (req, res) => {
      req.session.destroy();
      res.redirect('/login');
    });

    app.get('/users', checkAuth, (req, res) => {
      res.send(users);
    });
}
 
module.exports = router;