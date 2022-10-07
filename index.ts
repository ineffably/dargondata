import { downloadCardSets, extractZips, convertAllToWebp, removeAllImages } from './actions';

const { argv } = process;
const [nodeExec, file, zipsPath = './zips/', dataPath = './data/'] = argv;

const main = async () => {
  
  await downloadCardSets(zipsPath);

  extractZips(zipsPath, dataPath);
  
  await convertAllToWebp(dataPath);

  removeAllImages(dataPath)

}
main();

