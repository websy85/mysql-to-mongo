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

$(".connect").on('focusout', 'input.form-control', function(event){
  var data = {};
  $('.connect input.form-control').each(function(index, item){

    if($(item).val()==""){
      return;
    }
    else{
      data[$(item).attr('data-item')] = $(item).val();
    }
    if(index == $('.connect input.form-control').length -1 ){
      helper.GetDBs(data, function(dbs){
        dbs.forEach(function(item, index){
          $('.connect select').append($('<option>', {
            value: item.name,
            text: item.name
          })).prop('disabled', false);
        });
      });
    }
  })
});

$('.connect .save-connection').click(function(event){
  var data = {};
  $('.connect .form-control').each(function(index, item){

    if($(item).val()==""){
      return;
    }
    else{
      data[$(item).attr('data-item')] = $(item).val();
    }
    if(index == $('.connect .form-control').length -1 ){
      helper.SetDB(data, function(success){
        if(success){
          window.location = '/mongoconfig';
        }
      });
    }
  });
});

$('.mongo-config .save-mongo-connection').click(function(event){
  var data = {};
  $('.mongo-config .form-control').each(function(index, item){
    data[$(this).attr('data-item')] = $(this).val();
    if(index == $('.mongo-config .form-control').length -1){
      helper.SetMongoConnection(data, function(data){
        if(data.readyState == 1){
          window.location = '/tableselect';
        }
      });
    }
  });
});

$('.table-select .available-tables li').dblclick(function(event){
  var newTableToMigrate = $(this).clone();
  $(newTableToMigrate).attr("data-id", getInt());
  $('.table-list.selected-tables').append($(newTableToMigrate));
});

$('.table-select .selected-tables li').dblclick(function(event){
  $(this).remove();
});

$('.table-select .confirm-tables').click(function(event){
  var tables = [];
  var configure = $(this).text() == 'Configure';
  $('.table-select .selected-tables li').each(function(index, item){
    var tableName = $(item).attr('data-table');
    var id = $(item).attr('data-id');
    tables.push({
      id: id,
      name: tableName,
      newName: $('[data-id="'+id+'"] [data-table="'+tableName+'"][data-item="newName"]').val(),
      customSql: $('[data-id="'+id+'"] [data-table="'+tableName+'"][data-item="customSql"]').val()
    });

    if(index == $('.table-select .selected-tables li').length -1){
      helper.SetTables(tables, configure, function(result){
        console.log(result);
      });
    }
  });
});

$('.table-config .confirm-table-config').click(function(event){
  var tables = [];
  $('.table-config [data-table]').each(function(tableIndex, item){
    var table = {
      id: $(this).attr('data-id'),
      name: $(this).attr('data-table')
    };
    tables.push(table);
    $(this).children('.form-control').each(function(index, item){
      if($(this).val().trim() != ""){
        table[$(this).attr('data-item')] = $(this).val();
      }
    });
    if(tableIndex == $('.table-config [data-table]').length -1){
      helper.SetTables(tables, false, function(result){
        console.log(result);
      });
    }
  });
});

$('.table-config .save-config').click(function(event){
  var tables = [];
  $('.table-config [data-table]').each(function(tableIndex, item){
    var table = {
      id: $(this).attr('data-id'),
      name: $(this).attr('data-table')
    };
    tables.push(table);
    $(this).children('.form-control').each(function(index, item){
      if($(this).val().trim() != ""){
        table[$(this).attr('data-item')] = $(this).val();
      }
    });
    if(tableIndex == $('.table-config [data-table]').length -1){
      helper.SaveConfig(tables, function(success){
        if(success){
          window.location = '/downloadConfig';
        }
      });
    }
  });
});

$('#configForm').on('change', '#file', function(event){
  $('#configForm').submit();
});

function getInt(){
  return $(".selected-tables li").length;
}

