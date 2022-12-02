import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import { stat, appendFile, access, constants, rm } from 'node:fs/promises';
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

function callMediaInfo(payload, res) {
    const getData = async () => {
        const resolvedPath = resolve(__dirname, payload.request.pathToMedia);
        const { ext, mime } = await fileTypeFromFile(resolvedPath);
        const { size } = await stat(resolvedPath);
        return { size, ext, mime }
    }

    getData()
        .then(({ size, ext, mime }) => {
            res(null, { fileSize: size, ext, mime });
        })
        .catch((err) => {
            console.dir(err);
            res(err, { fileSize: 0, ext: 'none', mime: 'none' });
        });
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

function sendMedia (call, res) {
    call.on('data', (payload) => {
        console.log(payload.fileName);
        const fileName = payload.fileName;
        const chunk = payload.chunk;
        const pathToWrite = resolve(__dirname, fileName);
        console.log(pathToWrite);
        appendFile(pathToWrite, chunk).then().catch((err) => {res(err, {})});
    });

    call.on('error', (err) => {
        console.log(err);
        res(err, {});
    });

    call.on('end', () => {
        console.log('Finished');
        res(null, {});
    });
}

function deleteFile(payload, res) {
    const resolvedPath = resolve(__dirname, payload.request.fileName);
    rm(resolvedPath).then(() => {
        res(null, {});
    }).catch((err) => {
        res(err, {});
    });
}

function isFileExist(payload, res) {
    const resolvedPath = resolve(__dirname, payload.request.fileName);
    access(resolvedPath, constants.R_OK | constants.W_OK).then(() => {
        res(null, { fileExist: true });
    }).catch(() => {
        res(null, { fileExist: false });
    });
}

const videoService = grpc.loadPackageDefinition(packageDefinition).videoService;

function getServer() {
    const proceduresPack = { callMediaInfo, callVideoChunk, callMediaSimple, sendMedia, isFileExist, deleteFile };
    const server = new grpc.Server();
    server.addService(videoService.VideoService.service, proceduresPack);
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
