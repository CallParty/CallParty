'use strict'
import { representativesSchema, usersSchema } from './schema.js'

// Mongodb Connect - mongo --ssl --sslAllowInvalidCertificates aws-us-east-1-portal.23.dblayer.com:16768/callpartyDev -u callparty -p callparty1234!
let mongoose 	= require('mongoose'), 
	dbusername 	= 'callparty',
	dbpassword 	= 'callparty1234!'

mongoose.connect('mongodb://'+dbusername+':'+dbpassword+'@aws-us-east-1-portal.23.dblayer.com:16768/callpartyDev?ssl=true')
//mongoose.connect('mongodb://'+dbusername+':'+dbpassword+'@aws-us-east-1-portal.23.dblayer.com:16768/callpartyProd?ssl=true')
let db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('!!!  MongoDB Connected  !!!')
})

var User = mongoose.model('User', usersSchema)

var silence = new User({ name: 'User Name' });
console.log(silence.name);






