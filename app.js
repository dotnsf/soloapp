// app.js

var cfenv = require( 'cfenv' );
var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var multer = require( 'multer' );
var crypto = require( 'crypto' );
var request = require( 'request' );
var app = express();

var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './tmp/' } ) );
app.use( express.static( __dirname + '/public' ) );
//app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
app.use( bodyParser.urlencoded() );
app.use( bodyParser.json() );

app.all( '/', basicAuth( function( user, pass ){
  return( user === settings.basic_username && pass === settings.basic_password );
}));

app.post( '/add', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'POST /add' );

  var filepath = req.file.path;
  var filetype = req.file.mimetype;
  var ext = filetype.split( "/" )[1];
  var name = req.body.name;

  if( name && filepath ){
    var bin = fs.readFileSync( filepath );
    var bin64 = new Buffer( bin ).toString( 'base64' );
    var params = {
      name: name,
      _attachments: {
        file: {
          content_type: filetype,
          data: bin64
        }
      }
    };

    var options1 = {
      url: settings.solo_api_url + '/doc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      json: params
    };
    request( options1, ( err1, res1, body1 ) => {
      if( err1 ){
        console.log( err1 );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err1 }, 2, null ) );
        res.end();
      }else{
        console.log( body1 );
        res.write( JSON.stringify( { status: true, message: body1 }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'No name or No file' }, 2, null ) );
    res.end();
  }
});

app.get( '/doc/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  console.log( 'GET /doc/' + id );
  if( id ){
    var options1 = {
      url: settings.solo_api_url + '/doc/' + id,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    request( options1, ( err1, res1, body1 ) => {
      if( err1 ){
        console.log( err1 );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err1 }, 2, null ) );
        res.end();
      }else{
        console.log( body1 );
        res.write( JSON.stringify( { status: true, message: body1 }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'Parameter id needed in request path: /doc/:id' }, 2, null ) );
    res.end();
  }
});

app.get( '/doc/:id/attachment', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  console.log( 'GET /doc/' + id + '/attachment' );
  if( id ){
    //. https://(cloudant.cloudant.com)/(dbname)/(docid)/(attachmentname)

  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'Parameter id needed in request path: /doc/:id' }, 2, null ) );
    res.end();
  }
});

app.get( '/docs', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'GET /docs' );

  var options1 = {
    url: settings.solo_api_url + '/docs',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  request( options1, ( err1, res1, body1 ) => {
    if( err1 ){
      console.log( err1 );
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: err1 }, 2, null ) );
      res.end();
    }else{
      console.log( body1 );
      res.write( JSON.stringify( { status: true, message: body1 }, 2, null ) );
      res.end();
    }
  });
});

/*
 You need to create search index 'design/search' with name 'newSearch' in your Cloudant DB before executing this API.
 */
app.get( '/search', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'GET /search' );

  var q = req.query.q;
  if( q ){
    var options1 = {
      url: settings.solo_api_url + '/search?q=' + q,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    request( options1, ( err1, res1, body1 ) => {
      if( err1 ){
        console.log( err1 );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err1 }, 2, null ) );
        res.end();
      }else{
        console.log( body1 );
        res.write( JSON.stringify( { status: true, message: body1 }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter: q is required.' }, 2, null ) );
    res.end();
  }
});


app.post( '/reset', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'POST /reset' );

  var options1 = {
    url: settings.solo_api_url + '/reset',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  request( options1, ( err1, res1, body1 ) => {
    if( err1 ){
      console.log( err1 );
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: err1 }, 2, null ) );
      res.end();
    }else{
      console.log( body1 );
      res.write( JSON.stringify( { status: true, message: body1 }, 2, null ) );
      res.end();
    }
  });
});


var port = appEnv.port || settings.app_port || 3001;
app.listen( port );
console.log( 'server started on ' + port );
