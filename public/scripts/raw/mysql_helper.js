var mysqlhelper = (function(){
  function mysqlhelper(){

  }
  mysqlhelper.prototype = Object.create(Object.prototype, {
    TestConnection: {
      value: function(host, user, password, db, callbackFn){
        var data = {
          host: host,
          user: user,
          password: password
        };
        $.post('/mysql/test', data)
        .success(function(success){
          callbackFn.call(null, success);
        });
      }
    },
    SetMongoConnection:{
      value: function(data, callbackFn){
        $.post('/setmongo', data)
        .success(function(data){
          callbackFn.call(null, data);
        });
      }
    },
    GetDBs:{
      value: function(params, callbackFn){
        $.post('/mysql/databases', params)
        .success(function(databases){
          callbackFn.call(null, databases);
        });
      }
    },
    SetDB:{
      value: function(params, callbackFn){
        $.post('/mysql/databases/set', params)
        .success(function(result){
          callbackFn.call(null, result);
        });
      }
    },
    GetTables:{
      value: function(host, user, password, db, callbackFn){
        var data = {
          host: host,
          user: user,
          password: password
        };
        $.post('/mysql/tables', data)
        .success(function(tables){
          callbackFn.call(null, tables);
        });
      }
    },
    SetTables:{
      value: function(tables, configure, callbackFn){
        $.post('/mysql/tables/set', {tables: tables, configure: configure})
        .success(function(data){
          if(data.redirect){
              window.location = data.redirect;
          }
          else{
            callbackFn.call(null, data);
          }
        });
      }
    },
    SaveConfig:{
      value: function(tables, callbackFn){
        $.post('/saveConfig', {tables: tables})
        .success(function(result){
          callbackFn.call(null, result);
        });
      }
    }
  });
  return mysqlhelper;
}());

var helper = new mysqlhelper();
