"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
const constant_1 = __importDefault(require("../constant"));
const helpers_1 = require("../helpers");
const core_1 = require("../core");
class TikTokScraper extends events_1.EventEmitter {
    constructor({ download, filepath, filetype, proxy, asyncDownload, cli = false, event = false, progress = false, input, number, type, by_user_id = false, store_history = false, historyPath = '', userAgent, noWaterMark = false, fileName = '', timeout = 0, bulk = false, zip = false, test = false, hdVideo = false, signature = '', webHookUrl = '', method = 'POST', }) {
        super();
        this.storeValue = '';
        this.mainHost = 'https://m.tiktok.com/';
        this.userAgent = userAgent;
        this.download = download;
        this.filepath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '';
        this.fileName = fileName;
        this.json2csvParser = new json2csv_1.Parser({ flatten: true });
        this.filetype = filetype;
        this.input = input;
        this.test = test;
        this.proxy = proxy;
        this.number = number;
        this.zip = zip;
        this.hdVideo = hdVideo;
        this.asyncDownload = asyncDownload || 5;
        this.signature = signature;
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
        this.tt_webid_v2 = `68${helpers_1.makeid(16)}`;
        this.Downloader = new core_1.Downloader({
            progress,
            proxy,
            noWaterMark,
            userAgent,
            filepath: process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '',
            bulk,
            tt_webid_v2: this.tt_webid_v2,
        });
        this.webHookUrl = webHookUrl;
        this.method = method;
        this.httpRequests = {
            good: 0,
            bad: 0,
        };
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
                return this.filepath ? `${this.filepath}/music:${this.input}` : `music:${this.input}`;
            case 'trend':
                return this.filepath ? `${this.filepath}/trend` : `trend`;
            case 'video':
                return this.filepath ? `${this.filepath}/video` : `video`;
            default:
                throw new TypeError(`${this.scrapeType} is not supported`);
        }
    }
    get getProxy() {
        if (Array.isArray(this.proxy)) {
            const selectProxy = this.proxy.length ? this.proxy[Math.floor(Math.random() * this.proxy.length)] : '';
            return {
                socks: false,
                proxy: selectProxy,
            };
        }
        if (this.proxy.indexOf('socks4://') > -1 || this.proxy.indexOf('socks5://') > -1) {
            return {
                socks: true,
                proxy: new socks_proxy_agent_1.SocksProxyAgent(this.proxy),
            };
        }
        return {
            socks: false,
            proxy: this.proxy,
        };
    }
    request({ uri, method, qs, body, form, headers, json, gzip }) {
        return new Promise(async (resolve, reject) => {
            const proxy = this.getProxy;
            const query = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ uri,
                method }, (qs ? { qs } : {})), (body ? { body } : {})), (form ? { form } : {})), { headers: Object.assign({ 'User-Agent': this.userAgent, Cookie: `tt_webid_v2=${this.tt_webid_v2}` }, headers) }), (json ? { json: true } : {})), (gzip ? { gzip: true } : {})), { resolveWithFullResponse: true }), (proxy.proxy && proxy.socks ? { agent: proxy.proxy } : {})), (proxy.proxy && !proxy.socks ? { proxy: `http://${proxy.proxy}/` } : {})), { timeout: 10000, rejectUnauthorized: false });
            try {
                const response = await request_promise_1.default(query);
                setTimeout(() => {
                    resolve(response.body);
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
        await this.mainLoop();
        if (this.event) {
            return this.emit('done', 'completed');
        }
        if (this.storeHistory) {
            await this.storeDownlodProgress();
        }
        if (this.noWaterMark) {
            await this.withoutWatermark();
        }
        const [json, csv, zip] = await this.saveCollectorData();
        if (this.webHookUrl) {
            await this.sendDataToWebHookUrl();
        }
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ collector: this.collector }, (this.download ? { zip } : {})), (this.filetype === 'all' ? { json, csv } : {})), (this.filetype === 'json' ? { json } : {})), (this.filetype === 'csv' ? { csv } : {})), (this.webHookUrl ? { webhook: this.httpRequests } : {}));
    }
    withoutWatermark() {
        return new Promise(resolve => {
            async_1.forEachLimit(this.collector, 5, (item, cb) => {
                this.extractVideoId(item)
                    .then(video => {
                    if (video) {
                        item.videoUrlNoWaterMark = video;
                    }
                    cb(null);
                })
                    .catch(() => cb(null));
            }, () => {
                resolve();
            });
        });
    }
    async extractVideoId(item) {
        if (item.createTime > 1595808000) {
            return null;
        }
        try {
            const result = await request_promise_1.default({
                uri: item.videoUrl,
                headers: {
                    'user-agent': 'okhttp',
                    referer: 'https://www.tiktok.com/',
                },
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
        return null;
    }
    mainLoop() {
        return new Promise(resolve => {
            const taskArray = Array.from({ length: 1000 }, (v, k) => k + 1);
            async_1.forEachLimit(taskArray, this.asyncScraping(), (item, cb) => {
                switch (this.scrapeType) {
                    case 'user':
                        this.getUserId()
                            .then(query => this.submitScrapingRequest(query, this.maxCursor))
                            .then(() => cb(null))
                            .catch(error => cb(error));
                        break;
                    case 'hashtag':
                        this.getHashTagId()
                            .then(query => this.submitScrapingRequest(query, item === 1 ? 0 : (item - 1) * query.count, true))
                            .then(() => cb(null))
                            .catch(error => cb(error));
                        break;
                    case 'trend':
                        this.getTrendingFeedQuery()
                            .then(query => this.submitScrapingRequest(query, this.maxCursor))
                            .then(() => cb(null))
                            .catch(error => cb(error));
                        break;
                    case 'music':
                        this.getMusicFeedQuery()
                            .then(query => this.submitScrapingRequest(query, item === 1 ? 0 : (item - 1) * query.count))
                            .then(() => cb(null))
                            .catch(error => cb(error));
                        break;
                    default:
                        break;
                }
            }, () => {
                resolve();
            });
        });
    }
    async submitScrapingRequest(query, item, apiv1 = false) {
        try {
            let hasMore = false;
            let maxCursor = '';
            if (apiv1) {
                const result = await this.scrapeData(query, item, apiv1);
                if (result.statusCode !== 0) {
                    throw new Error(`Can't scrape more posts`);
                }
                hasMore = result.body.hasMore;
                maxCursor = result.body.maxCursor;
                await this.collectPosts(result.body.itemListData);
            }
            else {
                const result = await this.scrapeData(query, item, apiv1);
                if (result.statusCode !== 0) {
                    throw new Error(`Can't scrape more posts`);
                }
                hasMore = result.hasMore;
                maxCursor = query.sourceType === 12 ? '0' : result.maxCursor;
                if (!result.items) {
                    throw new Error('No more posts');
                }
                await this.collectPostsV2(result.items);
            }
            if (!hasMore) {
                throw new Error('No more posts');
            }
            if (this.collector.length >= this.number && this.number !== 0) {
                throw new Error('Done');
            }
            this.maxCursor = parseInt(maxCursor, 10);
        }
        catch (error) {
            throw error.message;
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
    async storeDownlodProgress() {
        const historyType = this.scrapeType === 'trend' ? 'trend' : `${this.scrapeType}_${this.input}`;
        if (this.storeValue) {
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
            let store;
            try {
                const readFromStore = (await bluebird_1.fromCallback(cb => fs_1.readFile(`${this.historyPath}/${this.storeValue}.json`, { encoding: 'utf-8' }, cb)));
                store = JSON.parse(readFromStore);
            }
            catch (error) {
                store = [];
            }
            this.collector = this.collector.map(item => {
                if (store.indexOf(item.id) === -1) {
                    store.push(item.id);
                }
                else {
                    item.repeated = true;
                }
                return item;
            });
            this.collector = this.collector.filter(item => !item.repeated);
            history[historyType] = {
                type: this.scrapeType,
                input: this.input,
                downloaded_posts: history[historyType].downloaded_posts + this.collector.length,
                last_change: new Date(),
                file_location: `${this.historyPath}/${this.storeValue}.json`,
            };
            try {
                await bluebird_1.fromCallback(cb => fs_1.writeFile(`${this.historyPath}/${this.storeValue}.json`, JSON.stringify(store), cb));
            }
            catch (error) {
            }
            try {
                await bluebird_1.fromCallback(cb => fs_1.writeFile(`${this.historyPath}/tiktok_history.json`, JSON.stringify(history), cb));
            }
            catch (error) {
            }
        }
    }
    collectPostsV2(posts) {
        for (let i = 0; i < posts.length; i += 1) {
            if (this.number) {
                if (this.collector.length >= this.number) {
                    break;
                }
            }
            if (this.noDuplicates.indexOf(posts[i].id) === -1) {
                this.noDuplicates.push(posts[i].id);
                const item = Object.assign(Object.assign({ id: posts[i].id, text: posts[i].desc, createTime: posts[i].createTime, authorMeta: {
                        id: posts[i].author.id,
                        secUid: posts[i].author.secUid,
                        name: posts[i].author.uniqueId,
                        nickName: posts[i].author.nickname,
                        verified: posts[i].author.verified,
                        signature: posts[i].author.signature,
                        avatar: posts[i].author.avatarLarger,
                    } }, (posts[i].music
                    ? {
                        musicMeta: {
                            musicId: posts[i].music.id,
                            musicName: posts[i].music.title,
                            musicAuthor: posts[i].music.authorName,
                            musicOriginal: posts[i].music.original,
                            playUrl: posts[i].music.playUrl,
                            coverThumb: posts[i].music.coverThumb,
                            coverMedium: posts[i].music.coverMedium,
                            coverLarge: posts[i].music.coverLarge,
                        },
                    }
                    : {})), { covers: {
                        default: posts[i].video.cover,
                        origin: posts[i].video.originCover,
                        dynamic: posts[i].video.dynamicCover,
                    }, webVideoUrl: `https://www.tiktok.com/@${posts[i].author.uniqueId}/video/${posts[i].id}`, videoUrl: posts[i].video.downloadAddr, videoUrlNoWaterMark: '', videoMeta: {
                        height: posts[i].video.height,
                        width: posts[i].video.width,
                        duration: posts[i].video.duration,
                    }, diggCount: posts[i].stats.diggCount, shareCount: posts[i].stats.shareCount, playCount: posts[i].stats.playCount, commentCount: posts[i].stats.commentCount, downloaded: false, mentions: posts[i].desc.match(/(@\w+)/g) || [], hashtags: posts[i].challenges
                        ? posts[i].challenges.map(({ id, title, desc, coverLarger }) => ({
                            id,
                            name: title,
                            title: desc,
                            cover: coverLarger,
                        }))
                        : [] });
                if (this.event) {
                    this.emit('data', item);
                    this.collector.push({});
                }
                else {
                    this.collector.push(item);
                }
            }
        }
    }
    collectPosts(posts) {
        for (let i = 0; i < posts.length; i += 1) {
            if (this.number) {
                if (this.collector.length >= this.number) {
                    break;
                }
            }
            if (this.noDuplicates.indexOf(posts[i].itemInfos.id) === -1) {
                this.noDuplicates.push(posts[i].itemInfos.id);
                const item = {
                    id: posts[i].itemInfos.id,
                    text: posts[i].itemInfos.text,
                    createTime: posts[i].itemInfos.createTime,
                    authorMeta: {
                        id: posts[i].authorInfos.userId,
                        secUid: posts[i].authorInfos.secUid,
                        name: posts[i].authorInfos.uniqueId,
                        nickName: posts[i].authorInfos.nickName,
                        following: posts[i].authorStats.followingCount,
                        fans: posts[i].authorStats.followerCount,
                        heart: posts[i].authorStats.heartCount,
                        video: posts[i].authorStats.videoCount,
                        digg: posts[i].authorStats.diggCount,
                        verified: posts[i].authorInfos.verified,
                        private: posts[i].authorInfos.isSecret,
                        signature: posts[i].authorInfos.signature,
                        avatar: posts[i].authorInfos.coversMedium[0],
                    },
                    musicMeta: {
                        musicId: posts[i].itemInfos.musicId,
                        musicName: posts[i].musicInfos.musicName,
                        musicAuthor: posts[i].musicInfos.authorName,
                        musicOriginal: posts[i].musicInfos.original,
                        playUrl: posts[i].musicInfos.playUrl[0],
                    },
                    covers: {
                        default: posts[i].itemInfos.covers[0],
                        origin: posts[i].itemInfos.coversOrigin[0],
                        dynamic: posts[i].itemInfos.coversDynamic[0],
                    },
                    imageUrl: posts[i].itemInfos.coversOrigin[0],
                    webVideoUrl: `https://www.tiktok.com/@${posts[i].authorInfos.uniqueId}/video/${posts[i].itemInfos.id}`,
                    videoUrl: posts[i].itemInfos.video.urls[0],
                    videoUrlNoWaterMark: '',
                    videoMeta: posts[i].itemInfos.video.videoMeta,
                    diggCount: posts[i].itemInfos.diggCount,
                    shareCount: posts[i].itemInfos.shareCount,
                    playCount: posts[i].itemInfos.playCount,
                    commentCount: posts[i].itemInfos.commentCount,
                    downloaded: false,
                    mentions: posts[i].itemInfos.text.match(/(@\w+)/g) || [],
                    hashtags: posts[i].challengeInfoList.map(({ challengeId, challengeName, text, coversLarger }) => ({
                        id: challengeId,
                        name: challengeName,
                        title: text,
                        cover: coversLarger,
                    })),
                };
                if (this.event) {
                    this.emit('data', item);
                    this.collector.push({});
                }
                else {
                    this.collector.push(item);
                }
            }
        }
    }
    async scrapeData(qs, maxCursor, apiv1 = false) {
        const apiEndpoint = `${this.mainHost}${apiv1 ? 'share/item/list/' : 'api/item_list/'}`;
        const urlToSign = `${apiEndpoint}?secUid=${qs.secUid}&id=${qs.id}&${apiv1 ? 'type' : 'sourceType'}=${qs.sourceType ? qs.sourceType : qs.type}&count=${qs.count}&minCursor=${qs.minCursor}&maxCursor=${maxCursor || 0}&lang=${qs.lang}&verifyFp=${qs.verifyFp}`;
        const signature = this.signature ? this.signature : helpers_1.sign(this.userAgent, urlToSign);
        this.signature = '';
        this.storeValue = this.scrapeType === 'trend' ? 'trend' : qs.id;
        const options = {
            uri: apiEndpoint,
            method: 'GET',
            qs: Object.assign(Object.assign({}, qs), { _signature: signature, maxCursor: maxCursor || 0 }),
            headers: {
                accept: 'application/json, text/plain, */*',
                referer: 'https://www.tiktok.com/',
            },
            json: true,
        };
        try {
            const response = await this.request(options);
            return response;
        }
        catch (error) {
            throw error.message;
        }
    }
    async getTrendingFeedQuery() {
        return {
            id: '1',
            secUid: '',
            lang: '',
            sourceType: constant_1.default.sourceType.trend,
            count: this.number > 30 ? 50 : 30,
            minCursor: 0,
            verifyFp: '',
        };
    }
    async getMusicFeedQuery() {
        const musicIdRegex = /.com\/music\/[\w+-]+-(\d{15,22})/.exec(this.input);
        if (musicIdRegex) {
            this.input = musicIdRegex[1];
        }
        return {
            id: this.input,
            secUid: '',
            lang: '',
            sourceType: constant_1.default.sourceType.music,
            count: this.number > 30 ? 50 : 30,
            minCursor: 0,
            verifyFp: '',
        };
    }
    async getHashTagId() {
        if (this.idStore) {
            return {
                id: this.idStore,
                secUid: '',
                type: 3,
                count: 100,
                minCursor: 0,
                lang: '',
                verifyFp: '',
            };
        }
        const id = encodeURIComponent(this.input);
        const query = {
            uri: `${this.mainHost}node/share/tag/${id}?uniqueId=${id}`,
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
                id: this.idStore,
                secUid: '',
                type: 3,
                count: 100,
                minCursor: 0,
                lang: '',
                verifyFp: '',
            };
        }
        catch (error) {
            throw error.message;
        }
    }
    async getUserId() {
        if (this.byUserId || this.idStore) {
            return {
                id: this.idStore ? this.idStore : this.input,
                secUid: '',
                sourceType: constant_1.default.sourceType.user,
                count: this.number > 30 ? 50 : 30,
                minCursor: 0,
                lang: '',
                verifyFp: '',
            };
        }
        const id = encodeURIComponent(this.input);
        const query = {
            uri: `${this.mainHost}node/share/user/@${id}?uniqueId=${id}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can't find the user: ${this.input}`);
            }
            this.idStore = response.userInfo.user.id;
            return {
                id: this.idStore,
                secUid: '',
                sourceType: constant_1.default.sourceType.user,
                count: this.number > 30 ? 50 : 30,
                minCursor: 0,
                lang: '',
                verifyFp: '',
            };
        }
        catch (error) {
            throw error.message;
        }
    }
    async getUserProfileInfo() {
        if (!this.input) {
            throw `Username is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/user/@${this.input}?uniqueId=${this.input}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request(query);
            if (!response) {
                throw new Error(`Can't find user: ${this.input}`);
            }
            if (response.statusCode !== 0) {
                throw new Error(`Can't find user: ${this.input}`);
            }
            return response.userInfo;
        }
        catch (error) {
            throw error.message;
        }
    }
    async getHashtagInfo() {
        if (!this.input) {
            throw `Hashtag is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/tag/${this.input}?uniqueId=${this.input}`,
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
            throw error.message;
        }
    }
    async getMusicInfo() {
        if (!this.input) {
            throw `Music is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/music/-${this.input}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can't find music data: ${this.input}`);
            }
            return response.musicInfo;
        }
        catch (error) {
            throw error.message;
        }
    }
    async signUrl() {
        if (!this.input) {
            throw `Url is missing`;
        }
        return helpers_1.sign(this.userAgent, this.input);
    }
    async getVideoMeta() {
        if (!this.input) {
            throw `Url is missing`;
        }
        const options = {
            uri: this.input,
            headers: {
                'user-agent': this.userAgent,
                Referer: 'https://www.tiktok.com/',
                Cookie: `tt_webid_v2=${this.tt_webid_v2}`,
            },
            method: 'GET',
            json: true,
        };
        try {
            let short = false;
            let regex;
            const response = await this.request(options);
            if (!response) {
                throw new Error(`Can't extract video meta data`);
            }
            if (response.indexOf('<script>window.__INIT_PROPS__ = ') > -1) {
                short = true;
            }
            if (short) {
                regex = /<script>window.__INIT_PROPS__ = ([^]*)\}<\/script>/.exec(response);
            }
            else {
                regex = /<script id="__NEXT_DATA__" type="application\/json" crossorigin="anonymous">(.+)<\/script><script cros/.exec(response);
            }
            if (regex) {
                const videoProps = JSON.parse(short ? `${regex[1]}}` : regex[1]);
                let shortKey = '/v/:id';
                if (short) {
                    if (videoProps['/v/:id']) {
                        if (videoProps['/v/:id'].statusCode) {
                            throw new Error();
                        }
                    }
                    else if (videoProps['/i18n/share/video/:id']) {
                        shortKey = '/i18n/share/video/:id';
                        if (videoProps['/i18n/share/video/:id'].statusCode) {
                            throw new Error();
                        }
                    }
                    else {
                        throw new Error();
                    }
                }
                else if (videoProps.props.pageProps.statusCode) {
                    throw new Error();
                }
                const videoData = short ? videoProps[shortKey].videoData : videoProps.props.pageProps.itemInfo.itemStruct;
                const videoItem = {
                    id: videoData.id,
                    text: videoData.desc,
                    createTime: videoData.createTime,
                    authorMeta: {
                        id: videoData.author.id,
                        secUid: videoData.author.secUid,
                        name: videoData.author.uniqueId,
                        nickName: videoData.author.nickname,
                        following: videoData.authorStats.followingCount,
                        fans: videoData.authorStats.followerCount,
                        heart: videoData.authorStats.heart,
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
                    },
                    imageUrl: videoData.video.cover,
                    videoUrl: videoData.video.playAddr,
                    videoUrlNoWaterMark: null,
                    videoMeta: {
                        width: videoData.video.width,
                        height: videoData.video.height,
                        ratio: videoData.video.ratio,
                        duration: videoData.video.duration,
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
                };
                try {
                    const video = await this.extractVideoId(videoItem);
                    videoItem.videoUrlNoWaterMark = video;
                }
                catch (error) {
                }
                this.collector.push(videoItem);
                return videoItem;
            }
            throw new Error();
        }
        catch (error) {
            throw `Can't extract metadata from the video: ${this.input}`;
        }
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
                resolve();
            });
        });
    }
}
exports.TikTokScraper = TikTokScraper;
