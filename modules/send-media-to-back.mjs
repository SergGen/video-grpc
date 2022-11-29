import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from "fs";
import { clientVideo } from "./grpc-client.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendMediaToBack = (req, res, fileName) => {

    const rdStream = fs.createReadStream(resolve(__dirname, fileName));

    const serviceCall = clientVideo.sendMedia((err, resGrpc) => {
        if(err) {
            console.log(err);
            res.writeHead(500, 'Remote server Error');
            res.end();
        }
        else {
            console.log(resGrpc);
        }
    });

    rdStream.on('data', (chunk) => {
        serviceCall.write({
            fileName,
            chunk
        });
    });
    rdStream.on('error', () => {
        serviceCall.end();
        res.writeHead(500, 'read file Error');
        res.end();
    });
    rdStream.on('end', () => {
        console.log('Send Ok');
        serviceCall.end();
        res.writeHead(200, 'OK');
        res.end();
    });
}