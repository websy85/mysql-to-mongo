var mysql = require('mysql');

module.exports = {
  getTables: function(req, res, callbackFn){
    var branch = mysql.createConnection({
      host: req.session.config.mysql.host,
      user: req.session.config.mysql.user,
      password: req.session.config.mysql.password
    });
    branch.connect();
    branch.query('select table_name as name, table_rows as row_count from information_schema.tables where table_schema = "'+req.session.config.mysql.database+'"', function(err, rows, fields){
        if (err){
          console.log(err);
        }
        callbackFn.call(this, rows);
    });
  },
  compare: function(sourceTables, configTables, callbackFn){
    for (var i=0; i<configTables.length; i++){
      for (var j=0; j<sourceTables.length; j++){
        if(sourceTables[j].name == configTables[i].name){
          sourceTables[j].newName = configTables[i].newName || null;
          sourceTables[j].customSql = configTables[i].customSql || null;
          sourceTables[j].checked = true;
          break;
        }
      }
    }
    callbackFn.call(null, sourceTables);
  }
};
