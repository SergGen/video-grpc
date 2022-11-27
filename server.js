import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import { stat } from 'node:fs/promises';
import { fileTypeFromFile } from 'file-type';

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

async function callMediaInfo(payload, res) {
    try {
        const resolvedPath = resolve(__dirname, payload.request.pathToMedia);
        const { ext, mime } = await fileTypeFromFile(resolvedPath);
        const { size } = await stat(resolvedPath);
        res(null, { fileSize: size, ext, mime });
    } catch (err) {
        res(err, { fileSize: 0, ext: 'none', mime: 'none' });
    }
}

function callVideoChunk(call) {
    const { pathToMedia, start, end } = call.request;
    const resolvedPath = resolve(__dirname, pathToMedia);
    console.log(resolvedPath, start, end);
    const videoStream = fs.createReadStream(resolvedPath, { start, end });

    videoStream.on('data', (chunk) => {
        call.write({ mediaStream: chunk });
    });

    videoStream.on('end', () => {
        call.end();
    });

    // Так не получилось отдать / принять
    // pipeline(videoDataStream, call, (err) => {
    //     if (err && !(err.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
    //         console.log(err);
    //     }
    // });
}

function callMediaSimple(call) {
    const { pathToMedia } = call.request;
    const resolvedPath = resolve(__dirname, pathToMedia);
    const mediaStream = fs.createReadStream(resolvedPath);
    mediaStream.on('data', (chunk) => {
        call.write({ mediaStream: chunk });
    });
    mediaStream.on('end', () => {
        call.end();
    });
}

const videoService = grpc.loadPackageDefinition(packageDefinition).videoService;

function getServer() {
    const server = new grpc.Server();
    server.addService(videoService.VideoService.service, { callMediaInfo, callVideoChunk, callMediaSimple });
    return server;
}

function main() {
    const videoServer = getServer();
    videoServer.bindAsync('0.0.0.0:9090', grpc.ServerCredentials.createInsecure(), () => {
        videoServer.start();
        console.log('gRPC server running on 0.0.0.0:9090');
    });
}

main();
