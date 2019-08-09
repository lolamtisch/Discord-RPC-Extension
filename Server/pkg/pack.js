const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '../../dist');

var archive = archiver('zip', {
  zlib: { level: 9 }
});

archive.pipe(fs.createWriteStream(path.join(dist, '/windows_64bit.zip')));
archive.file(path.join(dist, 'server_win_64bit.exe'), { name: 'server_win.exe' });
archive.file(path.join(__dirname, 'startup_windows.bat'), { name: 'startup_windows.bat' });
archive.finalize();

archive = archiver('zip', {
  zlib: { level: 9 }
});

archive.pipe(fs.createWriteStream(path.join(dist, '/windows_32bit.zip')));
archive.file(path.join(dist, 'server_win_32bit.exe'), { name: 'server_win.exe' });
archive.file(path.join(__dirname, 'startup_windows.bat'), { name: 'startup_windows.bat' });
archive.finalize();
