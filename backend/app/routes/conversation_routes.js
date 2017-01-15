var callToAction = require("../conversations/calltoaction").callToAction;

module.exports = function (app) {

  app.get('/api/startconversation', function(req, res) {
    callToAction("1222225531148037");
    res.send('ok');
  })

};
