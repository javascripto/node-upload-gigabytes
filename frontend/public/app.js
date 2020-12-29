
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
  const fileInput = document.getElementById('file')
  const files = Array.from(fileInput.files)
  if (!files.length) return
  const size = files
    .map(file => file.size)
    .reduce((x, y) => x + y)

  let bytesAmout = size
  updateStatus(size)

  const interval = setInterval(() => {
    console.count()
    const result = bytesAmout - 5e6
    bytesAmout = result < 0 ? 0 : result
    updateStatus(bytesAmout)

    if (bytesAmout === 0) clearInterval(interval)
  }, 50)
}

function onload() {
  console.log('loaded')
}

window.addEventListener('load', onload)
