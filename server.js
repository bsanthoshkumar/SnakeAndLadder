const { Server } = require('net');
const { readFileSync } = require('fs');
let count = 0;

const badRequestResponse = () => {
  return [`HTTP/1.0 400 File Not Found`, 'Content-Type: text/html', `Content-Length: 0`, '', ''].join('\n');
};

const response = fileDetails => {
  const { fileType, fileName } = fileDetails;
  let content;
  try {
    content = readFileSync(fileName);
  } catch (e) {
    return [badRequestResponse()];
  }
  return [ `HTTP/1.0 200 ok\n`, `Content-Type: ${fileType}\n`, `Content-Length: ${content.length + 1}\n`, '\n', content, '\n' ];
};

const getFileDetails = resource => {
  const contentTypes = { css: 'text/css', js: 'text/javascript', png: 'image/png', jpeg: 'image/jpeg' };
  const extension = resource.split('.')[2];
  const fileType = contentTypes[extension];
  const fileName = resource == '/' ? './index.html' : `.${resource}`;
  return { fileType, fileName };
};

const getResponse = function(headers, method, resource) {
  if (method == 'GET') return response(getFileDetails(resource));
  return [badRequestResponse()];
};

const loadGame = function(socket) {
  count++;
  const remote = { address: socket.remoteAddress, port: socket.remotePort };
  console.log('new Connection', remote);
  socket.setEncoding('utf8');
  socket.on('data', text => {
    console.warn(remote, '\ndata:\n', text);
    const [requestLine, ...headers] = text.split('\n');
    const [method, resource, protocal] = requestLine.split(' ');
    const responses = getResponse(headers, method, resource);
    responses.forEach(res => socket.write(res));
  });
  socket.on('end', () => console.warn(remote, 'ended'));
  socket.on('close', () => console.warn(remote, 'closed\n',`connection no :${co}`));
};

const main = function() {
  const server = new Server();
  server.on('listening', () => console.warn('started listening', server.address()));
  server.on('connection', loadGame);
  server.listen(3000);
};

main();
