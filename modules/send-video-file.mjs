import { createSimpleMediaStream } from "./create-simple-media-stream.mjs";
import { createVideoStreamByRange } from "./create-video-stream-by-range.mjs";

export const sendVideoFile = (req, res, pathToVideo) => {
    const range = req.headers.range;

    if (!range) {
        createSimpleMediaStream(req, res, pathToVideo);
        return;
    }
    createVideoStreamByRange(res, range, pathToVideo);
}