const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const SCRATCH = 'C:\\Users\\MYPC~1\\AppData\\Local\\Temp\\claude\\C--Users-My-PC-Desktop\\874062b6-304f-4c4a-9ff4-7ac63163909e\\scratchpad\\city_src'
const OUT = path.join(process.cwd(), 'public', 'posts', 'cities')

const files = [
  ['sydney', 'sydney-warragamba-dam.jpg'],
  ['brisbane', 'brisbane-wivenhoe-dam.jpg'],
  ['melbourne', 'melbourne-maroondah-dam.jpg'],
  ['hobart', 'hobart-rivulet.jpg'],
  ['canberra', 'canberra-googong-dam.jpg'],
  ['gold-coast', 'gold-coast-hinze-dam.jpg'],
  ['sunshine-coast', 'sunshine-coast-baroon-pocket-dam.jpg'],
  ['wollongong', 'wollongong-cordeaux-dam.jpg'],
]

async function run() {
  for (const [src, outName] of files) {
    const inPath = path.join(SCRATCH, `${src}.jpg`)
    const tmpOut = path.join(OUT, `.${outName}.tmp`)
    const finalOut = path.join(OUT, outName)
    await sharp(inPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmpOut)
    fs.renameSync(tmpOut, finalOut)
    const stat = fs.statSync(finalOut)
    console.log(`${outName}: ${(stat.size / 1024).toFixed(0)} KB`)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
