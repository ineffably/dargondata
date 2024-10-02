import AdmZip from 'adm-zip';
import { zipfiles } from "./config";
import clientProgress from 'cli-progress';
import { fileDownload, UrlFileMap } from "./fileDownload";
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
const lang = 'en_us';

interface FileEntry {
  map: UrlFileMap;
  showProgress: (number, any, string) => void
  bar: any;
}

export const downloadCardSets = async (zipDestPath = '') => {
  const downloadEntries = zipfiles.map(info => {
    const { url, name } = info;
    return {
      url,
      filename: `${name}.zip`,
      destination: zipDestPath
    };
  });

  if (!fs.existsSync(zipDestPath)) {
    fs.mkdirSync(zipDestPath);
  }

  const filesCompleted = {} as Record<string, boolean>;

  const multibar = new clientProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: `[{bar}] {percentage}% | {filename}`
  }, clientProgress.Presets.shades_grey);

  const showProgress = (progress: number, bar, filename) => {
    const value = Math.round(progress * 100);
    bar.update(value, { filename });
    if (value >= 100) {
      filesCompleted[filename] = true;
      if (Object.values(filesCompleted).every(value => value)) {
        multibar.stop();
      }
    }
    else {
      filesCompleted[filename] = false;
    }
  };

  const entries = downloadEntries.map(map => {
    const { filename } = map;
    const bar = multibar.create(100, 0);
    bar.start(100, 0, { filename });
    return { map, showProgress, bar } as FileEntry;
  })

  return Promise.all(entries.map(async ({ map, showProgress, bar }) => {
    return fileDownload(map, showProgress, bar);
  }))
}

export const getImagePathForSet = (folder = '', set = 'set1', lang = 'en_us') => {
  return `${path.resolve(folder)}/${set}/${lang}/img/cards/`;
}

export const convertSetToWebp = async (sourcePath, convertProgress) => {
  const target = sourcePath.substr(sourcePath.length - 1) === '/' ? sourcePath : sourcePath + '/';
  const dir = fs.readdirSync(target);
  const { bar } = convertProgress

  const multibar = bar.create(100, 0);
  multibar.start(100, 0, { filename: target });

  for (let i = 0; i < dir.length; i++) {
    const file = dir[i];
    if (!file.endsWith('.png')) continue;

    const sourceFile = `${target}${file}`;
    const targetFile = `${target}${file.replace('.png', '.webp')}`;

    try {
      fs.rmSync(targetFile);
    } catch (err) { }

    const command = `cwebp -q 80 ${sourceFile} -o ${targetFile}`;
    const exectIt = async () => {
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`error: ${error.message}`);
            return reject(`error: ${error.message}`);
          }
          if (stderr) {
            return resolve(`${stderr}`)
          }
          return resolve(stdout);
        })
      })
    }

    // console.log(`:==> exec ${command}`);
    const commandResult = await exectIt();
    convertProgress(i / dir.length, multibar, target);
    // console.log(`${[i / dir.length, target]}`)
    // console.log(commandResult);
  }
}

export const convertAllToWebp = async (dataPath = '') => {
  const lang = 'en_us';

  const convertMultibar = new clientProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: `[{bar}] {percentage}% | {filename}`
  }, clientProgress.Presets.shades_grey);

  const pngFilesCompleted = {} as Record<string, boolean>;
  const convertProgress = (progress: number, bar, filename) => {
    const value = Math.round(progress * 100);
    bar.update(value, { filename });
    if (value >= 100) {
      pngFilesCompleted[filename] = true;
      if (Object.values(pngFilesCompleted).every(value => value)) {
        bar.stop();
      }
    }
    else {
      pngFilesCompleted[filename] = false;
    }
  };
  convertProgress.bar = convertMultibar;

  console.log(':==> Converting all images from .png to .webp. this might take some time.');
  // https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.4.0-windows-x64.zip

  
  return await Promise.all(zipfiles.filter(file => file.name.startsWith('set')).map(async ({ name }) => {
    const zipExtractPath = path.resolve(`${dataPath}${name}/${lang}/img/cards/`);
    return await convertSetToWebp(zipExtractPath, convertProgress);
  }))
}

export const removeAllImages = (dataPath, extension = '.png') => {
  const dir = fs.readdirSync(dataPath);
  const paths = dir.filter(
    f => f.startsWith('set')).map(
      setFolder => getImagePathForSet(dataPath, setFolder))

  paths.forEach(path => {
    const dir = fs.readdirSync(path);
    const selectedFiles = dir.filter(file => file.endsWith(extension));
    selectedFiles.forEach(file => {
      console.info(`removing ${file}`);
      fs.unlinkSync(path + file)
    })
  })
}


export const extractZips = (zipSourcePath = '', extractFolder = '') => {
  zipfiles.forEach(fileinfo => {
    const { name } = fileinfo;
    const zipExtractPath = `${extractFolder}${name}/`;
    const zipFilePath = `${zipSourcePath}${name}.zip`;
    const zip = new AdmZip(zipFilePath);

    try {
      console.info(`| creating folder ${zipExtractPath}`);
      fs.mkdirSync(zipExtractPath, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(err);
        throw err;
      }
      console.info(
        '| folder exists'
      );
    }

    console.info(
      `| extracting ${zipFilePath} to ${zipExtractPath}...`
    );
    zip.extractAllTo(zipExtractPath, true);
    console.info(`| extraction complete! ${zipFilePath}`);
  });
}
