const dlButton = document.querySelector('#download')
const inputtedMaps = document.querySelector('#map-list')
const inputtedZipFileName = document.querySelector('#zip-file-name')
const noVideoCheckbox = document.querySelector('#no-video')
const fileStatus = document.querySelector('#progress')

function addItem(text, background, url) {
    var div = document.createElement('div')
    div.setAttribute('class', 'item')
    var textnode = document.createTextNode(text)
    div.appendChild(textnode)

    if (background) {
        div.setAttribute('style', `background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("${background}") no-repeat; background-position: -225px -62.5px;`)
    }

    if (url) {
        var a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('target', '_blank')
        a.appendChild(div)
        fileStatus.appendChild(a)
    } else fileStatus.appendChild(div)
}

function displayProgress() {
    var div = document.createElement('div')
    div.setAttribute('class', 'item')

    // Displays the progress bar
    var progress = document.createElement('div')
    progress.setAttribute('class', 'progress-bar')
    var bar = document.createElement('div')
    bar.setAttribute('class', 'bar')
    progress.appendChild(bar)
    div.appendChild(progress)

    var progressDetails = document.createElement('div')
    progressDetails.setAttribute('class', 'progress-details')

    // Displays the downloaded file
    var currentFile = document.createElement('div')
    currentFile.setAttribute('class', 'current-file')
    progressDetails.appendChild(currentFile)

    // Displays current download percent of the ZIP file
    var progressPercent = document.createElement('div')
    progressPercent.setAttribute('class', 'progress-percent')
    progressDetails.appendChild(progressPercent)

    div.appendChild(progressDetails)
    fileStatus.appendChild(div)
}

dlButton.addEventListener('click', async () => {
    // Removes the progress of a previous download if there is one
    if (fileStatus.children.length > 0) {
        for (i = fileStatus.children.length - 1; i >= 0; i--) {
            await sleep(100)
            if (fileStatus.children[i].tagName === 'A') {
                fileStatus.children[i].firstChild.style.animationName = 'fadeOutUp'
            } else fileStatus.children[i].style.animationName = 'fadeOutUp'

            await sleep(250)
            fileStatus.children[i].style.display = 'none'
        }
        await sleep(250)
        fileStatus.innerHTML = ''
    }
    
    dlButton.disabled = true

    // Checks for empty values
    if (inputtedMaps.value == '') {
        if (document.querySelector('#play-sfx').checked) playSFX('sfx/failed.wav', 1.8)
        addItem('Error: No maps to ZIP')
        dlButton.disabled = false
        return
    }

    const zipFileName = (inputtedZipFileName.value == '') ? 'Mappack.zip' : inputtedZipFileName.value + '.zip'
    const maps = inputtedMaps.value
    const mapsArr = maps.split(', ')
    const mapSetIds = (mapsArr[0].includes('https://osu.ppy.sh/beatmapsets/')) ? getMapIds(mapsArr) : mapsArr
    const noVideo = (noVideoCheckbox.checked) ? true : false

    addItem(`Creating "${zipFileName}"`)

    await createMapPack(zipFileName, mapSetIds, noVideo)
    await sleep(1000)
    dlButton.disabled = false
})

function getMapIds(mapUrls) {
    const mapSetIds = []
    mapUrls.forEach(url => {
        var mapSetId = url.slice(31)
        mapSetId = mapSetId.split('#')
        mapSetIds.push(mapSetId[0])
    })
    return mapSetIds
}

async function getBeatmapFiles(setIdArr, noVideo, zipFileName) {
    const files = []
    const fileNames = []

    if (noVideo) var dlType = 'novideo'
    else var dlType = 'full'

    for (i = 0; i < setIdArr.length; i++) {
        try {
            if (i > 0) await sleep(2000)
            const url = `https://dl.sayobot.cn/beatmaps/download/${dlType}/${setIdArr[i]}`
            const resp = await fetch(url)
            const fileName = getFileName(resp.url) + '.osz'
            const file = await resp.blob()

            addItem(`\"${fileName}\" has been added to "${zipFileName}"`, `https://assets.ppy.sh/beatmaps/${setIdArr[i]}/covers/cover.jpg`, `https://osu.ppy.sh/s/${setIdArr[i]}`)

            files.push(file)
            fileNames.push(fileName)
        } catch (err) {
            if (document.querySelector('#play-sfx').checked) playSFX('sfx/failed.wav', 1.8)
            addItem(`Error at fetching map: ${err}`)
            console.log(err)
        }
    }
    return [files, fileNames]
}

async function createMapPack(zipFileName, setIdArr, noVideo) {
    document.title = 'osu! ZIP - Fetching files...'

    const zip = new JSZip()
    var files = await getBeatmapFiles(setIdArr, noVideo, zipFileName)

    // If the ZIP file exceeds 1GB file size, it cancels the download
    if ((files[0].reduce((prev, current) => prev + current.size, 0) / 1000000).toFixed(2) > 1000) {
        playSFX('sfx/failed.wav', 1.8)
        addItem('Error: Limit of 1GB file size has been exceeded')
        return
    }

    document.title = 'osu! ZIP - Zipping...'
    
    for (i = 0; i < files[0].length; i++) {
        zip.file(files[1][i], files[0][i])
    }
    
    await sleep(1000)
    displayProgress()
    const bar = document.querySelector('.bar')
    const currentFile = document.querySelector('.current-file')
    const progressPercent = document.querySelector('.progress-percent')

    currentFile.innerHTML = 'Preparing to Download...'

    try {
        await zip.generateAsync({ type: 'blob' }, metadata => {
            var percent = metadata.percent.toFixed(2)
            var file = metadata.currentFile  
    
            if (file) {
                var fileName = (file.length > 18) ? file.slice(0, 18) + '....osz' : file
                currentFile.innerHTML = `Downloaded "${fileName}"`
            } else currentFile.innerHTML = ''
    
            bar.style.width = `${percent}%`
            progressPercent.innerHTML = `${percent}% Complete`
            document.title = `osu! ZIP - ${Number(percent).toFixed(0)}%`
    
            if (percent > 99.99) currentFile.innerHTML = 'Download complete'
        }).then(content => saveAs(content, zipFileName))

        if (document.querySelector('#play-sfx').checked) playSFX('sfx/finished.mp3', 1.8)
    } catch (err) {
        currentFile.innerHTML = 'Error...'
        bar.style.width = '0%'
        progressPercent.innerHTML = ''

        if (document.querySelector('#play-sfx').checked) playSFX('sfx/failed.wav', 1.8)
        addItem(`Error at downloading ZIP file: ${err}`)
        console.log(err)
    }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const getFileName = url => decodeURIComponent(url.split('=')[1])
const playSFX = (file, vol) => new Howl({src: [file], volume: vol}).play()