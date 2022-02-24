import path from 'path';
import https from 'https';
import fs from 'fs';

export interface UrlFileMap {
  url: string;
  filename: string;
  destination: string;
};

export const fileDownload = async (
  { url, destination, filename }: UrlFileMap, 
  onProgress: (number,any,string) => void,
  bar?: any) => {

  if(!fs.existsSync(path.resolve(__dirname, destination))) {
    fs.mkdirSync(path.resolve(__dirname, destination), { recursive: true });
  }
    
  const localPath = path.resolve(__dirname, destination, filename);
  
  return new Promise((resolve, reject) => {
    if (fs.existsSync(localPath)) {
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
        resp.destroy
        return reject({message: 'download failed', url, localPath});
      }
    });
  })
};

