#!/usr/bin/env node

import sharp from "sharp";
import fs from "fs";
import path from "path";
import _yargs from "yargs";
import os from "os";
import { hideBin } from "yargs/helpers";
import pack from "../package.json" assert { type: "json" };
const yargs = _yargs(hideBin(process.argv));


//Declare linux console colors
const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    reset: "\x1b[0m",
};


//Create yarg argv with the options 
const argv = await yargs
.scriptName("resizeIcon")
.option('i', {
    alias: 'image',
    describe: 'Path to the input image',
    type: 'string',
    demandOption: true
  })
  .option('d', {
    alias: 'dir',
    describe: 'Directory where the icons will be saved',
    default: path.join(os.homedir(), '/.local/share/icons/hicolor/'),
    type: 'string'
  })
  //Remove the types from the help message
    .help()
    .version(pack.version)
    .alias('help', 'h')
  .argv;

function resizeImg(file: Buffer, width: number, height: number) {

    //Resize the image to the given width and height, scaling it to keep all the content
    return sharp(file).resize(width, height, { fit: "contain" }).toBuffer();

    // return sharp(file).resize(width, height).toBuffer();


}

async function main() {
    console.log();
    let file = argv.i;
    if(!fs.existsSync(file)) return console.log(colors.red + "File not found" + colors.reset);

    //Save the name of the file with the extension
    const fileName = path.basename(file);

    const dirs = scanDirs(argv.d);

    const rawFile = fs.readFileSync(file);

    dirs.forEach(async (dir) => {
        const newFile = await resizeImg(rawFile, dir.width, dir.height);
        fs.writeFileSync(path.join(dir.fullpath, "apps", fileName), newFile);
        console.log(colors.green + `Saved ${fileName} in ${dir.fullpath}` + colors.reset)
    });
}

main();


function scanDirs(dir: string): { fullpath: string, width: number, height: number }[]
{
    let dirs = fs.readdirSync(dir);
    let entries: { fullpath: string, width: number, height: number }[] = [];
    
    // a directory should be like 100x100, 1920x1920, 32x32, 10000x10000
    for(let i = 0; i < dirs.length; i++)
    {
        let [width, height] = dirs[i].split("x").map(x => parseInt(x));
        //Check if the directory is valid
        if(isNaN(width) || isNaN(height)) continue;
        entries.push({ fullpath: path.join(argv.d ,dirs[i]), width, height });
    }
    return entries;
}