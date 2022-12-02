'use strict';
import { sendHomePage } from "./modules/send-home-page.mjs";
import { sendVideoFile } from "./modules/send-video-file.mjs";
import http from "http";

import { createSimpleMediaStream } from "./modules/create-simple-media-stream.mjs";
import { sendScript } from "./modules/send-script.mjs";
import {sendMediaToBack} from "./modules/send-media-to-back.mjs";
import { removeFile } from "./modules/removeFile.mjs";

const runnersByRouts = {
    '/': sendHomePage,
    '/video-stream': (req, res) => { sendVideoFile(req, res, 'public/video.mp4') },
    '/img.jpg': (req, res) => { createSimpleMediaStream(req, res, 'public/img.jpg') },
    '/script.js': sendScript,
    '/load-media': (req, res) => { sendMediaToBack(req, res, 'someFile.mp4') },
    '/delete-media': (req, res) => { removeFile(req, res, 'someFile.mp4') },
};

const router = (req, res) => {
    try {
        // if (req.method !== 'GET') {
        //     res.writeHead(405, 'Method Not Allowed');
        //     return res.end();
        // }
        const url = req.url;
        const runner = runnersByRouts[url];
        if (!runner) {
            res.writeHead(404, 'Not Found');
            return res.end();
        }
        runner(req, res);
    } catch (err) {
        console.error(err);
        res.writeHead(500, 'Internal Server Error');
        res.end();
    }
}

const PORT = 8000;
const server = http.createServer(router);
server.listen(PORT, 'localhost', () => {
    console.log(`Server started on port: ${PORT}. Link: http://localhost:${PORT}`);
})