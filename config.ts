export const zipPath = 'zips/';
export const imagePath = 'images/';
export const dataPath = 'data/';
export const jsonPath = 'data/_json/';
export const binPath = 'bin/'; // you can place cwebp binary here

export const dataPathForSet = (folder = '', set = 'set1', lang = 'en_us') => `${dataPath}${folder}${set}/${lang}/`;
export const getImagePathForSet = (folder = '', set = 'set1', lang = 'en_us') => `${imagePath}${folder}${set}/${lang}/`;

export interface ZipEntry {
  name: string;
  set: string;
  url: string;
  full?: string;
}

/**
 * Reeturns a list of set bundles for downloading.
 * @see https://developer.riotgames.com/docs/lor#data-dragon_set-bundles
 * @returns {ZipEntry[]} 
 */
export const getSetBundles = (): ZipEntry[] => ([
  {
    name: 'core-en_us',
    set: 'core',
    url: 'https://dd.b.pvp.net/latest/core-en_us.zip',
  },
  {
    name: 'set1-lite-en_us',
    set: 'set1',
    url: 'https://dd.b.pvp.net/latest/set1-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set1-en_us.zip'
  },
  {
    name: 'set2-lite-en_us',
    set: 'set2',
    url: 'https://dd.b.pvp.net/latest/set2-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set2-en_us.zip'
  },
  {
    name: 'set3-lite-en_us',
    set: 'set3',
    url: 'https://dd.b.pvp.net/latest/set3-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set3-en_us.zip'
  },
  {
    name: 'set4-lite-en_us',
    set: 'set4',
    url: 'https://dd.b.pvp.net/latest/set4-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set4-en_us.zip'
  },
  {
    name: 'set5-lite-en_us',
    set: 'set5',
    url: 'https://dd.b.pvp.net/latest/set5-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set5-en_us.zip'
  },
  {
    name: 'set6-lite-en_us',
    set: 'set6',
    url: 'https://dd.b.pvp.net/latest/set6-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set6-en_us.zip'
  },
  {
    name: 'set6cde-lite-en_us',
    set: 'set6cde',
    url: 'https://dd.b.pvp.net/latest/set6cde-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set6cde-en_us.zip'
  },
  {
    name: 'set7-lite-en_us',
    set: 'set7',
    url: 'https://dd.b.pvp.net/latest/set7-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set7-en_us.zip'
  },
  {
    name: 'set7b-lite-en_us',
    set: 'set7b',
    url: 'https://dd.b.pvp.net/latest/set7b-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set7b-en_us.zip'
  },
  {
    name: 'set8-lite-en_us',
    set: 'set8',
    url: 'https://dd.b.pvp.net/latest/set8-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set8-en_us.zip'
  }
]);

