const nodemailer = require('nodemailer');


function sendEmail(subject, message, destinationEmail) {
  console.log(`++ sending email to ${destinationEmail}`)
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'just96.justhost.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"CallParty" <info@callparty.org>', // sender address
    to: destinationEmail, // list of receivers
    subject: subject, // Subject line
    text: `${message}`, // plain text body
    html: `<div>${message}</div>`
  }

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error(error)
    }
    console.log(`++ successfully sent email to ${destinationEmail}`)
  })
}

module.exports = {
  sendEmail,
}

if (require.main === module) {
  sendEmail('CallParty Test Email2', 'test email message', 'maxhfowler@gmail.com')
}