import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from "fs";
import { pipeline } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendImage = (req, res) => {
    res.setHeader('Content-Type', 'image/jpeg');
    const pathImg = resolve(__dirname, '..', 'public', 'img.jpg');
    const readStream = fs.createReadStream(pathImg);
    pipeline(readStream, res, (err) => err && console.log(err));
}