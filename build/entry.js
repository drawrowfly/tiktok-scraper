"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromfile = exports.history = exports.video = exports.getVideoMeta = exports.signUrl = exports.getUserProfileInfo = exports.getMusicInfo = exports.getHashtagInfo = exports.trendEvent = exports.musicEvent = exports.userEvent = exports.hashtagEvent = exports.music = exports.trend = exports.user = exports.hashtag = void 0;
const os_1 = require("os");
const fs_1 = require("fs");
const bluebird_1 = require("bluebird");
const async_1 = require("async");
const core_1 = require("./core");
const constant_1 = __importDefault(require("./constant"));
const helpers_1 = require("./helpers");
const getInitOptions = () => {
    return {
        number: 30,
        since: 0,
        download: false,
        zip: false,
        asyncDownload: 5,
        asyncScraping: 3,
        proxy: '',
        filepath: '',
        filetype: 'na',
        progress: false,
        event: false,
        by_user_id: false,
        noWaterMark: false,
        hdVideo: false,
        timeout: 0,
        tac: '',
        signature: '',
        verifyFp: helpers_1.makeVerifyFp(),
        headers: {
            'user-agent': constant_1.default.userAgent(),
            referer: 'https://www.tiktok.com/',
        },
    };
};
const proxyFromFile = async (file) => {
    try {
        const data = (await bluebird_1.fromCallback(cb => fs_1.readFile(file, { encoding: 'utf-8' }, cb)));
        const proxyList = data.split('\n');
        if (!proxyList.length) {
            throw new Error('Proxy file is empty');
        }
        return proxyList;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
const sessionFromFile = async (file) => {
    try {
        const data = (await bluebird_1.fromCallback(cb => fs_1.readFile(file, { encoding: 'utf-8' }, cb)));
        const proxyList = data.split('\n');
        if (!proxyList.length || proxyList[0] === '') {
            throw new Error('Session file is empty');
        }
        return proxyList;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
const promiseScraper = async (input, type, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const constructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type, input });
    const scraper = new core_1.TikTokScraper(constructor);
    const result = await scraper.scrape();
    return result;
};
const eventScraper = (input, type, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type, input, event: true });
    return new core_1.TikTokScraper(contructor);
};
exports.hashtag = async (input, options) => promiseScraper(input, 'hashtag', options);
exports.user = async (input, options) => promiseScraper(input, 'user', options);
exports.trend = async (input, options) => promiseScraper(input, 'trend', options);
exports.music = async (input, options) => promiseScraper(input, 'music', options);
exports.hashtagEvent = (input, options) => eventScraper(input, 'hashtag', options);
exports.userEvent = (input, options) => eventScraper(input, 'user', options);
exports.musicEvent = (input, options) => eventScraper(input, 'music', options);
exports.trendEvent = (input, options) => eventScraper(input, 'trend', options);
exports.getHashtagInfo = async (input, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type: 'signle_hashtag', input });
    const scraper = new core_1.TikTokScraper(contructor);
    const result = await scraper.getHashtagInfo();
    return result;
};
exports.getMusicInfo = async (input, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type: 'single_music', input });
    const scraper = new core_1.TikTokScraper(contructor);
    const result = await scraper.getMusicInfo();
    return result;
};
exports.getUserProfileInfo = async (input, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type: 'sinsgle_user', input });
    const scraper = new core_1.TikTokScraper(contructor);
    const result = await scraper.getUserProfileInfo();
    return result;
};
exports.signUrl = async (input, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type: 'signature', input });
    const scraper = new core_1.TikTokScraper(contructor);
    const result = await scraper.signUrl();
    return result;
};
exports.getVideoMeta = async (input, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type: 'video_meta', input });
    const scraper = new core_1.TikTokScraper(contructor);
    const fullUrl = /^https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+/.test(input);
    const result = await scraper.getVideoMeta(!fullUrl);
    return {
        headers: Object.assign(Object.assign({}, scraper.headers), { cookie: scraper.cookieJar.getCookieString('https://tiktok.com') }),
        collector: [result],
    };
};
exports.video = async (input, options = {}) => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const contructor = Object.assign(Object.assign(Object.assign({}, getInitOptions()), options), { type: 'video', input });
    const scraper = new core_1.TikTokScraper(contructor);
    const result = await scraper.getVideoMeta();
    const path = (options === null || options === void 0 ? void 0 : options.filepath) ? `${options === null || options === void 0 ? void 0 : options.filepath}/${result.id}` : result.id;
    let outputMessage = {};
    if (options === null || options === void 0 ? void 0 : options.download) {
        try {
            await scraper.Downloader.downloadSingleVideo(result);
        }
        catch (_a) {
            throw new Error('Unable to download the video');
        }
    }
    if (options === null || options === void 0 ? void 0 : options.filetype) {
        await scraper.saveMetadata({ json: `${path}.json`, csv: `${path}.csv` });
        outputMessage = Object.assign(Object.assign(Object.assign({}, ((options === null || options === void 0 ? void 0 : options.filetype) === 'all' ? { json: `${path}.json`, csv: `${path}.csv` } : {})), ((options === null || options === void 0 ? void 0 : options.filetype) === 'json' ? { json: `${path}.json` } : {})), ((options === null || options === void 0 ? void 0 : options.filetype) === 'csv' ? { csv: `${path}.csv` } : {}));
    }
    return Object.assign(Object.assign({}, ((options === null || options === void 0 ? void 0 : options.download) ? { message: `Video location: ${contructor.filepath}/${result.id}.mp4` } : {})), outputMessage);
};
exports.history = async (input, options = {}) => {
    let store;
    const historyPath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : (options === null || options === void 0 ? void 0 : options.historyPath) || os_1.tmpdir();
    try {
        store = (await bluebird_1.fromCallback(cb => fs_1.readFile(`${historyPath}/tiktok_history.json`, { encoding: 'utf-8' }, cb)));
    }
    catch (error) {
        throw `History file doesn't exist`;
    }
    const historyStore = JSON.parse(store);
    if (options === null || options === void 0 ? void 0 : options.remove) {
        const split = options.remove.split(':');
        const type = split[0];
        if (type === 'all') {
            const remove = [];
            for (const key of Object.keys(historyStore)) {
                remove.push(bluebird_1.fromCallback(cb => fs_1.unlink(historyStore[key].file_location, cb)));
            }
            remove.push(bluebird_1.fromCallback(cb => fs_1.unlink(`${historyPath}/tiktok_history.json`, cb)));
            await Promise.all(remove);
            return { message: `History was completely removed` };
        }
        const key = type !== 'trend' ? options.remove.replace(':', '_') : 'trend';
        if (historyStore[key]) {
            const historyFile = historyStore[key].file_location;
            await bluebird_1.fromCallback(cb => fs_1.unlink(historyFile, cb));
            delete historyStore[key];
            await bluebird_1.fromCallback(cb => fs_1.writeFile(`${historyPath}/tiktok_history.json`, JSON.stringify(historyStore), cb));
            return { message: `Record ${key} was removed` };
        }
        throw `Can't find record: ${key.split('_').join(' ')}`;
    }
    const table = [];
    for (const key of Object.keys(historyStore)) {
        table.push(historyStore[key]);
    }
    return { table };
};
const batchProcessor = (batch, options = {}) => {
    return new Promise(resolve => {
        console.log('TikTok Bulk Scraping Started');
        const result = [];
        async_1.forEachLimit(batch, options.asyncBulk || 5, async (item) => {
            switch (item.type) {
                case 'user':
                    try {
                        const output = await exports.user(item.input, Object.assign({ bulk: true }, options));
                        result.push({ type: item.type, input: item.input, completed: true, scraped: output.collector.length });
                        console.log(`Scraping completed: ${item.type} ${item.input}`);
                    }
                    catch (error) {
                        result.push({ type: item.type, input: item.input, completed: false });
                        console.log(`Error while scraping: ${item.input}`);
                    }
                    break;
                case 'hashtag':
                    try {
                        const output = await exports.hashtag(item.input, Object.assign({ bulk: true }, options));
                        result.push({ type: item.type, input: item.input, completed: true, scraped: output.collector.length });
                        console.log(`Scraping completed: ${item.type} ${item.input}`);
                    }
                    catch (error) {
                        result.push({ type: item.type, input: item.input, completed: false });
                        console.log(`Error while scraping: ${item.input}`);
                    }
                    break;
                case 'video':
                    try {
                        await exports.video(item.input, options);
                        result.push({ type: item.type, input: item.input, completed: true });
                        console.log(`Scraping completed: ${item.type} ${item.input}`);
                    }
                    catch (error) {
                        result.push({ type: item.type, input: item.input, completed: false });
                        console.log(`Error while scraping: ${item.input}`);
                    }
                    break;
                case 'music':
                    try {
                        const output = await exports.music(item.input, Object.assign({ bulk: true }, options));
                        result.push({ type: item.type, input: item.input, completed: true, scraped: output.collector.length });
                        console.log(`Scraping completed: ${item.type} ${item.input}`);
                    }
                    catch (error) {
                        result.push({ type: item.type, input: item.input, completed: false });
                        console.log(`Error while scraping: ${item.input}`);
                    }
                    break;
                default:
                    break;
            }
        }, () => {
            resolve(result);
        });
    });
};
exports.fromfile = async (input, options = {}) => {
    let inputFile;
    try {
        inputFile = (await bluebird_1.fromCallback(cb => fs_1.readFile(input, { encoding: 'utf-8' }, cb)));
    }
    catch (error) {
        throw `Can't find fle: ${input}`;
    }
    const batch = inputFile
        .split('\n')
        .filter(item => item.indexOf('##') === -1 && item.length)
        .map(item => {
        item = item.replace(/\s/g, '');
        if (item.indexOf('#') > -1) {
            return {
                type: 'hashtag',
                input: item.split('#')[1],
            };
        }
        if (/^https:\/\/(www|v[a-z]{1}|[a-z])+\.(tiktok|tiktokv)\.com\/@?\w.+\/video\/(\d+)(.+)?$/.test(item)) {
            return {
                type: 'video',
                input: item,
            };
        }
        if (item.indexOf('music:') > -1) {
            return {
                type: 'music',
                input: item.split(':')[1],
            };
        }
        if (item.indexOf('id:') > -1) {
            return {
                type: 'user',
                input: item.split(':')[1],
                by_user_id: true,
            };
        }
        if (item.indexOf('@') > -1) {
            item = item.replace(/@/g, '');
        }
        return {
            type: 'user',
            input: item,
        };
    });
    if (!batch.length) {
        throw `File is empty: ${input}`;
    }
    if (options === null || options === void 0 ? void 0 : options.proxyFile) {
        options.proxy = await proxyFromFile(options === null || options === void 0 ? void 0 : options.proxyFile);
    }
    if (options === null || options === void 0 ? void 0 : options.sessionFile) {
        options.sessionList = await sessionFromFile(options === null || options === void 0 ? void 0 : options.sessionFile);
    }
    const result = await batchProcessor(batch, options);
    return { table: result };
};
