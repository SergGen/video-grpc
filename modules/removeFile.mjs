import { clientVideo } from "./grpc-client.mjs";

export const removeFile = (req, res, fileName) => {
    clientVideo.deleteFile({ fileName }, (err) => {
        if (err) {
            console.log('Remote server err delete file');
            res.writeHead(500, 'Remote Server Error');
            res.end();
            return;
        }
        res.writeHead(204, 'No content');
        res.end();
    });
}