const Lastfm      = require('simple-lastfm'),
      fs          = require('fs'),
      parseString = require('xml2js').parseString,
      config      = require('./config.json');

let _lastfm = new Lastfm({
    api_key   : config.apiKey,
    api_secret: config.apiSecret,
    username  : config.username,
    password  : config.password
});

const _xmlFile = config.fileName;
let _currentTrack  = null,
    _previousTrack = null;

const onXMLParsed = (result) => {
    if (config.debug)
        console.info('[Debug] onXMLParsed()');

    if (!result.hasOwnProperty('track')) {
        console.error('Error: no track found');
        return false;
    }

    if (config.debug)
        console.info(`[Debug] Result: ${result.track.artist[0]} - ${result.track.title[0]}`);

    if (config.debug && _currentTrack)
        console.info(`[Debug] Current: ${_currentTrack.artist[0]} - ${_currentTrack.title[0]}`);

    if (config.debug && _previousTrack)
        console.info(`[Debug] Previous: ${_previousTrack.artist[0]} - ${_previousTrack.title[0]}`);

    if (_currentTrack && result.track.artist[0] == _currentTrack.artist[0] &&
        result.track.title[0] == _currentTrack.title[0]) {
        if (config.debug)
            console.info('[Debug] Skipped song');
        return false;
    }

    _previousTrack = _currentTrack;
    _currentTrack  = result.track;

    if (_previousTrack && _previousTrack.artist[0] && _previousTrack.title[0]) {
        _lastfm.scrobbleTrack({
            artist  : _previousTrack.artist[0],
            track   : _previousTrack.title[0],
            callback: (result) => {
                if (!result.success) {
                    console.error(`Scrobbling error (${_previousTrack.artist[0]} - ${_previousTrack.title[0]}): ${result.error}`);
                    return false;
                }

                console.info(`Scrobbled: ${_previousTrack.artist[0]} - ${_previousTrack.title[0]}`);
            }
        });
    }

    if (_currentTrack.artist[0] && _currentTrack.title[0]) {
        _lastfm.scrobbleNowPlayingTrack({
            artist  : _currentTrack.artist[0],
            track   : _currentTrack.title[0],
            callback: (result) => {
                if (!result.success) {
                    console.error(`Now playing error (${_currentTrack.artist[0]} - ${_currentTrack.title[0]}): ${result.error}`);
                    return false;
                }

                console.info(`Now playing: ${_currentTrack.artist[0]} - ${_currentTrack.title[0]}`);
            }
        });
    }
};

const onFileRead = (xml) => {
    if (config.debug)
        console.info('[Debug] onFileRead()');

    parseString(xml, (err, result) => {
        if (err) {
            console.error(`XML parse error: ${err.message}`);
            return false;
        }

        onXMLParsed(result);
    });
}

const onFileModified = (fileName) => {
    if (config.debug)
        console.info('[Debug] onFileModified()');

    fs.readFile(fileName, 'utf8', (err, xml) => {
        if (err) {
            console.error(`File read error: ${err.message}`);
            return false;
        }

        onFileRead(xml);
    });
};

_lastfm.getSessionKey((result) => {
    if (config.debug)
        console.debug('[Debug] _lastfm.getSessionKey()');

    if (!result.success) {
        console.error(`Failed to get session key: ${result.error}`);
        return false;
    }

    console.info(`Got session key: ${result.session_key}`);

    fs.watchFile(_xmlFile, (curr, prev) => {
        onFileModified(_xmlFile);
    });
});