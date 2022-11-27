import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from "fs";
import { pipeline } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendHomePage = (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    const pathHomePage = resolve(__dirname, '..', 'public', 'index.html');
    const readStream = fs.createReadStream(pathHomePage);
    pipeline(readStream, res, (err) => err && console.log(err));
}