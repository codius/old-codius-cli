/**
 * @fileOverview
 * @name utils.js
 * @author Travis Crist
 */

function checkStatus (response) {
  if (response && response.status) {
    const statusString = `${response.status}`
    if (statusString.startsWith('2')) {
      return true
    }
  }
  return false
}

async function fetchPromise (fetchFunction, host, timeout = null) {
  try {
    let res
    if (timeout) {
      let timer
      const timeoutPromise = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          resolve({ error: 'Timed out on Upload', status: 408 })
        }, timeout)
      })
      res = await Promise.race([fetchFunction, timeoutPromise])
      clearTimeout(timer)
    } else {
      res = await fetchFunction
    }
    if (checkStatus(res)) {
      return {
        status: res.status,
        host,
        hostAssetCode: res.destination ? res.destination.assetCode : undefined,
        hostAssetScale: res.destination ? res.destination.assetScale : undefined,
        response: await res.json(),
        price: res.price || undefined
      }
    } else {
      return {
        headers: res.headers,
        host,
        error: res.error ? res.error.toString() : 'Unknown Error Occurred',
        text: res.text ? await res.text() : undefined,
        status: res.status || undefined
      }
    }
  } catch (err) {
    return { host, error: err.toString() || undefined }
  }
}

function checkExpirationDates (statusDetails) {
  statusDetails.map((hostStatus) => {
    const expirationDate = new Date(hostStatus.expirationDate)
    const now = new Date()
    if (expirationDate <= now) {
      throw new Error(`Codius pod deployed to host ${hostStatus.host} expired at ${hostStatus.expirationDate}`)
    }
  })
}

function getManifestHash ({ host, manifestHash }) {
  if (!host) {
    return manifestHash.split('.')[0].toString().replace(/^https?:\/\//i, '')
  }
  return manifestHash
}

function checkDebugFlag (manifestJson) {
  if (manifestJson.debug) {
    throw new Error('Debug is not valid in the codius.json file, use the --debug option to add this flag during upload.')
  }
}

module.exports = {
  checkStatus,
  checkExpirationDates,
  fetchPromise,
  getManifestHash,
  checkDebugFlag
}
