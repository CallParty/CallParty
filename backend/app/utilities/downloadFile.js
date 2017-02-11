const fs = require('fs')
const request = require('request')

module.exports = function downloadFile(url, destPath) {
  return new Promise(function(resolve, reject) {
    const writeableStream = fs.createWriteStream(destPath)
    request.get(url).pipe(writeableStream)
    writeableStream.on('finish', resolve)
    writeableStream.on('error', reject)
  })
}
