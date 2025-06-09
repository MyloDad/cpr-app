// src/utils/audioUtils.js

export const versionedPath = (filename) => {
  const versionMap = {
    '1': '1_v2',
    '2': '2_v2',
    '3': '3_v2',
    '4': '4_v2',
    '5': '5_v2',
    'charge_monitor': 'charge_monitor',
    'ventilate': 'ventilate',
    'stopCompression': 'stopCompression',
    // ❌ Metronome not versioned here — handled separately
  };

  const mappedName = versionMap[filename] || filename;

  // Only countdown numbers go in /numbers/ subfolder
  const isNumbered = ['1', '2', '3', '4', '5'].includes(filename);

  return isNumbered
    ? `numbers/${mappedName}.mp3`
    : `${mappedName}.mp3`;
};
