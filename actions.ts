import AdmZip from 'adm-zip';
import { binPath, dataPath, getSetBundles, zipPath } from "./config";
import clientProgress from 'cli-progress';
import { fileDownload, UrlFileMap } from "./fileDownload";
import fs, { rmSync } from 'fs';
import fsp from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';

interface FileEntry {
  map: UrlFileMap;
  showProgress: (number, any, string) => void
  bar: any;
}

interface DownloadEntry {
  url: string;
  filename: string;
  destination: string;
}


export const getDownloadsModel = (): DownloadEntry[] => (
  getSetBundles().map(info => {
    const { url, name } = info;
    return {
      url,
      filename: `${name}.zip`,
      destination: ''
    };
  })
)

export const getMissingZips = (): DownloadEntry[] => {
  const downloadModel = getDownloadsModel();
  const missingZips = downloadModel.filter(({ filename }) => {
    const localPath = path.join(__dirname, zipPath, filename)
    return !fs.existsSync(localPath);
  })
  return missingZips;
}

export const downloadCardSets = (downloadEntries: DownloadEntry[]) => {
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

export const downloadMissingCardSetBundles = async () => {
  const missingZips = getMissingZips();
  const downloadEntries = getSetBundles()
    .filter(entry => missingZips.some(missing => missing.filename === `${entry.name}.zip`))
    .map(info => {
      const { url, name } = info;
      return {
        url,
        filename: `${name}.zip`,
        destination: zipPath
      };
    });

  if (downloadEntries.length === 0) {
    console.info(':==> No missing bundles to download');
    return;
  }

  const localZipPath = path.join(__dirname, zipPath);
  if (!fs.existsSync(localZipPath)) {
    fs.mkdirSync(localZipPath);
  }

  await downloadCardSets(downloadEntries);

  console.log(':==> download missing cardset bundles complete!');
}

export const getImagePathForSet = (folder = '', set = 'set1', lang = 'en_us') => {
  return `${path.resolve(folder)}/${set}/${lang}/img/cards/`;
}

export const folderTree = async (path, depth = 0, files = []) => {
  return await Promise.all(
    (await fsp.readdir(path)).map(async (fileName) => {
      const stat = await fsp.stat(`${path}/${fileName}`)
      const isDirectory = stat.isDirectory();
      let children = [];
      if (isDirectory) {
        children = await folderTree(`${path}/${fileName}`, depth + 1, files);
      }
      if (isDirectory) {
        return {
          path: `${path}/${fileName}`,
          depth,
          fileName,
          children
        }
      }
      else {
        files.push(`${path}/${fileName}`);
        return {
          path: `${path}/${fileName}`,
          fileName,
        }
      }
    })
  );
}

export const findAllPngAssets = async () => {
  const files = [];
  // let's traverse the folder structure, but, we just need the files.
  await folderTree(dataPath.substring(0, dataPath.length - 1), 0, files);
  return files.filter(file => file.endsWith('.png'));
}

export const findAllJsonAssets = async () => {
  const files = [];
  // let's traverse the folder structure, but, we just need the files.
  await folderTree(dataPath.substring(0, dataPath.length - 1), 0, files);
  return files.filter(file => file.endsWith('.json'));
}

export const consolidateDataFiles = async () => {
  const dataFileName = 'card-sets.json';
  const jsonFiles = (await findAllJsonAssets()).filter(
    file => !file.includes('card-sets.json')
  );
  const jsonData = {};
  for (const file of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const filename = path.basename(file);
    const key = filename.substring(0, filename.lastIndexOf('.'));
    jsonData[key] = data;
  }

  const jsonFilePath = path.join(__dirname, dataPath, dataFileName);
  console.log(`:==> writing consolidated json data to ${jsonFilePath}`);

  await fsp.writeFile(
    path.join(__dirname, dataPath, dataFileName),
    JSON.stringify(jsonData, null, 2),
    'utf8'
  )

  return jsonData;
}

export const execCommand = async (command): Promise<any> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return reject({ error: error.message });
      }
      if (stderr) {
        // console.log(`stderr: ${stderr}`);
        return resolve({ stderr })
      }
      return resolve({ stdout });
    })
  })
}

export const convertAllPngsToWebp = async () => {
  const files = await findAllPngAssets();
  const pngFilesCompleted = {} as Record<string, boolean>;

  const progressBar = new clientProgress.SingleBar({
    clearOnComplete: false,
    hideCursor: true,
    format: `[{bar}] {percentage}% | {filename}`
  }, clientProgress.Presets.shades_grey);
  
  // progressBar.start(100, 0, { filename: files[0] });
  for (let i = 0; i < files.length - 1; i++) {
    
    const sourceFile = files[i];
    if (!sourceFile.endsWith('.png')) continue;

    const targetFile = `${sourceFile.replace('.png', '.webp')}`;
    
    const command = `${path.join(__dirname, binPath)}cwebp -q 80 ${sourceFile} -o ${targetFile}`;
    const percentDone = Math.round(i / files.length * 100);
    console.log(`:==> (${percentDone}%) ${sourceFile.substring(sourceFile.lastIndexOf('/') + 1)} --> ${targetFile.substring(sourceFile.lastIndexOf('/') + 1)}`);
    const result = await execCommand(command);
    const { error } = result;
    if (error) {
      console.log(`==> error: ${error}`);
      return;
    }
    else{
      // progressBar.update(i / files.length * 100, { filename: sourceFile });
      pngFilesCompleted[sourceFile] = true;
      rmSync(sourceFile);
    }
  }
  return progressBar.stop();
}

export const extractZips = () => {
  getSetBundles().forEach(fileinfo => {
    const { name } = fileinfo;
    const zipExtractPath = path.join(__dirname, dataPath, name);
    const zipFilePath = path.join(__dirname, zipPath, name);
    console.info(`:==> opening zip file ${zipFilePath}...`);
    const zipFile = `${zipFilePath}.zip`;
    const zip = new AdmZip(zipFile);

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
    console.info(`| extraction complete!`);
  });
}
