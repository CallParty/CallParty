const nodemailer = require('nodemailer')
const mustache = require('mustache')
const path = require('path')
const fs = require('fs')
const { PROJECT_DIR } = require('../constants')


async function renderTemplateAsEmail(templatePath, emailVars) {
  const templateDir = path.join(PROJECT_DIR, 'app/templates')
  const fullTemplatePath = path.join(templateDir, templatePath)
  const templateData = await fs.readFileSync(fullTemplatePath)
  const renderedTemplate = mustache.render(templateData.toString(), emailVars)
  return renderedTemplate
}


async function sendEmail(subject, templatePath, templateVars, destinationEmail) {
  const emailHTML = await renderTemplateAsEmail(templatePath, templateVars)
  sendEmailHelper(subject, emailHTML, destinationEmail)
}


function sendEmailHelper(subject, emailHTML, destinationEmail) {
  console.log(`++ sending email to ${destinationEmail}`)
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    name: 'CallParty',
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
    html: emailHTML
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
  sendEmailHelper,
  renderTemplateAsEmail
}


async function mainFun() {
  sendEmail('CallParty Data Export', 'dataEmail.html', {dataLink: 'http://twitter.com'}, 'maxhfowler@gmail.com')
  // sendEmail('CallParty Email Test', 'test.html', {test: 'test var'}, 'maxhfowler@gmail.com')
}

if (require.main === module) {
  const dotenv = require('dotenv')
  dotenv.load()
  mainFun()
}