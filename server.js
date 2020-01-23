const { Server } = require('net');
const { readFileSync, existsSync, statSync} = require('fs');
let visitorCount = 0;
const STATIC_FOLDER = `${__dirname}/public`
const CONTENT_TYPES = { css: 'text/css', js: 'text/javascript', png: 'image/png', jpeg: 'image/jpeg' };

const collectHeadersAndContent = (result, line) => {
  if (line === '') {
    result.body = '';
    return result;
  }
  if ('body' in result) {
    result.body += line;
    return result;
  }
  const [key, value] = line.split(': ');
  result.headers[key] = value;
  return result;
};

class Request {
  constructor(method, url, headers, body) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
  static parse(requestText) {
    const [requestLine, ...headersAndBody] = requestText.split('\r\n');
    let [method, resource, protocal] = requestLine.split(' ');
    const {headers, body} = headersAndBody.reduce(collectHeadersAndContent,{headers:{}});
    if(resource == "/") resource = "/index.html";
    const request = new Request(method, resource, headers, body);
    return request;
  }
}

class Response {
  constructor() {
    this.statusCode = 404;
    this.headers = [{key:'Content-Length',value:0}]
  }
  setHeader(key ,value) {
    const header = this.headers.find(header=> header.key === key);
    if(header) header.value = value;
    else this.headers.push({key, value})
  }
  generateHeadersText(){
    const lines = this.headers.map(header => `${header.key}: ${header.value}`)
    return lines.join('\r\n')
  }
  writeTo(writable){
    writable.write(`HTTP/1.1 ${this.statusCode}\r\n`);
    writable.write(this.generateHeadersText());
    writable.write('\r\n\r\n');
    this.body && writable.write(this.body);
  }
}

const serveStaticFile = request => {
  const { url } = request;
  const path = `${STATIC_FOLDER}${url}`;
  const stat = existsSync(path) && statSync(path);
  if(!stat || !stat.isFile()) return new Response();
  const extension = url.split('.')[1];
  const contentType = CONTENT_TYPES[extension];
  const content = readFileSync(path);
  const response = new Response();
  response.setHeader('Content-Type',contentType);
  response.setHeader('Content-Length',content.length);
  response.setHeader('Connection','close')
  response.statusCode = 200;
  response.body = content;
  return response;
};

const findHandler = function(request) {
  if (request.method == 'GET') return serveStaticFile;
  return () => new Response();
};

const handleRequest = function(socket) {
  visitorCount++;
  const remote = { address: socket.remoteAddress, port: socket.remotePort };
  console.warn(`\nconnection no :${visitorCount}\n`,'new Connection', remote);
  socket.setEncoding('utf8');
  socket.on('data', text => {
    console.warn(remote, '\ndata:\n', text);
    const request = Request.parse(text);
    const handler = findHandler(request);
    const response = handler(request);
    response.writeTo(socket);
  });
  socket.on('end', () => console.warn(remote, 'ended'));
  socket.on('close', () => console.warn(remote, 'closed\n'));
};

const main = function() {
  const server = new Server();
  server.on('listening', () => console.warn('started listening', server.address()));
  server.on('connection', handleRequest);
  server.listen(3000);
};

main();
