
export interface ZipEntry {
  name: string;
  set: string;
  url: string;
}

export const sets = [
  'set1',
  'set2',
  'set3',
  'set4',
  'set5',
  'set6',
  'set6cde',
  'set7'
]

export const zipfiles = [
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
    url: 'https://dd.b.pvp.net/latest/set6cde-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set6cde-en_us.zip'
  },
  {
    name: 'set7-lite-en_us',
    url: 'https://dd.b.pvp.net/latest/set7-lite-en_us.zip',
    full: 'https://dd.b.pvp.net/latest/set7-en_us.zip'
  }
  
];