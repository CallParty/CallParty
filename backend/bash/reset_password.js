#!/usr/bin/env node
const mongoose = require('mongoose')
mongoose.Promise = require('es6-promise')
mongoose.connect(process.env.MONGODB_URI)

const { AdminUser } = require('../app/models')

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .example('$0 -u username -p password')
  .alias('u', 'user')
  .nargs('u', 1)
  .describe('u', 'The user whose password will be updated')
  .alias('p', 'password')
  .nargs('p', 1)
  .describe('p', 'The new password')
  .demandOption(['u', 'p'])
  .help('h')
  .alias('h', 'help')
  .argv

async function updatePassword(username, password) {
  let adminUser

  adminUser = await AdminUser.findOne({ username }).exec()
  if (!adminUser) {
    console.error(`Unable to find AdminUser with username: ${username}`)
    process.exit(1)
  }

  try {
    adminUser.password = await adminUser.hashPassword(password)
    await adminUser.save()
    return await console.log(`updated password for admin: ${username}`)
  } catch (e) {
    console.error(`Unable to update password for AdminUser ${username}: ${e}`)
    process.exit(1)
  }
}

updatePassword(argv.u, argv.p).then(process.exit)
