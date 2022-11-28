"use strict";

const harFile = "www.douyin.com.har";

const fs = require('fs');
const https = require('https')
const md5 = require('md5');
const crypto = require('crypto');

const myArgs = process.argv.slice(2);

const rootRir = "output/";

const getFileChecksum = (file) => {
    const fileBuffer = fs.readFileSync(file);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    return hex;
}

const renameWithChecksum = (oldPath) => {
    console.log("Renaming", oldPath, `${rootRir}${getFileChecksum(oldPath)}.${oldPath.split('.')[1]}`);
    fs.rename(oldPath, `${rootRir}${getFileChecksum(oldPath)}.${oldPath.split('.')[1]}`, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
}

const saveFromHar = (filename, content) => {
    fs.writeFile(`${rootRir}${filename}`, content.text, { encoding: content.encoding }, function (err) {
        if (err) throw err;
        console.log(`${filename} saved`)
        renameWithChecksum(`${rootRir}${filename}`)
    });
}

const download = function (url, filename) {
    const req = https.get(url, (res) => {
        if (res.statusCode !== 200) {
            throw new Error('Cannot get remote resources');
        }
        const filePath = fs.createWriteStream(`${rootRir}${filename}`);
        res.pipe(filePath);
        filePath.on('finish', () => {
            filePath.close();
            console.log('Download Completed');
            renameWithChecksum(`${rootRir}${filename}`)
        })
    })
    req.on('error', function (err) {
        throw err;
    });
};

const rawdata = fs.readFileSync(harFile);
const json = JSON.parse(rawdata);

let i = 0;

json.log.entries.forEach(element => {
    const {
        response: { content },
        response: { content: { mimeType, text } },
        request: { url },
        _resourceType
    } = element;

    // Note the request maybe broken as the video is not fully loaded
    // Do not recommand this for TikTok
    if (myArgs[0] === "saveFromHar") {
        if (mimeType == "video/mp4" || mimeType == "image/jpeg" || mimeType == "image/jpg") {
            if (typeof text == "string") {
                const hash = i++;
                const filename = `${hash}.${mimeType.split(';')[0].split('/').slice(-1)}`;
                saveFromHar(filename, content)
            } else {
                console.error("No Content")
                throw err;
            }
        }
    }

    // Note the url may expire
    if (myArgs[0] === "downloadFromRemote") {
        if (mimeType == "video/mp4" || mimeType == "image/jpeg" || mimeType == "image/jpg") {
            const hash = ++i;
            const filename = `${hash}.${mimeType.split(';')[0].split('/').slice(-1)}`;
            download(url, filename, (e) => console.error(e))
        }
    }

});