var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    migration = require('../controllers/migration');

router.get('/test', function(req, res){

});

router.post('/databases', function(req, res){
  console.log('Params - '+req.body.host);
  var branch = mysql.createConnection({
    host: req.body.host,
    user: req.body.user,
    password: req.body.password
  });
  branch.connect(function(err){
    if(err){
      console.error('error connecting' + err.stack)
    }
  });
  branch.query('select distinct table_schema as name from information_schema.tables', function(err, rows, fields){
      if (err){
        console.log(err);
      }
      res.send(rows);
  });

});

router.post('/databases/set', function(req, res){
  req.session.config.mysql = {
    host: req.body.host,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database
  };
  res.send(true);
});

router.post('/tables', function(req, res){
    var branch = new DB({
      host: req.params.host,
      user: req.params.user,
      password: req.params.password,
      database: req.params.db
    });
});

router.post('/tables/set', function(req, res){
  console.log('setting tables - ' + req.body.tables.length);
  req.session.config.tables = [];
  var configure = req.body.configure;
  for(var i=0;i<req.body.tables.length;i++){
    console.log('adding table to session - ' + req.body.tables[i]);
    req.session.config.tables.push(req.body.tables[i]);
    if(i==req.body.tables.length - 1){
      console.log('should configure = '+ configure);
      if(configure=="true"){
        //load the config page
        console.log('redirecting to configure page');
        res.send({redirect:'/configtables'});
      }
      else{
        if(!migration.status || migration.status==0){
        //start the migration
          res.connection.setTimeout(0);
          migration.migrate(req, res, function(data){
            res.send({maps:data, tables:req.session.config.tables});
          });
        }
        else{
          //migration is already in progress and for some reason we're trying to run it again
          console.log('attempted to run migration whilst already in progress');
        }
      }
    }
  }
  if(req.body.tables.length==0){
    res.send({error: 'no tables'});
  }
});

module.exports = router;
