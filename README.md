# Radio Scrobbler
This is a Node.js service that scrobbles a radio station's playlist to Last.fm.

## Usage
The scrobbler can be run as a service using [PM2](https://pm2.keymetrics.io/):
```shell 
$ npm install pm2 -g
$ pm2 start ./index.js -n scrobbler
```

You must create a Last.fm account for your radio station and obtain an [API key](https://www.last.fm/api/authentication).

Create `config.json` from template and add these details:
```shell 
$ cp config.template.json config.json
```

Finally, you need to update the song data. The file should use the template in `./metadata/`, and specified in `config.json`. When this file is updated, it will trigger a scrobble.

Myriad users can use the Myriad template. Set the template as the source file for OCP, and specify the output file in `config.json`.
