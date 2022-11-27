import { dirname, resolve } from "path";
import fs from "fs";
import {createVideoStream} from "./create-video-stream.mjs";
import {createVideoStreamByRange} from "./create-video-stream-by-range.mjs";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendVideoFile = ({req, res, pathToVideo}) => {
    // const resolvedPath = resolve(__dirname, '..', pathToVideo);
    // const fileSize = fs.statSync(resolvedPath).size;
    const range = req.headers.range;

    // if (!range) {
    //     createVideoStream({ res, fileSize, resolvedPath });
    //     return;
    // }
    createVideoStreamByRange({ response: res, range/*, fileSize, resolvedPath*/, pathToVideo });
}