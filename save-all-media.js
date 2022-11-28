"use strict";

const harFile = "www.douyin.com.har";

const fs = require('fs');
const https = require('https')
const md5 = require('md5');

const save = (filename, content) => {
    fs.writeFile(`output/${filename}`, content.text, { encoding: content.encoding }, function (err) {
        if (err) throw err;
        console.log(`${filename} saved`)
    });
}

const rawdata = fs.readFileSync(harFile);
const json = JSON.parse(rawdata);

json.log.entries.forEach(element => {
    const {
        response: { content },
        response: { content: { mimeType, text } },
        request: { url },
        _resourceType
    } = element;

    if (mimeType == "video/mp4") {
        if (typeof text == "string") {
            const hash = md5(text);
            save(`${hash}.${mimeType.split(';')[0].split('/').slice(-1)}`, content)
        } else {
            console.error("No Content")
            throw err;
        }

    }

});