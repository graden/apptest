const Uscore = require('underscore'),
  debug = require('debug')('session-firebird'),
  util = require('util'),
  sql = require('../middleware/fbConnect');

module.exports = function(session) {
  var Store = session.Store;

  function fbStore(options) {
   
    var self = this;

    options = options || {};
    Store.call(self, options);

    if (!Uscore.isUndefined(options.connection) && !(options.connection instanceof sql.Connection)) {
      throw new Error('If defined, options.connection must be instance of mssql.Connection.');
    }
    if (!Uscore.isUndefined(options.ttl) && !Uscore.isNumber(options.ttl)) {
      throw new Error('If defined, options.ttl must be an instance of Number.');
    }
    else if (options.ttl <= 0) {
      throw new Error('If defined, options.ttl must be > 0.'); 
    }
    if (!Uscore.isUndefined(options.reapInterval) && !Uscore.isNumber(options.reapInterval)) {
      throw new Error('If defined, options.reapInterval must be an instance of Number.');
    }
    else if (options.reapInterval === 0 || options.reapInterval < -1) {
      throw new Error('If defined, options.reapInterval must a positive number or -1 to indicate no reaping.'); 
    }
    if (!Uscore.isUndefined(options.reapCallback) && !Uscore.isFunction(options.reapCallback)) {
      throw new Error('If defined, options.reapCallback must be a function.');
    }

    self.options = {
      connection: options.connection,
      ttl: options.ttl || 3600,
      reapInterval: options.reapInterval || 3600,
      reapCallback: options.reapCallback || Uscore.noop
    };

    if (self.options.reapInterval !== -1) {
      self.reap();
      setInterval(self.reap.bind(self), self.options.reapInterval * 1000);
    }
  };

  util.inherits(fbStore, Store);

  fbStore.prototype.reap = function () {
    debug('reap');
    var self = this;
    var ttl = self.options.ttl; 
    if(!sql.inTransaction) sql.startTransactionSync();
    var sqlDel = "delete from Session where lastTouchedUtc <= dateadd(second, -1 * " + ttl + ", CURRENT_TIMESTAMP)";
    sql.querySync(sqlDel);
    sql.commitSync();
    console.log('expired sessions were removed');
  };

  fbStore.prototype.get = function(sessionId, callback) {
    debug('get', sessionId);
    var self = this;
    var session = null;
    var sqlText ="select sessiondata from session where sessionId = '" + sessionId + "'"; 
    var result = sql.querySync(sqlText);
    var data = result.fetchSync("all", false);
    if (data.length > 0) {
      try { 
        session = JSON.parse(data);
      }
      catch(err) {
        return callback(err);
      } 
    } 
    callback(null, session);
  }

  fbStore.prototype.set = function(sessionId, session, callback) {
    debug('set', sessionId, session);
    var sessionData = JSON.stringify(session);
    var sqlText ="select sessionId from Session where sessionId = '" + sessionId + "'"; 
    var sqlIns = "insert into Session (sessionId, sessionData, lastTouchedUtc) values('" + sessionId + "', '" + sessionData + "', CURRENT_TIMESTAMP)";
    var result = sql.querySync(sqlText);
    var data = result.fetchSync("all", false);
    if (data.length == 0) {
      console.log('trans');
      if(!sql.inTransaction) sql.startTransactionSync();
      sql.querySync(sqlIns);
      sql.commit(err => {
        callback(err);
        console.log('created new session. id: '+ sessionId);
      });
    } 
  }

  fbStore.prototype.destroy = function(sessionId, callback) {
    debug('destroy', sessionId);
    var sqlText ="select sessionData from Session where sessionId = '" + sessionId + "'"; 
    var sqlDel = "delete from Session where sessionId = '" + sessionId + "'";
    var result = sql.querySync(sqlText);
    var data = result.fetchSync("all", false);
    if (data.length > 0) {
      if(!sql.inTransaction) sql.startTransactionSync();
      sql.querySync(sqlDel);
      sql.commit(err => {
        if (err) {
          return callback(err);
        }
        console.log('destoyed current session. id: '+ sessionId);
      });
    } 
  }

  fbStore.prototype.touch = function(sessionId, session, callback) {
    debug('touch', sessionId);
    var sqlUpd = "update Session set lastTouchedUtc = CURRENT_TIMESTAMP where sessionId = '" + sessionId + "'";
    if(!sql.inTransaction) sql.startTransactionSync();
    sql.querySync(sqlUpd);
    sql.commit(err => {
      callback(err);
      console.log('updated current session. id: '+ sessionId);
    });
  }

  fbStore.prototype.length = function(callback) {
    debug('length');
    var sqlText = "select count(*) from Session";
    var result = sql.querySync(sqlText);
    var data = result.fetchSync("all", false);
    if (data.length > 0) {
      callback(null, data);
      console.log('Number of sessions received. count:' + data);      
    } else {
      callback(null); 
    }
  }
 
  fbStore.prototype.clear = function(callback) {
    debug('clear');
    var sqlDel = "delete from Session";
    if(!sql.inTransaction) sql.startTransactionSync();
    sql.querySync(sqlDel);
    sql.commit(err => {
      if (err) {
        return callback(err);
      }      
    });
    callback('all session are destoyed.');
  }

  fbStore.disconnect = function() {
     sql.disconnect();
  };

  return fbStore;
}