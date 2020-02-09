'use strict';

const os = require('os');

const TikTokScraper = require('./lib/instance');

let INIT_OPTIONS = {
    count: 0,
    number: 20,
    timeout: 0,
    download: false,
    asyncDownload: 5,
    proxy: '',
    filepath: process.cwd(),
    filetype: 'na',
    progress: false,
};

const startScraper = options => {
    return new Promise(async (resolve, reject) => {
        if (!options.filetype) {
            options.filetype = INIT_OPTIONS.filetype;
        }

        if (!parseInt(options.number)) {
            options.number = INIT_OPTIONS.number;
        }

        if (!options.asyncDownload) {
            options.asyncDownload = INIT_OPTIONS.asyncDownload;
        }

        try {
            return resolve(await TikTokScraper(options)._scrape());
        } catch (error) {
            return reject(error);
        }
    });
};

exports.user = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.type = 'user';
    options.input = id;
    if (options.event) {
        return TikTokScraper(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.hashtag = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);
    options.type = 'hashtag';
    options.input = id;
    if (options.event) {
        return TikTokScraper(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.trend = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);
    options.type = 'trend';
    options.input = id;
    if (options.event) {
        return TikTokScraper(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};
