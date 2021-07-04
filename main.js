const dlButton = document.querySelector('#download')
const inputtedMaps = document.querySelector('#map-list')
const inputtedZipFileName = document.querySelector('#zip-file-name')
const noVideoCheckbox = document.querySelector('#no-video')
const progress = document.querySelector('#progress')

const addItem = text => {
    var div = document.createElement('div')
    div.setAttribute('class', 'item')
    var textnode = document.createTextNode(text)

    div.appendChild(textnode)
    progress.appendChild(div)
}

dlButton.addEventListener('click', async () => {
    if (progress.children.length > 0) {
        for (i = progress.children.length - 1; i >= 0; i--) {
            await sleep(100)
            progress.children[i].style.animationName = 'fadeOutUp'
            await sleep(250)
            progress.children[i].style.display = 'none'
        }
        await sleep(250)
        progress.innerHTML = ''
    }
    
    dlButton.disabled = true

    // Checks for empty values
    if (inputtedMaps.value == '') {
        addItem('Error: No maps to ZIP')
        dlButton.disabled = false
        return
    }

    addItem('Creating the ZIP file')

    const zipFileName = (inputtedZipFileName.value == '') ? 'Mappack' : inputtedZipFileName.value
    const maps = inputtedMaps.value
    const mapsArr = maps.split(', ')
    const mapSetIds = (mapsArr[0].includes('https://osu.ppy.sh/beatmapsets/')) ? getMapIds(mapsArr) : mapsArr
    const noVideo = (noVideoCheckbox.checked) ? true : false

    await createMapPack(zipFileName, mapSetIds, noVideo)

    await sleep(500)
    addItem('Downloading ZIP file')
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

const getBeatmapFiles = async (setIdArr, noVideo) => {
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

            addItem(`\"${fileName}\" has been added to the ZIP file`)

            files.push(file)
            fileNames.push(fileName)
        } catch (err) {
            addItem(`Error at fetching map: Invalid URL or map set ID doen\'t exist`)
            console.log(err)
        }
    }
    return [files, fileNames]
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function getFileName(url) {
    var fileName = url.split('=')
    return decodeURIComponent(fileName[1])
}

async function createMapPack(zipFileName, setIdArr, noVideo) {
    const zip = new JSZip()
    var files = await getBeatmapFiles(setIdArr, noVideo)
    
    for (i = 0; i < files[0].length; i++) {
        zip.file(files[1][i], files[0][i])
    }
    
    zip.generateAsync({ type: 'blob' })
    .then(content => {
        saveAs(content, zipFileName + '.zip')
    })
}