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
        response: await res.json(),
        price: res.price || undefined
      }
    } else {
      return {
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

module.exports = {
  checkStatus,
  fetchPromise
}
