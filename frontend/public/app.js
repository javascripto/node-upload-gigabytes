//@ts-check
const API_URL = 'http://localhost:3000'
const ON_UPLOAD_EVENT = 'file-uploaded'

var io = io || {}

let bytesAmount = 0

/** @argument size {number} */
function updateStatus(size) {
  const byteSize = humanFileSize(size)
  const text = `Pending Bytes to Upload: <strong>${byteSize}</strong>`
  const sizeOutput = document.getElementById('size')
  sizeOutput.innerHTML = text
}

function humanFileSize(bytes, si=true, dp=1) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return bytes.toFixed(dp) + ' ' + units[u];
}

function showSize() {
  /** @type HTMLInputElement */
  const fileInput = document.querySelector('#file')
  const files = Array.from(fileInput.files)
  if (!files.length) return
  const size = files
    .map(file => file.size)
    .reduce((x, y) => x + y)

  bytesAmount = size
  updateStatus(size)
}

/** @argument targetUrl {string} */
function configureForm(targetUrl) {
  /** @type HTMLFormElement */
  const form = document.querySelector('#form')
  form.action = targetUrl
}

function onLoad() {
  showMessage()
  const ioClient = io.connect(API_URL, { withCredentials: false })

  ioClient.on('connect', msg => {
    console.log('connected', ioClient.id)
    const targetUrl = `${API_URL}?socketId=${ioClient.id}`
    configureForm(targetUrl)
  })

  ioClient.on(ON_UPLOAD_EVENT, (bytesReceived) => {
    console.count(ON_UPLOAD_EVENT)

    bytesAmount -= bytesReceived

    if (bytesAmount < 0) bytesAmount = 0

    updateStatus(bytesAmount)
  })

  updateStatus(0)
}

function updateMessage(message) {
  /** @type HTMLOutputElement */
  const outputMessage = document.querySelector('#msg')
  outputMessage.innerText = message
  outputMessage.classList.add('alert', 'alert-success')
  setTimeout(() => outputMessage.hidden = true, 3000)
}

function showMessage() {
  const urlParams = new URLSearchParams(window.location.search)
  const serverMessage = urlParams.get('msg')
  if (!serverMessage) return
  updateMessage(serverMessage)
}

window.onload = onLoad
