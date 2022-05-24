"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_1 = __importDefault(require("request-promise"));
const os_1 = require("os");
const fs_1 = require("fs");
const json2csv_1 = require("json2csv");
const ora_1 = __importDefault(require("ora"));
const bluebird_1 = require("bluebird");
const events_1 = require("events");
const socks_proxy_agent_1 = require("socks-proxy-agent");
const async_1 = require("async");
const url_1 = require("url");
const constant_1 = __importDefault(require("../constant"));
const helpers_1 = require("../helpers");
const _ = __importStar(require("lodash"));
const HTMLParser = __importStar(require("node-html-parser"));
const core_1 = require("../core");
class TikTokScraper extends events_1.EventEmitter {
    constructor({ download, filepath, filetype, proxy, strictSSL = true, asyncDownload, cli = false, event = false, progress = false, input, number, since, type, by_user_id = false, store_history = false, historyPath = '', noWaterMark = false, useTestEndpoints = false, fileName = '', timeout = 0, bulk = false, zip = false, test = false, hdVideo = false, webHookUrl = '', method = 'POST', headers, verifyFp = '', sessionList = [], }) {
        super();
        this.storeValue = '';
        this.userIdStore = '';
        this.verifyFp = verifyFp;
        this.mainHost = useTestEndpoints ? 'https://t.tiktok.com/' : 'https://m.tiktok.com/';
        this.headers = headers;
        this.download = download;
        this.filepath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '';
        this.fileName = fileName;
        this.json2csvParser = new json2csv_1.Parser({ flatten: true });
        this.filetype = filetype;
        this.input = input;
        this.test = test;
        this.proxy = proxy;
        this.strictSSL = strictSSL;
        this.number = number;
        this.since = since;
        this.csrf = '';
        this.zip = zip;
        this.cookieJar = request_promise_1.default.jar();
        this.hdVideo = hdVideo;
        this.sessionList = sessionList;
        this.asyncDownload = asyncDownload || 5;
        this.asyncScraping = () => {
            switch (this.scrapeType) {
                case 'user':
                case 'trend':
                    return 1;
                default:
                    return 1;
            }
        };
        this.collector = [];
        this.event = event;
        this.scrapeType = type;
        this.cli = cli;
        this.spinner = ora_1.default({ text: 'TikTok Scraper Started', stream: process.stdout });
        this.byUserId = by_user_id;
        this.storeHistory = cli && download && store_history;
        this.historyPath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : historyPath || os_1.tmpdir();
        this.idStore = '';
        this.noWaterMark = noWaterMark;
        this.maxCursor = 0;
        this.noDuplicates = [];
        this.timeout = timeout;
        this.bulk = bulk;
        this.validHeaders = false;
        this.Downloader = new core_1.Downloader({
            progress,
            cookieJar: this.cookieJar,
            proxy,
            noWaterMark,
            headers,
            filepath: process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '',
            bulk,
        });
        this.webHookUrl = webHookUrl;
        this.method = method;
        this.httpRequests = {
            good: 0,
            bad: 0,
        };
        this.store = [];
    }
    get fileDestination() {
        if (this.fileName) {
            if (!this.zip && this.download) {
                return `${this.folderDestination}/${this.fileName}`;
            }
            return this.filepath ? `${this.filepath}/${this.fileName}` : this.fileName;
        }
        switch (this.scrapeType) {
            case 'user':
            case 'hashtag':
                if (!this.zip && this.download) {
                    return `${this.folderDestination}/${this.input}_${Date.now()}`;
                }
                return this.filepath ? `${this.filepath}/${this.input}_${Date.now()}` : `${this.input}_${Date.now()}`;
            default:
                if (!this.zip && this.download) {
                    return `${this.folderDestination}/${this.scrapeType}_${Date.now()}`;
                }
                return this.filepath ? `${this.filepath}/${this.scrapeType}_${Date.now()}` : `${this.scrapeType}_${Date.now()}`;
        }
    }
    get folderDestination() {
        switch (this.scrapeType) {
            case 'user':
                return this.filepath ? `${this.filepath}/${this.input}` : this.input;
            case 'hashtag':
                return this.filepath ? `${this.filepath}/#${this.input}` : `#${this.input}`;
            case 'music':
                return this.filepath ? `${this.filepath}/music_${this.input}` : `music_${this.input}`;
            case 'trend':
                return this.filepath ? `${this.filepath}/trend` : `trend`;
            case 'video':
                return this.filepath ? `${this.filepath}/video` : `video`;
            default:
                throw new TypeError(`${this.scrapeType} is not supported`);
        }
    }
    get getApiEndpoint() {
        switch (this.scrapeType) {
            case 'user':
                return `${this.mainHost}share/item/list`;
            case 'trend':
                return `${this.mainHost}api/recommend/item_list/`;
            case 'hashtag':
                return `${this.mainHost}api/challenge/item_list/`;
            case 'music':
                return `${this.mainHost}api/music/item_list/`;
            default:
                throw new TypeError(`${this.scrapeType} is not supported`);
        }
    }
    get getProxy() {
        const proxy = Array.isArray(this.proxy) && this.proxy.length ? this.proxy[Math.floor(Math.random() * this.proxy.length)] : this.proxy;
        if (proxy) {
            if (proxy.indexOf('socks4://') > -1 || proxy.indexOf('socks5://') > -1) {
                return {
                    socks: true,
                    proxy: new socks_proxy_agent_1.SocksProxyAgent(proxy),
                };
            }
            return {
                socks: false,
                proxy,
            };
        }
        return {
            socks: false,
            proxy: '',
        };
    }
    request({ uri, method, qs, body, form, headers, json, gzip, followAllRedirects, simple = true }, bodyOnly = true, simpleOptionsFlag = false, unsignedUrl = '', signature = '') {
        return new Promise(async (resolve, reject) => {
            const proxy = this.getProxy;
            const options = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ jar: this.cookieJar, uri,
                method }, (qs ? { qs } : {})), (body ? { body } : {})), (form ? { form } : {})), { headers: Object.assign(Object.assign(Object.assign({}, this.headers), headers), (this.csrf ? { 'x-secsdk-csrf-token': this.csrf } : {})) }), (json ? { json: true } : {})), (gzip ? { gzip: true } : {})), { resolveWithFullResponse: true, followAllRedirects: followAllRedirects || false, simple }), (proxy.proxy && proxy.socks ? { agent: proxy.proxy } : {})), (proxy.proxy && !proxy.socks ? { proxy: `http://${proxy.proxy}/` } : {})), (this.strictSSL === false ? { rejectUnauthorized: false } : {})), { timeout: 10000 });
            const simpleOptions = {
                jar: this.cookieJar,
                uri: `${unsignedUrl}&_signature=${signature}`,
                headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
                },
                json: true
            };
            const session = this.sessionList[Math.floor(Math.random() * this.sessionList.length)];
            if (session) {
                this.cookieJar.setCookie(session, 'https://tiktok.com');
            }
            const cookies = this.cookieJar.getCookieString('https://tiktok.com');
            if (cookies.indexOf('tt_webid_v2') === -1) {
                this.cookieJar.setCookie(`tt_webid_v2=69${helpers_1.makeid(17)}; Domain=tiktok.com; Path=/; Secure; hostOnly=false`, 'https://tiktok.com');
            }
            try {
                let response;
                if (simpleOptionsFlag) {
                    response = await request_promise_1.default(simpleOptions);
                }
                else {
                    response = await request_promise_1.default(options);
                }
                if (options.method === 'HEAD') {
                    const csrf = response.headers['x-ware-csrf-token'];
                    this.csrf = csrf.split(',')[1];
                }
                setTimeout(() => {
                    resolve(bodyOnly ? response.body : response);
                }, this.timeout);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    returnInitError(error) {
        if (this.cli && !this.bulk) {
            this.spinner.stop();
        }
        if (this.event) {
            this.emit('error', error);
        }
        else {
            throw error;
        }
    }
    async scrape() {
        if (this.cli && !this.bulk) {
            this.spinner.start();
        }
        if (this.download && !this.zip) {
            try {
                await bluebird_1.fromCallback(cb => fs_1.mkdir(this.folderDestination, { recursive: true }, cb));
            }
            catch (error) {
                return this.returnInitError(error.message);
            }
        }
        if (!this.scrapeType || constant_1.default.scrape.indexOf(this.scrapeType) === -1) {
            return this.returnInitError(`Missing scraping type. Scrape types: ${constant_1.default.scrape} `);
        }
        if (this.scrapeType !== 'trend' && !this.input) {
            return this.returnInitError('Missing input');
        }
        console.log('version v2.6');
        await this.mainLoop();
        if (this.event) {
            return this.emit('done', 'completed');
        }
        if (this.storeHistory) {
            await this.getDownloadedVideosFromHistory();
        }
        if (this.noWaterMark) {
            await this.withoutWatermark();
        }
        const [json, csv, zip] = await this.saveCollectorData();
        if (this.storeHistory) {
            this.collector.forEach(item => {
                if (this.store.indexOf(item.id) === -1 && item.downloaded) {
                    this.store.push(item.id);
                }
            });
            await this.storeDownloadProgress();
        }
        if (this.webHookUrl) {
            await this.sendDataToWebHookUrl();
        }
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ headers: Object.assign(Object.assign({}, this.headers), { cookie: this.cookieJar.getCookieString('https://tiktok.com') }), collector: this.collector }, (this.download ? { zip } : {})), (this.filetype === 'all' ? { json, csv } : {})), (this.filetype === 'json' ? { json } : {})), (this.filetype === 'csv' ? { csv } : {})), (this.webHookUrl ? { webhook: this.httpRequests } : {}));
    }
    withoutWatermark() {
        return new Promise((resolve, reject) => {
            async_1.forEachLimit(this.collector, 5, async (item) => {
                try {
                    item.videoApiUrlNoWaterMark = await this.extractVideoId(item);
                    item.videoUrlNoWaterMark = await this.getUrlWithoutTheWatermark(item.videoApiUrlNoWaterMark);
                }
                catch (_a) {
                    throw new Error(`Can't extract unique video id`);
                }
            }, err => {
                if (err) {
                    return reject(err);
                }
                resolve(null);
            });
        });
    }
    async extractVideoId(item) {
        if (item.createTime > 1595808000) {
            return '';
        }
        try {
            const result = await request_promise_1.default({
                uri: item.videoUrl,
                headers: this.headers,
            });
            const position = Buffer.from(result).indexOf('vid:');
            if (position !== -1) {
                const id = Buffer.from(result)
                    .slice(position + 4, position + 36)
                    .toString();
                return `https://api2-16-h2.musical.ly/aweme/v1/play/?video_id=${id}&vr_type=0&is_play_url=1&source=PackSourceEnum_PUBLISH&media_type=4${this.hdVideo ? `&ratio=default&improve_bitrate=1` : ''}`;
            }
        }
        catch (_a) {
        }
        return '';
    }
    async getUrlWithoutTheWatermark(uri) {
        if (!uri) {
            return '';
        }
        const options = {
            uri,
            method: 'GET',
            headers: {
                'user-agent': 'com.zhiliaoapp.musically/2021600040 (Linux; U; Android 5.0; en_US; SM-N900T; Build/LRX21V; Cronet/TTNetVersion:6c7b701a 2020-04-23 QuicVersion:0144d358 2020-03-24)',
                'sec-fetch-mode': 'navigate',
            },
            followAllRedirects: true,
            simple: false,
        };
        try {
            const response = await this.request(options, false);
            return response.request.uri.href;
        }
        catch (err) {
            throw new Error(`Can't extract video url without the watermark`);
        }
    }
    mainLoop() {
        return new Promise((resolve, reject) => {
            const taskArray = Array.from({ length: 1000 }, (v, k) => k + 1);
            async_1.forEachLimit(taskArray, this.asyncScraping(), (item, cb) => {
                switch (this.scrapeType) {
                    case 'user':
                        this.getUserId()
                            .then(query => this.submitScrapingRequest(Object.assign(Object.assign({}, query), { cursor: this.maxCursor }), true))
                            .then(kill => cb(kill || null))
                            .catch(error => cb(error));
                        break;
                    case 'hashtag':
                        this.getHashTagId()
                            .then(query => this.submitScrapingRequest(Object.assign(Object.assign({}, query), { cursor: item === 1 ? 0 : (item - 1) * query.count }), true))
                            .then(kill => cb(kill || null))
                            .catch(error => cb(error));
                        break;
                    case 'trend':
                        this.getTrendingFeedQuery()
                            .then(query => this.submitScrapingRequest(Object.assign({}, query), true))
                            .then(kill => cb(kill || null))
                            .catch(error => cb(error));
                        break;
                    case 'music':
                        this.getMusicFeedQuery()
                            .then(query => this.submitScrapingRequest(Object.assign(Object.assign({}, query), { cursor: item === 1 ? 0 : (item - 1) * query.count }), true))
                            .then(kill => cb(kill || null))
                            .catch(error => cb(error));
                        break;
                    default:
                        break;
                }
            }, err => {
                if (err && err !== true) {
                    return reject(err);
                }
                resolve(null);
            });
        });
    }
    async submitScrapingRequest(query, updatedApiResponse = false) {
        try {
            if (!this.validHeaders) {
                if (this.scrapeType === 'trend') {
                    await this.getValidHeaders(`https://www.tiktok.com/foryou`, false, 'GET');
                }
                this.validHeaders = true;
            }
            const result = await this.scrapeData(query);
            if (result && result.statusCode !== 0) {
                throw new Error(`Can't scrape more posts`);
            }
            const { hasMore, maxCursor, cursor } = result;
            if ((!result.itemListData) && (updatedApiResponse && !result.itemList) || (!updatedApiResponse && !result.items)) {
                throw new Error('No more posts');
            }
            const { done } = await this.collectPosts(result.itemListData ? result.itemListData : result.itemList);
            this.collector = _.reject(this.collector, _.isEmpty);
            if (!hasMore) {
                console.error(`Only ${this.collector.length} results could be found.`);
                return true;
            }
            if (done) {
                return true;
            }
            this.maxCursor = parseInt(maxCursor === undefined ? cursor : maxCursor, 10);
            return false;
        }
        catch (error) {
            console.error(error);
            throw error.message ? new Error(error.message) : error;
        }
    }
    async saveCollectorData() {
        if (this.download) {
            if (this.cli) {
                this.spinner.stop();
            }
            if (this.collector.length && !this.test) {
                await this.Downloader.downloadPosts({
                    zip: this.zip,
                    folder: this.folderDestination,
                    collector: this.collector,
                    fileName: this.fileDestination,
                    asyncDownload: this.asyncDownload,
                });
            }
        }
        let json = '';
        let csv = '';
        let zip = '';
        if (this.collector.length) {
            json = `${this.fileDestination}.json`;
            csv = `${this.fileDestination}.csv`;
            zip = this.zip ? `${this.fileDestination}.zip` : this.folderDestination;
            await this.saveMetadata({ json, csv });
        }
        if (this.cli) {
            this.spinner.stop();
        }
        return [json, csv, zip];
    }
    async saveMetadata({ json, csv }) {
        if (this.collector.length) {
            switch (this.filetype) {
                case 'json':
                    await bluebird_1.fromCallback(cb => fs_1.writeFile(json, JSON.stringify(this.collector), cb));
                    break;
                case 'csv':
                    await bluebird_1.fromCallback(cb => fs_1.writeFile(csv, this.json2csvParser.parse(this.collector), cb));
                    break;
                case 'all':
                    await Promise.all([
                        await bluebird_1.fromCallback(cb => fs_1.writeFile(json, JSON.stringify(this.collector), cb)),
                        await bluebird_1.fromCallback(cb => fs_1.writeFile(csv, this.json2csvParser.parse(this.collector), cb)),
                    ]);
                    break;
                default:
                    break;
            }
        }
    }
    async getDownloadedVideosFromHistory() {
        try {
            const readFromStore = (await bluebird_1.fromCallback(cb => fs_1.readFile(`${this.historyPath}/${this.storeValue}.json`, { encoding: 'utf-8' }, cb)));
            this.store = JSON.parse(readFromStore);
        }
        catch (_a) {
        }
        this.collector = this.collector.map(item => {
            if (this.store.indexOf(item.id) !== -1) {
                item.repeated = true;
            }
            return item;
        });
        this.collector = this.collector.filter(item => !item.repeated);
    }
    async storeDownloadProgress() {
        const historyType = this.scrapeType === 'trend' ? 'trend' : `${this.scrapeType}_${this.input}`;
        const totalNewDownloadedVideos = this.collector.filter(item => item.downloaded).length;
        if (this.storeValue && totalNewDownloadedVideos) {
            let history = {};
            try {
                const readFromStore = (await bluebird_1.fromCallback(cb => fs_1.readFile(`${this.historyPath}/tiktok_history.json`, { encoding: 'utf-8' }, cb)));
                history = JSON.parse(readFromStore);
            }
            catch (error) {
                history[historyType] = {
                    type: this.scrapeType,
                    input: this.input,
                    downloaded_posts: 0,
                    last_change: new Date(),
                    file_location: `${this.historyPath}/${this.storeValue}.json`,
                };
            }
            if (!history[historyType]) {
                history[historyType] = {
                    type: this.scrapeType,
                    input: this.input,
                    downloaded_posts: 0,
                    last_change: new Date(),
                    file_location: `${this.historyPath}/${this.storeValue}.json`,
                };
            }
            history[historyType] = {
                type: this.scrapeType,
                input: this.input,
                downloaded_posts: history[historyType].downloaded_posts + totalNewDownloadedVideos,
                last_change: new Date(),
                file_location: `${this.historyPath}/${this.storeValue}.json`,
            };
            try {
                await bluebird_1.fromCallback(cb => fs_1.writeFile(`${this.historyPath}/${this.storeValue}.json`, JSON.stringify(this.store), cb));
            }
            catch (_a) {
            }
            try {
                await bluebird_1.fromCallback(cb => fs_1.writeFile(`${this.historyPath}/tiktok_history.json`, JSON.stringify(history), cb));
            }
            catch (_b) {
            }
        }
    }
    mapItem(post) {
        let item = {};
        if (this.scrapeType == 'user') {
            if (this.noDuplicates.indexOf(post.itemInfos.id) === -1) {
                this.noDuplicates.push(post.itemInfos.id);
                item = Object.assign(Object.assign({ id: post.itemInfos.id, secretID: post.itemInfos.id, text: post.itemInfos.text, createTime: post.itemInfos.createTime, authorMeta: {
                        id: post.authorInfos.userId,
                        secUid: post.authorInfos.secUid,
                        name: post.authorInfos.uniqueId,
                        nickName: post.authorInfos.nickName,
                        verified: post.authorInfos.verified,
                        signature: post.authorInfos.signature,
                        avatar: post.authorInfos.avatarLarger,
                        following: post.authorStats.followingCount,
                        fans: post.authorStats.followerCount,
                        heart: post.authorStats.heartCount,
                        video: post.authorStats.videoCount,
                        digg: post.authorStats.diggCount,
                    } }, (post.music
                    ? {
                        musicMeta: {
                            musicId: post.music.id,
                            musicName: post.music.title,
                            musicAuthor: post.music.authorName,
                            musicOriginal: post.music.original,
                            musicAlbum: post.music.album,
                            playUrl: post.music.playUrl,
                            coverThumb: post.music.coverThumb,
                            coverMedium: post.music.coverMedium,
                            coverLarge: post.music.coverLarge,
                            duration: post.music.duration,
                        },
                    }
                    : {})), { covers: {
                        default: post.itemInfos.covers,
                        origin: post.itemInfos.coversOrigin,
                        dynamic: post.itemInfos.coversDynamic,
                    }, imageUrl: post.itemInfos.covers[0], webVideoUrl: `https://www.tiktok.com/@${post.authorInfos.uniqueId}/video/${post.itemInfos.id}`, videoUrl: post.itemInfos.video.urls, videoUrlNoWaterMark: '', videoApiUrlNoWaterMark: '', videoMeta: {
                        height: post.itemInfos.video.videoMeta.height,
                        width: post.itemInfos.video.videoMeta.width,
                        duration: post.itemInfos.video.videoMeta.duration,
                    }, diggCount: post.itemInfos.diggCount, shareCount: post.itemInfos.shareCount, playCount: post.itemInfos.playCount, commentCount: post.itemInfos.commentCount, downloaded: false, mentions: post.itemInfos.text.match(/(@\w+)/g) || [], hashtags: post.itemInfos.challengeInfoList
                        ? post.itemInfos.challengeInfoList.map(({ id, title, desc, coverLarger }) => ({
                            id,
                            name: title,
                            title: desc,
                            cover: coverLarger,
                        }))
                        : [], effectStickers: post.itemInfos.stickerTextList
                        ? post.itemInfos.stickerTextList.map(({ ID, name }) => ({
                            id: ID,
                            name,
                        }))
                        : [] });
            }
        }
        if (this.scrapeType == 'trend') {
            if (this.noDuplicates.indexOf(post.id) === -1) {
                this.noDuplicates.push(post.id);
                item = Object.assign(Object.assign({ id: post.id, secretID: post.video.id, text: post.desc, createTime: post.createTime, authorMeta: {
                        id: post.author.id,
                        secUid: post.author.secUid,
                        name: post.author.uniqueId,
                        nickName: post.author.nickName,
                        verified: post.author.verified,
                        signature: post.author.signature,
                        avatar: post.author.avatarLarger,
                        following: post.authorStats.followingCount,
                        fans: post.authorStats.followerCount,
                        heart: post.authorStats.heartCount,
                        video: post.authorStats.videoCount,
                        digg: post.authorStats.diggCount,
                    } }, (post.music
                    ? {
                        musicMeta: {
                            musicId: post.music.id,
                            musicName: post.music.title,
                            musicAuthor: post.music.authorName,
                            musicOriginal: post.music.original,
                            musicAlbum: post.music.album,
                            playUrl: post.music.playUrl,
                            coverThumb: post.music.coverThumb,
                            coverMedium: post.music.coverMedium,
                            coverLarge: post.music.coverLarge,
                            duration: post.music.duration,
                        },
                    }
                    : {})), { covers: {
                        default: post.video.cover,
                        origin: post.video.originCover,
                        dynamic: post.video.dynamicCover,
                    }, imageUrl: post.itemInfos.covers[0], webVideoUrl: `https://www.tiktok.com/@${post.author.uniqueId}/video/${post.id}`, videoUrl: post.video.downloadAddr, videoUrlNoWaterMark: '', videoApiUrlNoWaterMark: '', videoMeta: {
                        height: post.video.height,
                        width: post.video.width,
                        duration: post.video.duration,
                    }, diggCount: post.stats.diggCount, shareCount: post.stats.shareCount, playCount: post.stats.playCount, commentCount: post.stats.commentCount, downloaded: false, mentions: post.desc.match(/(@\w+)/g) || [], hashtags: post.challenges
                        ? post.challenges.map(({ id, title, desc, coverLarger }) => ({
                            id,
                            name: title,
                            title: desc,
                            cover: coverLarger,
                        }))
                        : [], effectStickers: post.effectStickers
                        ? post.effectStickers.map(({ ID, name }) => ({
                            id: ID,
                            name,
                        }))
                        : [] });
            }
        }
        return item;
    }
    collectPosts(posts) {
        const result = {
            done: false,
        };
        for (let i = 0; i < posts.length; i += 1) {
            if (result.done) {
                break;
            }
            let post = posts[i];
            if (this.since && post.createTime < this.since) {
                result.done = constant_1.default.chronologicalTypes.indexOf(this.scrapeType) !== -1;
                if (result.done) {
                    break;
                }
                else {
                    continue;
                }
            }
            const item = this.mapItem(post);
            if (this.event) {
                this.emit('data', item);
                this.collector.push({});
            }
            else {
                this.collector.push(item);
            }
            if (this.number) {
                if (this.collector.length >= this.number) {
                    result.done = true;
                    break;
                }
            }
        }
        result.done = true;
        return result;
    }
    async getValidHeaders(url = '', signUrl = true, method = 'HEAD') {
        const options = Object.assign(Object.assign({ uri: url, method }, (signUrl
            ? {
                qs: {
                    _signature: helpers_1.sign(url, this.headers['user-agent']),
                },
            }
            : {})), { headers: {
                'x-secsdk-csrf-request': 1,
                'x-secsdk-csrf-version': '1.2.5',
            } });
        try {
            await this.request(options);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async scrapeData(qs) {
        this.storeValue = this.scrapeType === 'trend' ? 'trend' : qs.id || qs.challengeID || qs.musicID;
        const unsignedURL = `${this.getApiEndpoint}?${new url_1.URLSearchParams(qs).toString()}`;
        const _signature = this.signGivenUrl(unsignedURL);
        const options = {
            uri: this.getApiEndpoint,
            method: 'GET',
            qs: Object.assign(Object.assign({}, qs), { _signature }),
            json: true
        };
        try {
            const response = await this.request(options, true, this.scrapeType == 'user' ? true : false, unsignedURL, await _signature);
            return response;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getTrendingFeedQuery() {
        return {
            aid: 1988,
            app_name: 'tiktok_web',
            device_platform: 'web_pc',
            lang: '',
            count: 30,
            from_page: 'fyp',
            itemID: 1,
        };
    }
    async getMusicFeedQuery() {
        const musicIdRegex = /.com\/music\/[\w+-]+-(\d{15,22})/.exec(this.input);
        if (musicIdRegex) {
            this.input = musicIdRegex[1];
        }
        return {
            musicID: this.input,
            lang: '',
            aid: 1988,
            count: 30,
            cursor: 0,
            verifyFp: '',
        };
    }
    async getHashTagId() {
        if (this.idStore) {
            return {
                challengeID: this.idStore,
                count: 30,
                cursor: 0,
                aid: 1988,
                verifyFp: this.verifyFp,
            };
        }
        const id = encodeURIComponent(this.input);
        const query = {
            uri: `${this.mainHost}node/share/tag/${id}?uniqueId=${id}`,
            qs: {
                user_agent: this.headers['user-agent'],
            },
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can not find the hashtag: ${this.input}`);
            }
            this.idStore = response.challengeInfo.challenge.id;
            return {
                challengeID: this.idStore,
                count: 30,
                cursor: 0,
                aid: 1988,
                verifyFp: this.verifyFp,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserId() {
        if (this.byUserId || this.idStore) {
            return {
                secUid: '',
                id: this.input,
                type: 1,
                count: 30,
                minCursor: 0,
                maxCursor: 0,
                shareUid: ''
            };
        }
        try {
            const response = await this.getUserProfileInfo();
            this.idStore = response.user.secUid;
            this.userIdStore = response.user.id;
            return {
                secUid: '',
                id: this.userIdStore,
                type: 1,
                count: 30,
                minCursor: 0,
                maxCursor: 0,
                shareUid: ''
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getUserProfileInfo() {
        if (!this.input) {
            throw new Error(`Username is missing`);
        }
        let userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36';
        let url = `https://www.tiktok.com/@${this.input}?`;
        const options = {
            url: url,
            method: 'GET',
            "rejectUnauthorized": false,
            'headers': {
                'User-Agent': userAgent,
                'Connection': 'keep-alive',
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
            }
        };
        !_.isNil(this.proxy) ? _.extend(options, { proxy: this.proxy }) : '';
        console.log('using proxy ...', this.proxy);
        const response = await request_promise_1.default(url, options);
        let root = HTMLParser.parse(response);
        let appContext = root.querySelector('#SIGI_STATE');
        if (appContext && appContext.text) {
            let _json = JSON.parse(appContext.text).UserModule;
            let profileData = Object.values(_.get(_json, `users`))[0];
            let statsData = Object.values(_.get(_json, `stats`))[0];
            let data = { user: {}, stats: {}, shareMeta: {} };
            _.assign(data, { user: profileData });
            _.assign(data, { stats: statsData });
            return data;
        }
        let parsedResponse = JSON.parse(response);
        let emptyResponse = _.isEmpty(_.get(parsedResponse, 'userInfo'));
        let statusCode = _.get(parsedResponse, 'statusCode');
        if (!emptyResponse) {
            const userMetadata = parsedResponse;
            return userMetadata.userInfo;
        }
        if (emptyResponse) {
            options['uri'] = `http://tiktok.com/@${this.input}`;
            options['method'] = 'head';
            options['resolveWithFullResponse'] = true;
            try {
                let headResponse = await request_promise_1.default(options);
                statusCode = headResponse.statusCode;
            }
            catch (e) {
                statusCode = Object(e)['statusCode'];
            }
            switch (statusCode) {
                case 10202:
                case 404: throw new Error(`${statusCode} User does not exist`);
                case 200:
                default: throw new Error(`${statusCode} transient error`);
            }
        }
        throw new Error(`Can't extract user metadata from the html page. Make sure that user does exist and try to use proxy`);
    }
    async getHashtagInfo() {
        if (!this.input) {
            throw new Error(`Hashtag is missing`);
        }
        const query = {
            uri: `${this.mainHost}node/share/tag/${this.input}?uniqueId=${this.input}`,
            qs: {
                appId: 1233,
            },
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request(query);
            if (!response) {
                throw new Error(`Can't find hashtag: ${this.input}`);
            }
            if (response.statusCode !== 0) {
                throw new Error(`Can't find hashtag: ${this.input}`);
            }
            return response.challengeInfo;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getMusicInfo() {
        if (!this.input) {
            throw new Error(`Music is missing`);
        }
        const musicTitle = /music\/([\w-]+)-\d+/.exec(this.input);
        const musicId = /music\/[\w-]+-(\d+)/.exec(this.input);
        const query = {
            uri: `https://www.tiktok.com/node/share/music/${musicTitle ? musicTitle[1] : ''}-${musicId ? musicId[1] : ''}`,
            qs: {
                screen_width: 1792,
                screen_height: 1120,
                lang: 'en',
                priority_region: '',
                referer: '',
                root_referer: '',
                app_language: 'en',
                is_page_visible: true,
                history_len: 6,
                focus_state: true,
                is_fullscreen: false,
                aid: 1988,
                app_name: 'tiktok_web',
                timezone_name: '',
                device_platform: 'web',
                musicId: musicId ? musicId[1] : '',
                musicName: musicTitle ? musicTitle[1] : '',
            },
            method: 'GET',
            json: true,
        };
        const unsignedURL = `${query.uri}?${new url_1.URLSearchParams(query.qs).toString()}`;
        const _signature = helpers_1.sign(unsignedURL, this.headers['user-agent']);
        query.qs._signature = _signature;
        try {
            const response = await this.request(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can't find music data: ${this.input}`);
            }
            return response.musicInfo;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async signUrl() {
        if (!this.input) {
            throw new Error(`Url is missing`);
        }
        return helpers_1.sign(this.input, this.headers['user-agent']);
    }
    async signGivenUrl(url) {
        return helpers_1.sign(url, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36');
    }
    async getVideoMetadataFromHtml() {
        const options = {
            uri: this.input,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request(options);
            if (!response) {
                throw new Error(`Can't extract video meta data`);
            }
            const rawVideoMetadata = response
                .split(/<script id="__NEXT_DATA__" type="application\/json" nonce="[\w-]+" crossorigin="anonymous">/)[1]
                .split(`</script>`)[0];
            const videoProps = JSON.parse(rawVideoMetadata);
            const videoData = videoProps.props.pageProps.itemInfo.itemStruct;
            return videoData;
        }
        catch (error) {
            throw new Error(`Can't extract video metadata: ${this.input}`);
        }
    }
    async getVideoLink(url, regex, regexlvl2, targetRegex) {
        if (targetRegex.exec(url)) {
            return url;
        }
        let isShortLinkLvl = regex.exec(url) || regexlvl2.exec(url);
        if (isShortLinkLvl) {
            const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';
            let headers = {
                'User-Agent': userAgent,
            };
            var response = null;
            await request_promise_1.default({
                url: url,
                headers: headers,
                method: 'HEAD',
                followAllRedirects: false,
                followRedirect: false,
            }).then(res => {
                response = res.request.uri.href;
            }).catch(e => {
                response = e.response.location;
            });
            response = response.split('?')[0];
            return response;
        }
    }
    async getVideoMetadata(url = '') {
        let count = 0;
        let shortLinkLvl1 = /vm.tiktok.com\/([\w.-]+)/;
        let shortLinkLvl2 = /m.tiktok.com\/([\w.-]+)\/(\d+)/;
        let targetLinkregex = /tiktok.com\/(@[\w.-]+)\/video\/(\d+)/;
        while (!targetLinkregex.exec(url)) {
            url = await this.getVideoLink(url || this.input, shortLinkLvl1, shortLinkLvl2, targetLinkregex);
            count += 1;
            console.log('url is', url);
            if (count > 3) {
                break;
            }
        }
        const videoData = targetLinkregex.exec(url);
        if (videoData) {
            const videoUsername = videoData[1];
            const videoId = videoData[2];
            const options = {
                method: 'GET',
                uri: `https://www.tiktok.com/node/share/video/${videoUsername}/${videoId}`,
                json: true,
            };
            try {
                const response = await this.request(options);
                if (response.statusCode === 0) {
                    response.itemInfo.itemStruct['longUrl'] = url;
                    return response.itemInfo.itemStruct;
                }
            }
            catch (err) {
                if (err.statusCode === 404) {
                    throw new Error('Video does not exist');
                }
            }
        }
        throw new Error(`Can't extract video metadata: ${this.input}`);
    }
    async getVideoMeta(html = true) {
        if (!this.input) {
            throw new Error(`Url is missing`);
        }
        let videoData = {};
        if (false) {
            console.log('getting getVideoMetadataFromHtml');
            videoData = await this.getVideoMetadataFromHtml();
        }
        else {
            console.log('getting getVideoMetadataFromAPI');
            videoData = await this.getVideoMetadata();
        }
        const videoItem = {
            id: videoData.id,
            secretID: videoData.video.id,
            text: videoData.desc,
            createTime: videoData.createTime,
            authorMeta: {
                id: videoData.author.id,
                secUid: videoData.author.secUid,
                name: videoData.author.uniqueId,
                nickName: videoData.author.nickName,
                following: videoData.authorStats.followingCount,
                fans: videoData.authorStats.followerCount,
                heart: videoData.authorStats.heartCount,
                video: videoData.authorStats.videoCount,
                digg: videoData.authorStats.diggCount,
                verified: videoData.author.verified,
                private: videoData.author.secret,
                signature: videoData.author.signature,
                avatar: videoData.author.avatarLarger,
            },
            musicMeta: {
                musicId: videoData.music.id,
                musicName: videoData.music.title,
                musicAuthor: videoData.music.authorName,
                musicOriginal: videoData.music.original,
                coverThumb: videoData.music.coverThumb,
                coverMedium: videoData.music.coverMedium,
                coverLarge: videoData.music.coverLarge,
                duration: videoData.music.duration,
            },
            imageUrl: videoData.video.cover,
            longUrl: videoData.longUrl,
            videoUrl: videoData.video.playAddr,
            videoUrlNoWaterMark: '',
            videoApiUrlNoWaterMark: '',
            videoMeta: {
                width: videoData.video.width,
                height: videoData.video.height,
                ratio: videoData.video.ratio,
                duration: videoData.video.duration,
                duetEnabled: videoData.duetEnabled,
                stitchEnabled: videoData.stitchEnabled,
                duetInfo: videoData.duetInfo,
            },
            covers: {
                default: videoData.video.cover,
                origin: videoData.video.originCover,
            },
            diggCount: videoData.stats.diggCount,
            shareCount: videoData.stats.shareCount,
            playCount: videoData.stats.playCount,
            commentCount: videoData.stats.commentCount,
            downloaded: false,
            mentions: videoData.desc.match(/(@\w+)/g) || [],
            hashtags: videoData.challenges
                ? videoData.challenges.map(({ id, title, desc, profileLarger }) => ({
                    id,
                    name: title,
                    title: desc,
                    cover: profileLarger,
                }))
                : [],
            effectStickers: videoData.effectStickers
                ? videoData.effectStickers.map(({ ID, name }) => ({
                    id: ID,
                    name,
                }))
                : [],
        };
        try {
            if (this.noWaterMark) {
                videoItem.videoApiUrlNoWaterMark = await this.extractVideoId(videoItem);
                videoItem.videoUrlNoWaterMark = await this.getUrlWithoutTheWatermark(videoItem.videoApiUrlNoWaterMark);
            }
        }
        catch (_a) {
        }
        this.collector.push(videoItem);
        return videoItem;
    }
    sendDataToWebHookUrl() {
        return new Promise(resolve => {
            async_1.forEachLimit(this.collector, 3, (item, cb) => {
                request_promise_1.default(Object.assign(Object.assign(Object.assign({ uri: this.webHookUrl, method: this.method, headers: {
                        'user-agent': 'TikTok-Scraper',
                    } }, (this.method === 'POST' ? { body: item } : {})), (this.method === 'GET' ? { qs: { json: encodeURIComponent(JSON.stringify(item)) } } : {})), { json: true }))
                    .then(() => {
                    this.httpRequests.good += 1;
                })
                    .catch(() => {
                    this.httpRequests.bad += 1;
                })
                    .finally(() => cb(null));
            }, () => {
                resolve(null);
            });
        });
    }
}
exports.TikTokScraper = TikTokScraper;
