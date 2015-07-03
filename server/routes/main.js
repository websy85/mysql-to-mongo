var mysqlRoutes = require('./mysql');
var mysqlController = require('../../server/controllers/mysql.js');
var mongoose = require('mongoose');
var fs = require('fs');
var busboy = require('connect-busboy');
var stream = require('stream');

module.exports = function(app){
  app.use(busboy());
  app.use('/mysql', mysqlRoutes);

  app.get('/', function(req,res){
    if(!req.session.config){
      req.session.config = {mysql:{}, mongo:null, tables:[]};
    }
    console.log(req.session.config.tables);
    res.render('../server/views/index.jade', {mysql: req.session.config.mysql});
  });

  app.get('/tableselect', function(req,res){
    mysqlController.getTables(req, res, function(tables){
      mysqlController.compare(tables, req.session.config.tables, function(tables){
        res.render('../server/views/table-select.jade', {tables:tables});
      });
    });
  });

  app.get('/mongoconfig', function(req, res){
    res.render('../server/views/mongo-config.jade', {mongo: req.session.config.mongo});
  });

  app.post('/setmongo', function(req, res){
    var mongoConn = 'mongodb://'+req.body.host+':'+req.body.port+'/'+req.body.database;
    req.session.config.mongo  = {
      host: req.body.host,
      port: req.body.port,
      database: req.body.database
    };
    mongoose.connect(mongoConn);
    mongoose.connection.on('connected', function(){
      //drop the database so we start from fresh
      //this should be configurable in the future
      mongoose.connection.db.dropDatabase();
      //mongoose.connect(mongoConn);
      //mongoose.connection.on('connected', function(){
        res.send({readyState:mongoose.connection.readyState});
      //});
    });
    mongoose.connection.on('error', function(err){
      res.send({readyState:mongoose.connection.readyState, error: err})
    });
  });

  app.get('/configtables', function(req, res){
    console.log(req.session.config.tables);
    res.render('../server/views/table-configs.jade', {tables:req.session.config.tables});
  });

  app.post('/saveConfig', function(req, res){
    req.session.config.tables = req.body.tables;
    res.write(''+true);
    res.end();
  });

  app.get('/downloadConfig', function(req, res){
    res.setHeader('Content-disposition','attachment; filename='+req.session.config.mongo.database+'.cfg')
    res.setHeader('Content-Type','application/json');
    res.charset = 'UTF-8';
    res.write(''+JSON.stringify(req.session.config));
    res.end();
  });

  app.post('/loadConfig', function(req, res){
    req.pipe(req.busboy);
    var s = new stream.Writable();
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        file.on('data', function(data){
          req.session.config = JSON.parse(data.toString());
          console.log(req.session.config);
        });
        file.on('end', function(){
          res.redirect('/');
        });
    });
  });
};
