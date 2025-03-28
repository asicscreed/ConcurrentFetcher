import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as minimist from 'minimist';
import * as url from "url";
//const argv = minimist(process.argv.slice(2));
const argv = process.argv.slice(2);
let server;
let dirs;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//console.log('__filename: ', __filename);
//console.log('__dirname: ', __dirname);


function listDirs(root) {
  const files = fs.readdirSync(root);
  const dirs = [];

  for (let i = 0, l = files.length; i < l; i++) {
    const file = files[i];
    if (file[0] !== '.') {
//console.log('browsing: ', file);
      const stat = fs.statSync(path.join(root, file));
      if (stat.isDirectory()) {
        dirs.push(file);
      }
    }
  }

  return dirs;
}

function getIndexTemplate() {
  const links = dirs.map(function (dir) {
//console.log('getIndexTemplate: ', dir);
    const url = '/' + dir;
    return '<li onclick="document.location=\'' + url + '\'"><a href="' + url + '">' + url + '</a></li>';
  });

  return (
    '<!doctype html>' +
    '<html>' +
    '<head>' +
    '<title>concurrentfetcher examples</title>' +
    '<style>' +
    'body {padding:25px;}' +
    'ul {margin:0; padding:0; list-style:none;}' +
    'li {padding:5px 10px;}' +
    'li:hover {background:#eee; cursor:pointer;}' +
    'a {text-decoration:none; color:#0080ff;}' +
    '</style>' +
    '<body>' +
    '<ul>' +
    links.join('') +
    '</ul>'
  );
}

function sendResponse(res, statusCode, body) {
  res.writeHead(statusCode);
  res.write(body);
  res.end();
}

function send200(res, body) {
  sendResponse(res, 200, body || '<h1>OK</h1>');
}

function send404(res, body) {
  sendResponse(res, 404, body || '<h1>Not Found</h1>');
}

function pipeFileToResponse(res, file, type) {
//console.log('pipeFileToResponse: ', path.join(__dirname, file));
  if (type) {
    res.writeHead(200, {
      'Content-Type': type
    });
  }
  fs.createReadStream(path.join(__dirname, file)).pipe(res);
}


dirs = listDirs(__dirname);
//console.log('dirs: ', dirs);

server = http.createServer(function (req, res) {
//console.log('req.url: ', req.url);
  let url = req.url;

  // Process concurrentfetcher itself
  if (/concurrentfetcher\.umd\.min\.js$/.test(url)) {
    pipeFileToResponse(res, '../../dist/concurrentfetcher.umd.min.js', 'text/javascript');
    return;
  }
  if (/concurrentfetcher\.umd\.js$/.test(url)) {
    pipeFileToResponse(res, '../../dist/concurrentfetcher.umd.js', 'text/javascript');
    return;
  }
  //if (/concurrentfetcher\.umd\.min\.map$/.test(url)) {
  //  pipeFileToResponse(res, '../dist/concurrentfetcher.umd.min.map', 'text/javascript');
  //  return;
  //}
  if (/concurrentfetcher\.amd\.min\.js$/.test(url)) {
    pipeFileToResponse(res, '../../dist/concurrentfetcher.amd.min.js', 'text/javascript');
    return;
  }
  if (/concurrentfetcher\.amd\.js$/.test(url)) {
    pipeFileToResponse(res, '../../dist/concurrentfetcher.amd.js', 'text/javascript');
    return;
  }
  //if (/concurrentfetcher\.amd\.min\.map$/.test(url)) {
  //  pipeFileToResponse(res, '../dist/concurrentfetcher.amd.min.map', 'text/javascript');
  //  return;
  //}

  // Browser request for favicon.ico 
  if (/favicon\.ico$/.test(url)) {
    return;
  }

  // Process /
  if (url === '/' || url === '/index.html') {
    send200(res, getIndexTemplate());
    return;
  }

  // Format request */ -> */index.html
  if (/\/$/.test(url)) {
    url += 'index.html';
  }

  // Format request /get -> /get/index.html
  const parts = url.split('/');
  if (dirs.indexOf(parts[parts.length - 1]) > -1) {
    url += '/index.html';
  }

//console.log('server:: ', path.join(__dirname, url + '.mjs'));

  // Process index.html request
  if (/index\.html$/.test(url)) {
    if (fs.existsSync(path.join(__dirname, url))) {
      pipeFileToResponse(res, url, 'text/html');
    } else {
      send404(res);
    }
  }

  // Process server request
  else if (new RegExp('(' + dirs.join('|') + ')\/server').test(url)) {
    if (fs.existsSync(path.join(__dirname, url + '.mjs'))) {
      import('file://' + path.join(__dirname, url + '.mjs')).then((server) => {
        server.default(req, res);
      });
    } else {
      send404(res);
    }
  }
  else {
    send404(res);
  }
});

const PORT = argv.p || 3000;

server.listen(PORT, () => {
  console.log(`Examples running on ${PORT}`);
});
