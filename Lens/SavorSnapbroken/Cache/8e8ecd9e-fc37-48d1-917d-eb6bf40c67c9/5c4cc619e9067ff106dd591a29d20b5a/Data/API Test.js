// main.js
//@input Asset.RemoteServiceModule remoteServiceModule 

function onHttpRequestEnd(response) {
  print('Request response received');
  print('Status code: ' + response.statusCode);
  print('Content type: ' + response.contentType);
  print('Body: ' + response.body);
  print('Headers: ' + response.headers);
}

function makeApiCall() {
  var httpRequest = RemoteServiceHttpRequest.create();
  httpRequest.url = 'https://api.savorsnap.one/';
  httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
  // Add headers if needed:
  // httpRequest.setHeader('Content-Type', 'application/json');
  // httpRequest.setHeader('Authorization', 'Bearer your_api_token');

  script.remoteServiceModule.performHttpRequest(httpRequest, onHttpRequestEnd);
}

// Trigger the API call when the Lens starts:
script.createEvent("OnStartEvent").bind(makeApiCall);