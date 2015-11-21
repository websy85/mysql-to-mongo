var request = require('request');
var base64 = require('node-base64-image');

var defaultImage = (function(){
  function defaultImage(){
    var defaultUrl = "http://branch.qlik.com/projects/images/qlik/thread/thumbnails/default/1.jpg";
    var that=this;
    base64.base64encoder(defaultUrl, {}, function (err, image) {
      if(err){
        console.log(err);
        image = "";
      }
      console.log(image);
      that.image = image;
    });
  }
  defaultImage.prototype = Object.create(Object.prototype, {
    image: {
      writable: true,
      value: ""
    }
  });

  return defaultImage;
})();

module.exports = new defaultImage();
