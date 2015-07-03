var request = require('request');

var defaultUrl = "http://branch.qlik.com/projects/images/qlik/thread/thumbnails/default/1.jpg";
request(defaultUrl, function(error, response, body){
  console.log('default image status - ');
  console.log(response.statusCode);
  if(error){
    console.log(err);
    defaultImage = "";
  }
  defaultImage = body;
  module.exports = defaultImage;
});
