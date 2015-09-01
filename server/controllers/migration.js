var mysql = require('mysql');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Custom = require('./custom');
var PostMigration = require('./postMigration');

module.exports = {
  status: null,
  connection: {},
  tableIndex: null,
  tables: null,
  table: {},
  rowIndex: null,
  rows: null,
  fields: null,
  primaryKey: null,
  models:{},
  fieldDefs:{},
  callbackFn: null,
  processRow: function(){
    var that = this;
    var mData = that.rows[that.rowIndex];
    mData._id = that.keyKeyMap[that.primaryKey][mData[that.primaryKey]];
    if(that.keyUpdates.length > 0){
      for(var i=0; i < that.keyUpdates.length; i++){
        if(mData[that.keyUpdates[i]] && that.keyUpdates[i]!=that.primaryKey && that.keyKeyMap[that.keyUpdates[i]][mData[that.keyUpdates[i]]]){  //as the _id field is now the primary key we'll leave the old primary key as is.
          mData[that.keyUpdates[i]] = that.keyKeyMap[that.keyUpdates[i]][mData[that.keyUpdates[i]]];
        }
        else if(that.keyUpdates[i]!=that.primaryKey){
          //delete the field so we don't get an Object cast error
          delete mData[that.keyUpdates[i]]
        }
      }
    }
    if(that.table.name=="thread"){
       console.log(mData.title);
    }
    //Execute any custom row changes before inserting the row
    Custom.execRow(that.table.newName || that.table.name, that.fields, mData, function(row){
      mRow = new that.models[that.table.newName || that.table.name](row);
      mRow.save(function(err){
        if(err){
          console.log(err);
        }
        that.rowIndex++;
        //console.log('saving '+(that.rowIndex) + ' of ' +that.rows.length);
        if(that.rowIndex==that.rows.length){
          if(that.tableIndex == that.tables.length){
            console.log('sending response');
            that.status = 0;
            that.postMigrationRoutine();
          }
          else{
            that.processTable();
          }
        }
        else{
          that.processRow();
        }
      });
    });
  },
  processTable: function(){
    var that = this;
    that.rowIndex = 0;
    that.table = that.tables[that.tableIndex];
    that.tableIndex++;
    var fieldDefs = {};
    var models = {};
    console.log('copying data for - '+that.table.name);
    that.primaryKey = that.tableKeyMap[that.table.name];
    console.log('pk - '+ that.primaryKey);
    var query = that.table.customSql || 'select * from ' + that.table.name;
    that.connection.query(query, function(err, rows, fields){
      that.rows = rows;
      that.fields = fields;
      if(err){
        console.log(err);
      }
      console.log(that.table.name+' returned '+rows.length+' rows');
      that.fieldDefs[that.table.name] = fields;

      var data = {};
      data["_id"] = {type:Schema.ObjectId}
      that.keyUpdates = [];
      for(var f in fields){
        //if the field exists in the primary key map but is not the primary key in this table
        //then the type should be a mongo ObjectId
        if(that.keyKeyMap[fields[f].name]!=undefined && fields[f].name.trim() != that.primaryKey.trim()){
          data[fields[f].name] = {type: Schema.ObjectId};
        }
        else{
          data[fields[f].name] = {type: that.dataTypeMap[fields[f].type]};
        }

        if(that.keyKeyMap[fields[f].name]){
          that.keyUpdates.push(fields[f].name);
        }
      }

      //Execute any custom schema changes before creating the final Mongo Schema object
      Custom.execSchema(that.table.newName || that.table.name, fields, data, function(data){
        var schema = new Schema(data);
        that.models[that.table.newName || that.table.name] = mongoose.model(that.table.newName || that.table.name, schema);

        that.processRow();

      });

    })
  },
  migrate: function(req, res, callbackFn){
    console.log('migration started');
    var that = this;
    that.status = 1;
    that.tableIndex = 0;
    that.callbackFn = callbackFn;
    this.connection = mysql.createConnection({
      host: req.session.config.mysql.host,
      user: req.session.config.mysql.user,
      password: req.session.config.mysql.password,
      database: req.session.config.mysql.database,
    });
    this.connection.connect();
    //create a map for the tables and their primary keys
    this.generateTableKeyMap(req.session.config.mysql.database, function(){
      that.tables = req.session.config.tables;
      console.log('Table Key Map Generated');
      //for each table being loaded get a list of primary keys and map a new ObejctId to them
      that.generateKeyMap(that.tables, function(){
        //migrate the data from each table
        that.tableIndex = 0;
        that.table = that.tables[that.tableIndex];
        that.processTable();
      });
    });
  },
  postMigrationRoutine: function(callbackFn){
    //execute any post migration routines
    //the purpose of this is to allow you to add data or custom models now that the existing data has been migrated
    var that = this;
    PostMigration.execPostMigrationRoutines(this.models, function(){
      that.callbackFn.call(null, {tableKeyMap: that.tableKeyMap, keyKeyMap: that.keyKeyMap, models: that.models, fields:that.fieldDefs});
    });
  },
  mapDataType: {

  },
  tableKeyMap:{

  },
  keyKeyMap:{

  },
  dataTypeMap:{
    "1": Number,
    "2": Number,
    "3": Number,
    "10": Date,
    "252": Buffer,
    "253": String,
    "254": String
  },
  generateTableKeyMap: function(database, callbackFn){
    var that = this;
    this.connection.query('select table_name, column_name from information_schema.key_column_usage where table_schema = "'+database+'" and constraint_name =  "primary"', function(err, rows, fields){
      if(err){
        console.log(err);
      }
      for(r in rows){
        that.tableKeyMap[rows[r].table_name] = rows[r].column_name;
      }
      callbackFn.call(null);
    });
  },
  generateKeyMap: function(tables, callbackFn){
    var that = this;
    var currIndex = 0;
    //var isLast = false;
    for(var t in tables){
      currIndex++
      // = currIndex == tableCount;
      mapKeys(tables[t], currIndex == tables.length)
    }
    function mapKeys(table, isLast){
      var query = 'select distinct '+that.tableKeyMap[table.name]+' as id from '+ table.name;
      that.connection.query(query, function(err, rows, fields){
        if(err){
          console.log(err);
        }
        that.keyKeyMap[that.tableKeyMap[table.name]] = {};
        console.log('creating map for '+ that.tableKeyMap[table.name] + ' in table '+ table.name);
        for(var r in rows){
          that.keyKeyMap[that.tableKeyMap[table.name]][rows[r]["id"]] = mongoose.Types.ObjectId();
        }
        if(isLast){
          callbackFn.call(null);
        }
      });
    }
  }
}
