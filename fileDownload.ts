import path from 'path';
import https from 'https';
import fs from 'fs';
import fsp from 'fs/promises';

export interface UrlFileMap {
  url: string;
  filename: string;
  destination: string;
};

async function pathStats(filePath: string): Promise<null | fs.Stats> {
  try{
    return await fsp.stat(filePath);
  }catch(e) {
    return null;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  return await pathStats(filePath) !== null;
}

export const fileDownload = async (
  { url, destination, filename }: UrlFileMap,
  onProgress: (number, any, string) => void,
  bar?: any) => {

  const destinationFolder = path.resolve(__dirname, destination);
  const localPath = path.resolve(__dirname, destination, filename);

  if (!(await pathStats(destinationFolder))) {
    await fsp.mkdir(destinationFolder, { recursive: true });
  }

  return new Promise(async (resolve, reject) => {
    if (await fileExists(localPath)) {
      onProgress(1, bar, filename);
      return resolve({ url, filename, exists: true });
    }
    https.get(url, (resp) => {
      if (resp.statusCode === 200) {
        const size = resp.headers['content-length'];
        const amount = 0;
        const progress = { size: parseInt(size, 10), amount }
        const file = fs.createWriteStream(localPath);
        
        resp.pipe(file);
        resp.on('data', chunk => {
          progress.amount += chunk.length;
          onProgress((progress.amount / progress.size), bar, filename);
        });
        resp.on('close', () => resolve({ url, filename }));

        file.on('finish', () => { file.close(); resolve({ url, filename }) });
        file.on('error', err => {
          console.error(err);
          // fs.unlinkSync(localPath);
          reject(err);
        })
      }
      else {
        resp.destroy();
        return reject({ 
          message: 'download failed', url, localPath 
        });
      }
    });
  })
};

