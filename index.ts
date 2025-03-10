import {  consolidateDataFiles, convertAllPngsToWebp, downloadMissingCardSetBundles, extractZips, findAllJsonAssets, findAllPngAssets, folderTree } from './actions';
import { dataPath } from './config';
const { argv } = process;

const main = async () => {
  console.log(':==> Downloading all missing card set bundles.');
  await downloadMissingCardSetBundles();
  
  console.log(':==> Extracting all card set bundles.');
  extractZips();

  console.log(':==> converting all pngs to webp.');
  await convertAllPngsToWebp();

  console.log(':==> consolidating data files');
  await consolidateDataFiles();

}
main();

