var normalizedPath = require("path").join(__dirname);
console.log('Path - '+normalizedPath);

var custom = (function(){
  function custom(){
    var that = this;
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      if(file!='index.js'){
        console.log('Loading custom file - ' +file);
        that.functions.push(require(normalizedPath+ '/' + file));
      }
    });
  }
  custom.prototype = Object.create(Object.prototype, {
    data:{
      writable: true,
      value: null
    },
    functions:{
      writable: true,
      value: []
    },
    execSchema:{
      value: function(table, fields, data, callbackFn){
        this.data = {
          table: table,
          fields: fields,
          data: data  //at this stage data should be the schema
        }
        this.callback = callbackFn;
        //begin executing the custom schema functions
        this.execSchemaFunction(0);
      }
    },
    execRow:{
      value: function(table, fields, data, callbackFn){
        this.data = {
          table: table,
          fields: fields,
          data: data  //at this stage data should be the actual data for the row
        }
        this.callback = callbackFn;
        //begin executing the custom row functions
        this.execRowFunction(0);
      }
    },
    execSchemaFunction:{
      value: function(index){
        var that = this;
        if(this.functions[index]!=null){
          if(this.functions[index].schema){
            this.functions[index].schema.call(this, this.data, function(schema){
              index++;
              that.data.data = schema;
              that.execSchemaFunction(index);
            })
          }
          else{
            index++;
            this.execSchemaFunction(index);
          }
        }
        else{
          this.callback.call(null, this.data.data);
        }
      }
    },
    execRowFunction:{
      value: function(index){
        var that = this;
        if(this.functions[index]!=null){
          if(this.functions[index].row){
            this.functions[index].row.call(this, this.data, function(row){
              index++;
              that.data.data = row;
              that.execRowFunction(index);
            })
          }
          else{
            index++;
            this.execRowFunction(index);
          }
        }
        else{          
          this.callback.call(null, this.data.data);
        }
      }
    },
    callback:{
      writable: true,
      value: null
    }
  });

  return custom;

}());



module.exports = new custom();
