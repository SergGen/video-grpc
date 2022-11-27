import { clientVideo } from "./grpc-client.mjs";

export const createSimpleMediaStream = (req, res, pathToMedia) => {
    clientVideo.callMediaInfo({ pathToMedia }, (err, resGrpc) => {
        if (err) {
            res.writeHead(500, 'Remote Server Error');
            res.end();
            return;
        }

        const stream = clientVideo.callMediaSimple({ pathToMedia });
        const headers = {
            'Content-Length': resGrpc.fileSize,
            'Content-Type': resGrpc.mime,
        };
        res.writeHead(200, headers);
        stream.on('data', (chunk) => {
            res.write(chunk.mediaStream);
        });

        stream.on('end', () => {
            res.end();
        });
    });
}