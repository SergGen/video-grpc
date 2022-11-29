import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from "fs";
import { pipeline } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendScript = (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    const pathToScript = resolve(__dirname, '..', 'public', 'script.js');
    const readStream = fs.createReadStream(pathToScript);
    pipeline(readStream, res, (err) => err && console.log(err));
}