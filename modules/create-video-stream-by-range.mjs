import { getChunkData } from "./get-chunk-data.mjs";
import { clientVideo } from "./grpc-client.mjs";

export const createVideoStreamByRange = (res, range, pathToMedia) => {
    clientVideo.callMediaInfo({ pathToMedia }, (err, resGrpc) => {
        if (err) {
            res.writeHead(500, 'Remote Server Error');
            res.end();
            return;
        }

        const { start, end, chunkSize } = getChunkData(range, resGrpc.fileSize);

        console.log(start, end, chunkSize);

        const stream = clientVideo.callVideoChunk({ pathToMedia, start, end });
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${resGrpc.fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': resGrpc.mime,
        };
        res.writeHead(206, headers);
        stream.on('data', (chunk) => {
            res.write(chunk.mediaStream);
        });

        stream.on('end', () => {
            res.end();
        });
    });
}