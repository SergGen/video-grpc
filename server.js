import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { dirname, resolve } from "path";
import {fileURLToPath} from "url";
import * as fs from "fs";
// import { pipeline } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = resolve(__dirname, 'proto', 'video.proto');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

function callSize(payload, res) {
    const resolvedPath = resolve(__dirname, payload.request.pathToVideo);
    fs.stat(resolvedPath, (err, stats) => {
        res(null, { fileSize: stats.size });
    });
}

function callVideo(call) {
    const { pathToVideo, start, end } = call.request;
    const videoPath = resolve(__dirname, pathToVideo);
    console.log(videoPath, start, end);
    const videoDataStream = fs.createReadStream(videoPath, { start, end });

    videoDataStream.on('data', (chunk) => {
        // console.log(chunk);
        call.write({ videoStream: chunk });
    });

    videoDataStream.on('end', () => {
        call.end();
    });

    // Так не получилось отдать / принять
    // pipeline(videoDataStream, call, (err) => {
    //     if (err && !(err.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
    //         console.log(err);
    //     }
    // });
}

function main() {
    const videoService = grpc.loadPackageDefinition(packageDefinition).videoService;

    function getServer() {
        const server = new grpc.Server();
        server.addService(videoService.VideoService.service, { callVideo, callSize });
        return server;
    }

    const videoServer = getServer();
    videoServer.bindAsync('0.0.0.0:9090', grpc.ServerCredentials.createInsecure(), () => {
        videoServer.start();
        console.log('gRPC server running on 0.0.0.0:9090');
    });
}

main();
