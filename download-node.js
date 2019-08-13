const fs = require('fs-extra');
const download = require('download');
const chmod = require('chmod');

const version = 'v1.2.4';
const gitrev = '959bc98';

let dir = 'extra/win32/x64';
if (!fs.existsSync(dir)){
    fs.ensureDirSync(dir);
}
console.log('download win32 x64 binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlc-'+version+'-'+gitrev+'-windows-6.0-amd64.exe').then(data => {
    fs.writeFileSync('extra/win32/x64/gqlc.exe', data);
});

console.log('download win32 x64 test binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlct-'+version+'-'+gitrev+'-windows-6.0-amd64.exe').then(data => {
    fs.writeFileSync('extra/win32/x64/gqlct.exe', data);
});

// add chmod
dir = 'extra/darwin/x64/';
if (!fs.existsSync(dir)){
    fs.ensureDirSync(dir);
}
console.log('download macOS x64 binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlc-'+version+'-'+gitrev+'-darwin-10.10-amd64').then(data => {
    fs.writeFileSync('extra/darwin/x64/gqlc', data);
    chmod('extra/darwin/x64/gqlc',700);
});

console.log('download macOS x64 binary test binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlct-'+version+'-'+gitrev+'-darwin-10.10-amd64').then(data => {
    fs.writeFileSync('extra/darwin/x64/gqlct', data);
    chmod('extra/darwin/x64/gqlct',700);
});


// add chmod
dir = 'extra/linux/x64/';
if (!fs.existsSync(dir)){
    fs.ensureDirSync(dir);
}
console.log('download linux x64 binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlc-'+version+'-'+gitrev+'-linux-amd64').then(data => {
    fs.writeFileSync('extra/linux/x64/gqlc', data);
    chmod('extra/linux/x64/gqlc',700);
});

console.log('download linux x64 binary test binary');
download('https://github.com/qlcchain/go-qlc/releases/download/'+version+'/gqlct-'+version+'-'+gitrev+'-linux-amd64').then(data => {
    fs.writeFileSync('extra/linux/x64/gqlct', data);
    chmod('extra/linux/x64/gqlct',700);
});
