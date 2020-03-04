/* eslint-disable */
const TikTokScraper = require('./lib/instance');
const TikTokScraperStatic = require('./lib/index');

const INIT_OPTIONS = {
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

const startScraper = async options => {
    if (!options.filetype) {
        options.filetype = INIT_OPTIONS.filetype;
    }

    if (!parseInt(options.number, 10)) {
        options.number = INIT_OPTIONS.number;
    }

    if (!options.asyncDownload) {
        options.asyncDownload = INIT_OPTIONS.asyncDownload;
    }

    try {
        return await TikTokScraper(options).scrape();
    } catch (error) {
        throw new Error(error);
    }
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
    }
    return new Promise(async (resolve, reject) => {
        try {
            return resolve(await startScraper(options));
        } catch (error) {
            return reject(error);
        }
    });
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
    }
    return new Promise(async (resolve, reject) => {
        try {
            return resolve(await startScraper(options));
        } catch (error) {
            return reject(error);
        }
    });
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
    }
    return new Promise(async (resolve, reject) => {
        try {
            return resolve(await startScraper(options));
        } catch (error) {
            return reject(error);
        }
    });
};

exports.music = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);
    options.type = 'music';
    options.input = id;
    if (options.event) {
        return TikTokScraper(options);
    }
    return new Promise(async (resolve, reject) => {
        try {
            return resolve(await startScraper(options));
        } catch (error) {
            return reject(error);
        }
    });
};

exports.getUserProfileInfo = input => TikTokScraperStatic.getUserProfileInfo(input);

exports.getHashtagInfo = input => TikTokScraperStatic.getHashtagInfo(input);
