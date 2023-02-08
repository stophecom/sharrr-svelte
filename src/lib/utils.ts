export const copyText = (text: string) => navigator.clipboard.writeText(text)

export const createDownloadLinkAndClick = (url: string, fileName?: string) => {
  const a = document.createElement('a')
  a.href = url

  if (fileName) {
    a.download = fileName
  }
  document.body.appendChild(a)
  a.click()
}

export const sendMessageToServiceWorker = <T>(msg: Record<string, unknown>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data === undefined) {
        reject('bad response from serviceWorker')
      } else if (event.data.error !== undefined) {
        reject(event.data.error)
      } else {
        resolve(event.data)
      }
    }

    navigator?.serviceWorker?.controller?.postMessage(msg, [channel.port2])
  })
}
