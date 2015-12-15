/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var _ = require('../node_modules/underscore/underscore.js');
var fs = require('fs');
var url = require('url');
var messagesData = [];
var messagesURL = '/classes/';
// var logURL = '/classes/messages';
var nextObjectId = 0;
var room1URL = '/classes/room1';
//has only one key: results
//             val: an array of objects of the following form:
// {
//     "createdAt":"2015-12-14T22:24:12.224Z", //what time we received the POST request for that message
//     "objectId":"kOUTA3rBsc",
//     "opponents":{"__type":"Relation","className":"Player"},
//     "roomname":"4chan",
//     "text":"trololo",
//     "updatedAt":"2015-12-14T22:24:12.224Z",
//     "username":"shawndrost"
// }
var contentTypes = {
  'js': 'application/javascript',
  'css': 'text/css',
  'html': 'text/html',
  'json': 'application/json',
}


var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  // var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  //headers['Content-Type'] = "application/json";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  //response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // if(request.url === logURL){
  //   response.writeHead(statusCode,headers);
  //   response.end('');
  //   return
  // }

  // ---------------- serve static files ----------------
  //if url is one of the below,
          //index.html (or empty url)
          //styles/styles.css
          //"bower_components/jquery/dist/jquery.js"
          //"bower_components/underscore/underscore.js"
          //"env/config.js"
          // "scripts/app.js"
  var parsedURL = url.parse(request.url,true);
  var pathName = parsedURL.pathname;
  var queryString = parsedURL.query;

  if(pathName === '/' ||
    pathName === '/index.html'|| // and also for this one
    pathName === '/styles/styles.css'||
    pathName === '/bower_components/jquery/dist/jquery.js'||
    pathName === '/bower_components/underscore/underscore.js'||
    pathName === '/env/config.js'||
    pathName === '/scripts/app.js'){
    
    var extension = pathName.substring(pathName.lastIndexOf('.') + 1);

    pathName = pathName === '/' ? '/index.html' : pathName;
    //read the file on hard drive via fs module
    var fileName = '../client' + pathName;
    fs.readFile(fileName,function(err, data){
      if (err) throw err;
      headers['Content-Type'] = contentTypes[extension];
      response.writeHead(200, headers);
      response.end(data);
    });
    //return entire file's html as response body
    //status code: 200
  }

  //else [do all the endpoint url checking, below]

  // ---------------- serve messages as endpoint ----------------
  //if request.url is [our url]
  else if(request.url.substring(0, messagesURL.length) === messagesURL){
    var roomName = request.url.substring(messagesURL.length);
    //if request method is GET
    if(request.method.toUpperCase() === "GET"){
      //response.end(the messages as json)
      headers['Content-Type'] = "application/json";
      response.writeHead(200, headers);
      var filteredData = _.filter(messagesData, function(message){
        return (message.roomname === roomName);
      });
      response.end(JSON.stringify({results:filteredData})); // should filler by room name
    }
    //else if request method is POST
    else if(request.method.toUpperCase() === "POST"){
      request.on('data', function(data){
        //process request to save it to our messages:
        var message = JSON.parse(data);
        //add createdAt, updatedAt, objectId, and opponents to the data
        var dateString = JSON.stringify(new Date());
        message.createdAt = dateString;
        message.updatedAt = dateString;
        message.objectId = nextObjectId++;
        message.opponents = {"__type":"Relation","className":"Player"};
        message.roomname = roomName;
        //push to data.results
        messagesData.unshift(message);
        //response.end('')
        response.writeHead(201,headers);
        //respond with createdAt and objectId
        response.end(JSON.stringify({createdAt: dateString, objectId: message.objectId}));
      });
    }
    //else if options is OPTIONS
    else if (request.method.toUpperCase()==='OPTIONS'){
      //response.end('')
      response.writeHead(200, headers);
      response.end();
    }
  }
  //(else do nothing)
  else{
    response.writeHead(404, headers);
    response.end();
  }
  //response.end("Hello, World!");
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept, x-parse-application-id, x-parse-rest-api-key",
  "access-control-max-age": 10 // Seconds.
};

module.exports.requestHandler = requestHandler;