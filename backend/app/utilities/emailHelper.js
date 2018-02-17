const mustache = require('mustache')
const path = require('path')
const fs = require('fs')
const sgMail = require('@sendgrid/mail')
const { PROJECT_DIR } = require('../constants')


async function renderTemplateAsEmail(templatePath, emailVars) {
  const templateDir = path.join(PROJECT_DIR, 'app/templates')
  const fullTemplatePath = path.join(templateDir, templatePath)
  const templateData = fs.readFileSync(fullTemplatePath)
  const renderedTemplate = mustache.render(templateData.toString(), emailVars)
  return renderedTemplate
}


async function sendEmail(subject, templatePath, templateVars, destinationEmail) {
  const emailHTML = await renderTemplateAsEmail(templatePath, templateVars)
  sendEmailHelper(subject, emailHTML, destinationEmail)
}


function sendEmailHelper(subject, emailHTML, destinationEmail) {
  console.log(`++ sending email to ${destinationEmail}`)
  const msg = {
    to: destinationEmail,
    from: 'hi@callparty.org',
    subject: subject,
    html: emailHTML
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sgMail.send(msg)
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