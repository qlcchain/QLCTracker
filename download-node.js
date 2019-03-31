const fs = require('fs-extra');
const download = require('download');
const chmod = require('chmod');

const version = 'v1.0.4';
const gitrev = '3a4ae9c';

let dir = 'extra/win32/x64';
if (!fs.existsSync(dir)){
    fs.ensureDirSync(dir);
}
console.log('download win32 x64 binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlc-windows-amd64-'+version+'-'+gitrev+'.exe').then(data => {
    fs.writeFileSync('extra/win32/x64/gqlc.exe', data);
});

console.log('download win32 x64 test binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlct-windows-amd64-'+version+'-'+gitrev+'.exe').then(data => {
    fs.writeFileSync('extra/win32/x64/gqlct.exe', data);
});

// add chmod
dir = 'extra/darwin/x64/';
if (!fs.existsSync(dir)){
    fs.ensureDirSync(dir);
}
console.log('download macOS x64 binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlc-darwin-amd64-'+version+'-'+gitrev).then(data => {
    fs.writeFileSync('extra/darwin/x64/gqlc', data);
    chmod('extra/darwin/x64/gqlc',700);
});

console.log('download macOS x64 binary test binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlct-darwin-amd64-'+version+'-'+gitrev).then(data => {
    fs.writeFileSync('extra/darwin/x64/gqlct', data);
    chmod('extra/darwin/x64/gqlct',700);
});


// add chmod
dir = 'extra/linux/x64/';
if (!fs.existsSync(dir)){
    fs.ensureDirSync(dir);
}
console.log('download linux x64 binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlc-linux-amd64-'+version+'-'+gitrev).then(data => {
    fs.writeFileSync('extra/linux/x64/gqlc', data);
    chmod('extra/linux/x64/gqlc',700);
});

console.log('download linux x64 binary test binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlct-linux-amd64-'+version+'-'+gitrev).then(data => {
    fs.writeFileSync('extra/linux/x64/gqlct', data);
    chmod('extra/linux/x64/gqlct',700);
});
