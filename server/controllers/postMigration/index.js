var normalizedPath = require("path").join(__dirname);
console.log('Path - '+normalizedPath);

var postmigration = (function(){
  function postmigration(){
    var that = this;
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      if(file!='index.js'){
        console.log('Loading post migration file - ' +file);
        that.functions.push(require(normalizedPath+ '/' + file));
      }
    });
  }
  postmigration.prototype = Object.create(Object.prototype, {
    data:{
      writable: true,
      value: null
    },
    functions:{
      writable: true,
      value: []
    },
    execPostMigrationRoutines:{
      value: function(models, keykeyMap, callbackFn){
        this.models = models;
        this.keykeyMap = keykeyMap;
        this.callback = callbackFn;
        //begin executing the custom schema functions
        this.execPostMigration(0);
      }
    },
    execPostMigration:{
      value: function(index){
        var that = this;
        if(this.functions[index]!=null){
          this.functions[index].call(this, this.models, this.keykeyMap, function(){
            index++;
            that.execPostMigration(index);
          })
        }
        else{
          this.callback.call(null);
        }
      }
    },
  });
  return postmigration;

}());

module.exports = new postmigration();
