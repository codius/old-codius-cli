const logger = require('riverpig')('codius-cli:pod-control')
const multi = require('multi-read-stream')
const chalk = require('chalk')
const split = require('binary-split')
const { parse: parseUrl } = require('url')
const { Transform } = require('stream')

async function attachToLogs (hosts, podId) {
  logger.debug('attaching to logs. hosts=%s podId=%s', hosts, podId)

  const streams = await Promise.all(hosts.map(async host => {
    const url = parseUrl(host)

    const get = (url.protocol === 'https:' ? require('https') : require('http')).get
    const res = await new Promise((resolve, reject) => {
      const req = get(`${host}/pods/${podId}/logs`, resolve)

      req.on('error', err => reject(err))
    })

    const transform = new Transform({
      transform (chunk, encoding, callback) {
        const line = chunk.toString('utf8')

        if (line === 'ping') {
          return
        }

        const firstSpaceIndex = line.indexOf(' ')
        const secondSpaceIndex = line.indexOf(' ', firstSpaceIndex + 1)

        const containerId = line.substring(0, firstSpaceIndex)
        const streamId = line.substring(firstSpaceIndex + 1, secondSpaceIndex)
        const logText = line.substring(secondSpaceIndex + 1)

        const streamColor = streamId === 'stdout'
          ? chalk.green
          : streamId === 'stderr'
            ? chalk.red
            : chalk.blue

        const outputLine = `${chalk.gray(url.hostname)} ${streamColor(containerId)} ${logText}\n`

        callback(null, outputLine)
      }
    })

    res.pipe(split()).pipe(transform)

    return transform
  }))

  return multi(streams)
}

module.exports = {
  attachToLogs
}
