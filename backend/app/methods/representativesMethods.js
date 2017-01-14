var Reps = require('./schemas/representativesSchema.js'),
// Mongodb Connect - mongo --ssl --sslAllowInvalidCertificates aws-us-east-1-portal.23.dblayer.com:16768/callpartyDev -u callparty -p callparty1234!
	mongoose 	= require('mongoose'), 
	dbusername 	= 'callparty',
	dbpassword 	= 'callparty1234!'

module.exports = function(props, mongoose) {
	mongoose.connect('mongodb://'+dbusername+':'+dbpassword+'@aws-us-east-1-portal.23.dblayer.com:16768/callpartyDev?ssl=true')
	//mongoose.connect('mongodb://'+dbusername+':'+dbpassword+'@aws-us-east-1-portal.23.dblayer.com:16768/callpartyProd?ssl=true')
	var db = mongoose.connection

	db.on('error', console.error.bind(console, 'connection error:'))
	db.once('open', function() {
	  console.log('!!!  MongoDB Connected  !!!')
	})

}

exports.insertReps = function(req, res) {
  var rep = new Reps()
  console.log('Reps')
}