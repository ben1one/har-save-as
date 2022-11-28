"use strict";

const harFile = "www.douyin.com.har";

const fs = require('fs');
const https = require('https')
const md5 = require('md5');

const myArgs = process.argv.slice(2);

const saveFromHar = (filename, content) => {
    fs.writeFile(filename, content.text, { encoding: content.encoding }, function (err) {
        if (err) throw err;
        console.log(`${filename} saved`)
    });
}

const download = function (url, dest) {
    const req = https.get(url, (res) => {
        const filePath = fs.createWriteStream(dest);
        res.pipe(filePath);
        filePath.on('finish', () => {
            filePath.close();
            console.log('Download Completed');
        })
    })
    req.on('error', function (err) {
        throw err;
    });
};

const rawdata = fs.readFileSync(harFile);
const json = JSON.parse(rawdata);

json.log.entries.forEach(element => {
    const {
        response: { content },
        response: { content: { mimeType, text } },
        request: { url },
        _resourceType
    } = element;

    // Note the request maybe broken as the video is not fully loaded
    if(myArgs[0]==="saveFromHar"){
        if (mimeType == "video/mp4") {
            if (typeof text == "string") {
                const hash = md5(text);
                const filename = `output/${hash}.${mimeType.split(';')[0].split('/').slice(-1)}`;
                saveFromHar(filename, content)
            } else {
                console.error("No Content")
                throw err;
            }
        }
    }

    // Note the url may expire
    if(myArgs[0]==="downloadFromRemote"){
        if (mimeType == "video/mp4") {
            const hash = md5(url);
            const filename = `output/${hash}.${mimeType.split(';')[0].split('/').slice(-1)}`;
            download(url, filename, (e) => console.error(e))
        }
    }

});