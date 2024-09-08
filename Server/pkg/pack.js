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
archive.pipe(fs.createWriteStream(path.join(dist, '/windows_64bit_debug.zip')));
archive.file(path.join(dist, 'server_win_64bit_debug.exe'), { name: 'server_win_debug.exe' });
archive.file(path.join(__dirname, 'startup_windows.bat'), { name: 'startup_windows.bat' });
archive.finalize();

archive = archiver('zip', {
  zlib: { level: 9 }
});
archive.pipe(fs.createWriteStream(path.join(dist, '/linux.zip')));
archive.file(path.join(dist, 'server_linux_debug'), { name: 'server_linux_debug' });
archive.finalize();

archive = archiver('zip', {
  zlib: { level: 9 }
});
archive.pipe(fs.createWriteStream(path.join(dist, '/linux_no_tray.zip')));
archive.file(path.join(dist, 'server_linux_no_tray_debug'), { name: 'server_linux_no_tray_debug' });
archive.finalize();

archive = archiver('zip', {
  zlib: { level: 9 }
});
archive.pipe(fs.createWriteStream(path.join(dist, '/macos.zip')));
archive.file(path.join(dist, 'server_macos_debug'), { name: 'server_macos_debug' });
archive.file(path.join(__dirname, 'startup_macos.sh'), { name: 'start.sh' });
archive.finalize();

archive = archiver('zip', {
  zlib: { level: 9 }
});
archive.pipe(fs.createWriteStream(path.join(dist, '/macos_no_tray.zip')));
archive.file(path.join(dist, 'server_macos_no_tray_debug'), { name: 'server_macos_debug' });
archive.file(path.join(__dirname, 'startup_macos.sh'), { name: 'start.sh' });
archive.finalize();
