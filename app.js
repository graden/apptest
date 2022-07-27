const express = require('express'),
  https = require('https'),  // для организации https
  http = require('http'),  // для организации https
  fs = require('fs'),   // для чтения ключевых файлов
  app = express(),
  hostname = 'localhost',
  portHttps = 8443,
  portHttp = 8080,
  bodyParser = require('body-parser'),
  routes = require('./routes/routes'),
  session = require('express-session'),
  fbStore = require('./middleware/session-firebird')(session),
  //cookieParser  = require('cookie-parser'),
  config = require('./config');

//const cookieParser  = require('cookie-parser')

//app.set('views', __dirname + '/views');
//app.set('view engine', 'html'); 

const credentials  = {
    key: fs.readFileSync(__dirname + '/security/localhost.key', 'utf8'), // путь к ключу
    cert: fs.readFileSync(__dirname + '/security/localhost.crt', 'utf8') // путь к сертификату
}

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/plugins'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());

app.use(session({
  secret: 'KulibyakaMustBeYummy',
  saveUninitialized: false,
  resave: false,
  //httpOnly: true,
  //maxAge: 60000,
  store: new fbStore({ttl: 3600, reapInterval: 3600})
}));

routes(app, __dirname + '/views');
 

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(portHttp);
httpsServer.listen(portHttps);

console.log(`Server listening ${hostname} on ports: ${portHttp}, ${portHttps}`);

process.on('exit',function(){
   fbStore.disconnect();
});