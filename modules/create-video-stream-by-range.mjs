import { getChunkData } from "./get-chunk-data.mjs";
import fs from "fs";
import { pipeline } from "stream";
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = resolve(__dirname, '..', 'proto', 'video.proto');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const videoService = grpc.loadPackageDefinition(packageDefinition).videoService;

const REMOTE_URL = "localhost:9090";
const client = new videoService.VideoService(REMOTE_URL, grpc.credentials.createInsecure());

export const createVideoStreamByRange = ({response, range/*, fileSize, resolvedPath*/, pathToVideo}) => {
    // const { start, end, chunkSize } = getChunkData(range, fileSize);

    // const headers = {
    //     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    //     'Accept-Ranges': 'bytes',
    //     'Content-Length': chunkSize,
    //     'Content-Type': 'video/mp4'
    // };

    // const readStream = fs.createReadStream(resolvedPath, {start, end});

    // const wrStr = fs.createWriteStream(resolve(__dirname, '..', 'test.mp4'), 'binary');

    client.callSize({ pathToVideo }, (err, res) => {
        const { start, end, chunkSize } = getChunkData(range, res.fileSize);
        console.log(start, end, chunkSize);
        const stream = client.callVideo({ pathToVideo, start, end });
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${res.fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        };
        response.writeHead(206, headers);
        stream.on('data', (chunk) => {
            // console.log(chunk)
            response.write(chunk.videoStream);
        });

        stream.on('end', () => {
            response.end();
        });
        // console.dir(stream);

        // response.end();
        //

        // pipeline(stream, response, (err) => {
        //     if (err && !(err.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
        //         console.log(err);
        //     }
        // });
    });

    // const str = client.callVideo({ nameVideo: '123123123' });
    //
    // res.writeHead(206, headers);
    // pipeline(readStream, res, (err) => {
    //     if (err && !(err.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
    //         console.log(err);
    //     }
    // });
}