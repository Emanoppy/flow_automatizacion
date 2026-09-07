const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function buildZip(sourceDir, folderName) {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(sourceDir, '..', `${folderName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(zipPath));
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, folderName);
    archive.finalize();
  });
}

module.exports = { buildZip };
