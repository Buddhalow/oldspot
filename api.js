var path = require('path');
var fs = require('fs');
var async = require('async');
var less = require('less');
var request = require('request');
var url = require('url');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var utils = require('./utils');
var express =require('express');
var app = express();
var ogs = require('open-graph-scraper');
var xml2js = require('xml2js');

var AppFinder = require('./appfinder');
var appFinder = new AppFinder();
var os = require('os')
var spotify_api_key_file = os.homedir() + '/.bungalow/spotify.key.json';
var spotify_cache_file = os.homedir() + '/.bungalow/spotify.cache.json';
var spotify_sessions_file = os.homedir() + '/.bungalow/spotify.sessions.json';
var google_api_key_file = os.homedir() + '/.bungalow/google.key.json';

var googleApiKeyFile = os.homedir() + '/.bungalow/google.key.json';

let credentialsFile = os.homedir() + '/.bungalow/credentials.json'

let credentials = JSON.parse(fs.readFileSync(credentialsFile))

var temp_dir = os.homedir() + '/.bungalow';

var app = express();

module.exports = function (server) {
  app.get('/lookup', function (req, res) {
    var uri = req.query.uri;
    ogs({
      url: uri
    }, function (err, results) {
      if (err) {
        res.status(500).json(err).end();
      }
      var data = results.data;
      var object = {
        slug: '',
        name: data.ogTitle,
        type: data.ogType,
        url: data.ogUrl,
        uri: data.ogUrl,

        image_url: data.ogImage.url,
        images: [{
          url: data.ogImage
        }],
        description: data.ogDescription
      };
      res.json(object).end();
    })

  });

  app.get('/app', function (req, res) {
   let apps = appFinder.getApps();
   res.json({
     objects: apps
   });
  })


  app.get('/theme', function (req, res) {
    var dirs = fs.readdirSync(__dirname + path.sep + 'client' + path.sep + 'themes');
    var apps = []
    dirs.forEach(function (appId) {
      if (appId.indexOf('.') == 0) return
      var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'client' + path.sep + 'themes' + path.sep + appId + path.sep + 'manifest.json'));
      apps.push(manifest);
    });
    res.json({
      objects: apps
    });
  })

  app.get('/plugin', function (req, res) {
    var dirs = fs.readdirSync(__dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'plugins');
    var apps = []
    dirs.forEach(function (appId) {
      if (appId.indexOf('.') == 0) return
      var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'plugins' + path.sep + appId + path.sep + 'manifest.json'));
      apps.push(manifest);
    });
    res.json({
      objects: apps
    });
  })

    app.get('/concept', function (req, res) {
        var dirs = fs.readdirSync(__dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'concepts');
        var apps = []
        dirs.forEach(function (appId) {
            if (appId.indexOf('.') == 0) return
            var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'client' + path.sep + 'js' + path.sep + 'concepts' + path.sep + appId + path.sep + 'manifest.json'));
            apps.push(manifest);
        });
        res.json({
            objects: apps
        });
    })

  function getServices() {
      var dirs = fs.readdirSync(__dirname + path.sep + 'services');
    var apps = []
    dirs.forEach(function (appId) {
      console.log(appId);
      var manifest = JSON.parse(fs.readFileSync(__dirname + path.sep + 'services' + path.sep + appId + path.sep + 'package.json'));
      try {
      if ('bungalow' in manifest)
        apps.push(manifest.bungalow);
      } catch (e) {
        console.log(e.stack);
      }
    });
    return (apps);
  }

  app.get('/xspf', function (req, res) {
      var url = req.query.url;
      request(url, function (err, response, body) {
          if (err) {
              res.status(500).json(err).send();
              return;
          }
          xml2js.parseString(body, function (error, result) {
              if (error) {
                  res.status(500).json(error).send();
                  return;
              }
              res.json({
                  id: '',
                  name: '',
                  objects: result.playlist.trackList[0].track.map(function (track) {
                      return {
                          id: 'music:artist:' + encodeURIComponent(track.creator) + ':release:' + encodeURIComponent(track.release) + ':track:' + encodeURIComponent(track.title),
                          name: track.title,
                          artists: [{
                              name: track.creator,
                              uri: 'music:artist:' + track.creator
                          }],
                          release: {
                              id: '',
                              name: track.album,
                              uri: 'music:artist:' + track.creator + ':release:' + track.release
                          },
                          uri: 'music:artist:' + encodeURIComponent(track.creator) + ':release:' + encodeURIComponent(track.release) + ':track:' + encodeURIComponent(track.title)
                      }
                  })
              });
          })
      })
  })

  app.get('/service', function (req, res) {
    res.json({
        objects: getServices()
    })
  });

  var services = getServices();

  // Load Services
  services.map(function (serviceInfo) {
      console.log(serviceInfo.id);
      console.log(serviceInfo);
      var ServiceClass = require(__dirname + path.sep + 'services' + path.sep + serviceInfo.id + path.sep + 'index.js');
      console.log(ServiceClass)
     if (ServiceClass) {
        let service = new ServiceClass(credentials[serviceInfo.id])
        let router = service.createServer()
        console.log(router)
        if (!!router) {
          app.use('/' + serviceInfo.id, router);
        }
      }

  })


  app.use(cookieParser());
  app.use(cookieSession({
      secret:'32425235235235',
      name: 'session',
      keys: ['key1', 'key2'],
      cookie: {secure: false}
  }));

  return {
      app: app
  }
}