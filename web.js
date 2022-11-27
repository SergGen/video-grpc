'use strict';
import { sendHomePage } from "./modules/send-home-page.mjs";
import { sendVideoFile } from "./modules/send-video-file.mjs";
import { sendImage } from "./modules/send-image.mjs";
import http from "http";

const runnersByRouts = {
    '/': sendHomePage,
    '/video-stream': (req, res) => sendVideoFile({req, res, pathToVideo: 'public/video.mp4'}),
    '/img.jpg': sendImage
};

const router = (req, res) => {
    try {
        if (req.method !== 'GET') {
            res.statusCode = 405;
            res.statusMessage = 'Method Not Allowed';
            return res.end();
        }
        const url = req.url;
        const runner = runnersByRouts[url];
        if (!runner) {
            res.statusCode = 404;
            res.statusMessage = 'Not Found';
            return res.end();
        }
        runner(req, res);
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.statusMessage = 'Internal Server Error';
        res.end();
    }
}

const PORT = 8000;
const server = http.createServer(router);
server.listen(PORT, 'localhost', () => {console.log(`Server started on port: ${PORT}. Link: http://localhost:${PORT}`)})