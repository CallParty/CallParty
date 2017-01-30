
module.exports = function (app) {
  app.get('/api/home', function (req, res) {
    res.send('hello')
  })

  app.get('/api/test', function (req, res) {
    res.json({message: 'hello'})
  })

}