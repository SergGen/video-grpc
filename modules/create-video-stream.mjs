import fs from "fs";
import { pipeline } from "stream";

export const createVideoStream = ({res, fileSize, resolvedPath}) => {
    res.writeHead(200,
        {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        }
    );

    const readStream = fs.createReadStream(resolvedPath);
    pipeline(readStream, res, (err) => {
        if (err && !(err.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
            console.log(err);
        }
    });
}