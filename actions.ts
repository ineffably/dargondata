import AdmZip from 'adm-zip';
import { zipfiles, sets } from "./config";
import clientProgress, { Presets } from 'cli-progress';
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

  // console.log({ zipDestPath })
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
    const { filename, destination } = map;
    const bar = multibar.create(100, 0);
    bar.start(100, 0, { filename });
    return { map, showProgress, bar } as FileEntry;
  })

  return Promise.all(entries.map(async ({ map, showProgress, bar }) => {
    // console.log(map);
    // return Promise.resolve(map);
    // const { destination, filename  } = map;
    // const localPath = path.resolve(__dirname, destination, filename);
    // console.log(localPath, destination);
  
    return fileDownload(map, showProgress, bar);
  }))
}

export const getImagePathForSet = (folder = '', set = 'set1', lang = 'en_us') => {
  return `${path.resolve(folder)}/${set}/${lang}/img/cards/`;
}

export const convertAllToWebp = (dataPath = '') => {
  const lang = 'en_us';
  zipfiles.filter(file => file.name.startsWith('set')).forEach(({ name }) => {
    const zipExtractPath = path.resolve(`${dataPath}${name}/${lang}/img/cards/`);
    convertSetToWebp(zipExtractPath);
  })
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

export const convertSetToWebp = async (sourcePath) => {
  const target = sourcePath.substr(sourcePath.length - 1) === '/' ? sourcePath : sourcePath + '/';
  const dir = fs.readdirSync(target);
  return await Promise.all(dir.map(async file => {
    if (!file.endsWith('.png')) return;
    const sourceFile = target + file;
    const targetFile = target + file.replace('.png', '.webp')
    const command = `cwebp -q 80 ${sourceFile} -o ${targetFile}`;
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return reject(`error: ${error.message}`)
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return reject(`stderr: ${stderr}`)
        }
        console.log(stdout);
      })
      return resolve(sourcePath);
    })
  }))
  
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
