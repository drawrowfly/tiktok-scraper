/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */

import rp, { OptionsWithUri } from 'request-promise';
import { CookieJar } from 'request';
import { tmpdir } from 'os';
import { writeFile, readFile, mkdir } from 'fs';
import { Parser } from 'json2csv';
import ora, { Ora } from 'ora';
import { fromCallback } from 'bluebird';
import { EventEmitter } from 'events';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { forEachLimit } from 'async';
import { URLSearchParams } from 'url';
import CONST from '../constant';
import { sign, makeid } from '../helpers';

import {
    PostCollector,
    ScrapeType,
    TikTokConstructor,
    Result,
    MusicMetadata,
    RequestQuery,
    History,
    Proxy,
    FeedItems,
    ItemListData,
    TikTokMetadata,
    UserMetadata,
    HashtagMetadata,
    Headers,
    WebHtmlUserMetadata,
    VideoMetadata,
} from '../types';

import { Downloader } from '../core';

export class TikTokScraper extends EventEmitter {
    private mainHost: string;

    private userIdStore: string;

    private download: boolean;

    private filepath: string;

    private json2csvParser: Parser<any>;

    private filetype: string;

    private input: string;

    private proxy: string[] | string;

    private strictSSL: boolean;

    private number: number;

    private since: number;

    private asyncDownload: number;

    private asyncScraping: () => number;

    private collector: PostCollector[];

    private event: boolean;

    private scrapeType: ScrapeType;

    private cli: boolean;

    private spinner: Ora;

    private byUserId: boolean;

    private storeHistory: boolean;

    private historyPath: string;

    private idStore: string;

    public Downloader: Downloader;

    private storeValue: string = '';

    private maxCursor: number;

    private noWaterMark: boolean;

    private noDuplicates: string[];

    private timeout: number;

    private bulk: boolean;

    private validHeaders: boolean;

    private csrf: string;

    private zip: boolean;

    private fileName: string;

    private test: boolean;

    private hdVideo: boolean;

    private webHookUrl: string;

    private method: string;

    private httpRequests: {
        good: number;
        bad: number;
    };

    public headers: Headers;

    private sessionList: string[];

    private verifyFp: string;

    private store: string[];

    public cookieJar: CookieJar;

    constructor({
        download,
        filepath,
        filetype,
        proxy,
        strictSSL = true,
        asyncDownload,
        cli = false,
        event = false,
        progress = false,
        input,
        number,
        since,
        type,
        by_user_id = false,
        store_history = false,
        historyPath = '',
        noWaterMark = false,
        useTestEndpoints = false,
        fileName = '',
        timeout = 0,
        bulk = false,
        zip = false,
        test = false,
        hdVideo = false,
        webHookUrl = '',
        method = 'POST',
        headers,
        verifyFp = '',
        sessionList = [],
    }: TikTokConstructor) {
        super();
        this.userIdStore = '';
        this.verifyFp = verifyFp;
        this.mainHost = useTestEndpoints ? 'https://t.tiktok.com/' : 'https://m.tiktok.com/';
        this.headers = headers;
        this.download = download;
        this.filepath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '';
        this.fileName = fileName;
        this.json2csvParser = new Parser({ flatten: true });
        this.filetype = filetype;
        this.input = input;
        this.test = test;
        this.proxy = proxy;
        this.strictSSL = strictSSL;
        this.number = number;
        this.since = since;
        this.csrf = '';
        this.zip = zip;
        // Cookie jar. Where all valid cookies will be stored
        this.cookieJar = rp.jar();
        this.hdVideo = hdVideo;
        this.sessionList = sessionList;
        this.asyncDownload = asyncDownload || 5;
        this.asyncScraping = (): number => {
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
        this.spinner = ora({ text: 'TikTok Scraper Started', stream: process.stdout });
        this.byUserId = by_user_id;
        this.storeHistory = cli && download && store_history;
        this.historyPath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : historyPath || tmpdir();
        this.idStore = '';
        this.noWaterMark = noWaterMark;
        this.maxCursor = 0;
        this.noDuplicates = [];
        this.timeout = timeout;
        this.bulk = bulk;
        this.validHeaders = false;
        this.Downloader = new Downloader({
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

    /**
     * Get file destination(csv, zip, json)
     */
    private get fileDestination(): string {
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

    /**
     * Get folder destination, where all downloaded posts will be saved
     */
    private get folderDestination(): string {
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

    /**
     * Get api endpoint
     */
    private get getApiEndpoint(): string {
        switch (this.scrapeType) {
            case 'user':
                return `${this.mainHost}api/post/item_list/`;
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

    /**
     * Get proxy
     */
    private get getProxy(): Proxy {
        const proxy =
            Array.isArray(this.proxy) && this.proxy.length ? this.proxy[Math.floor(Math.random() * this.proxy.length)] : (this.proxy as string);

        if (proxy) {
            if (proxy.indexOf('socks4://') > -1 || proxy.indexOf('socks5://') > -1) {
                return {
                    socks: true,
                    proxy: new SocksProxyAgent(proxy),
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

    /**
     * Main request method
     * @param {} OptionsWithUri
     */
    private request<T>(
        { uri, method, qs, body, form, headers, json, gzip, followAllRedirects, simple = true }: OptionsWithUri,
        bodyOnly = true,
    ): Promise<T> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const proxy = this.getProxy;
            const options = ({
                jar: this.cookieJar,
                uri,
                method,
                ...(qs ? { qs } : {}),
                ...(body ? { body } : {}),
                ...(form ? { form } : {}),
                headers: {
                    ...this.headers,
                    ...headers,
                    ...(this.csrf ? { 'x-secsdk-csrf-token': this.csrf } : {}),
                },
                ...(json ? { json: true } : {}),
                ...(gzip ? { gzip: true } : {}),
                resolveWithFullResponse: true,
                followAllRedirects: followAllRedirects || false,
                simple,
                ...(proxy.proxy && proxy.socks ? { agent: proxy.proxy } : {}),
                ...(proxy.proxy && !proxy.socks ? { proxy: `http://${proxy.proxy}/` } : {}),
                ...(this.strictSSL === false ? { rejectUnauthorized: false } : {}),
                timeout: 10000,
            } as unknown) as OptionsWithUri;

            const session = this.sessionList[Math.floor(Math.random() * this.sessionList.length)];
            if (session) {
                this.cookieJar.setCookie(session, 'https://tiktok.com');
            }
            /**
             * Set tt_webid_v2 cookie to access video url
             */
            const cookies = this.cookieJar.getCookieString('https://tiktok.com');
            if (cookies.indexOf('tt_webid_v2') === -1) {
                this.cookieJar.setCookie(`tt_webid_v2=69${makeid(17)}; Domain=tiktok.com; Path=/; Secure; hostOnly=false`, 'https://tiktok.com');
            }

            try {
                const response = await rp(options);
                // Extract valid csrf token
                if (options.method === 'HEAD') {
                    const csrf = response.headers['x-ware-csrf-token'];
                    this.csrf = csrf.split(',')[1] as string;
                }
                setTimeout(() => {
                    resolve(bodyOnly ? response.body : response);
                }, this.timeout);
            } catch (error) {
                reject(error);
            }
        });
    }

    private returnInitError(error) {
        if (this.cli && !this.bulk) {
            this.spinner.stop();
        }
        if (this.event) {
            this.emit('error', error);
        } else {
            throw error;
        }
    }

    /**
     * Initiate scraping process
     */
    // eslint-disable-next-line consistent-return
    public async scrape(): Promise<Result | any> {
        if (this.cli && !this.bulk) {
            this.spinner.start();
        }

        if (this.download && !this.zip) {
            try {
                await fromCallback(cb => mkdir(this.folderDestination, { recursive: true }, cb));
            } catch (error) {
                return this.returnInitError(error.message);
            }
        }

        if (!this.scrapeType || CONST.scrape.indexOf(this.scrapeType) === -1) {
            return this.returnInitError(`Missing scraping type. Scrape types: ${CONST.scrape} `);
        }
        if (this.scrapeType !== 'trend' && !this.input) {
            return this.returnInitError('Missing input');
        }

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
            // We need to make sure that we save data only about downloaded videos
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

        return {
            headers: { ...this.headers, cookie: this.cookieJar.getCookieString('https://tiktok.com') },
            collector: this.collector,
            ...(this.download ? { zip } : {}),
            ...(this.filetype === 'all' ? { json, csv } : {}),
            ...(this.filetype === 'json' ? { json } : {}),
            ...(this.filetype === 'csv' ? { csv } : {}),
            ...(this.webHookUrl ? { webhook: this.httpRequests } : {}),
        };
    }

    /**
     * Extract uniq video id and create the url to the video without the watermark
     */
    private withoutWatermark() {
        return new Promise((resolve, reject) => {
            forEachLimit(
                this.collector,
                5,
                async (item: PostCollector) => {
                    try {
                        item.videoApiUrlNoWaterMark = await this.extractVideoId(item);
                        item.videoUrlNoWaterMark = await this.getUrlWithoutTheWatermark(item.videoApiUrlNoWaterMark!);
                    } catch {
                        throw new Error(`Can't extract unique video id`);
                    }
                },
                err => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(null);
                },
            );
        });
    }

    /**
     * Extract uniq video id
     * All videos after July 27 2020 do not store unique video id
     * it means that we can't extract url to the video without the watermark
     * @param uri
     */
    // eslint-disable-next-line class-methods-use-this
    private async extractVideoId(item: PostCollector): Promise<string> {
        if (item.createTime > 1595808000) {
            return '';
        }

        try {
            const result = await rp({
                uri: item.videoUrl,
                headers: this.headers,
            });
            const position = Buffer.from(result).indexOf('vid:');
            if (position !== -1) {
                const id = Buffer.from(result)
                    .slice(position + 4, position + 36)
                    .toString();

                return `https://api2-16-h2.musical.ly/aweme/v1/play/?video_id=${id}&vr_type=0&is_play_url=1&source=PackSourceEnum_PUBLISH&media_type=4${
                    this.hdVideo ? `&ratio=default&improve_bitrate=1` : ''
                }`;
            }
        } catch {
            // continue regardless of error
        }
        return '';
    }

    /**
     * Get temporary url to the video without the watermark
     * The url has expiration time (between 5-20 minutes+-)
     * @param uri
     */
    private async getUrlWithoutTheWatermark(uri: string): Promise<string> {
        if (!uri) {
            return '';
        }
        const options = {
            uri,
            method: 'GET',
            headers: {
                'user-agent':
                    'com.zhiliaoapp.musically/2021600040 (Linux; U; Android 5.0; en_US; SM-N900T; Build/LRX21V; Cronet/TTNetVersion:6c7b701a 2020-04-23 QuicVersion:0144d358 2020-03-24)',
                'sec-fetch-mode': 'navigate',
            },
            followAllRedirects: true,
            simple: false,
        };

        try {
            const response: {
                request: { uri: { href: string } };
            } = await this.request(options, false);
            return response.request.uri.href;
        } catch (err) {
            throw new Error(`Can't extract video url without the watermark`);
        }
    }

    /**
     * Main loop that collects all required metadata from the tiktok web api
     */
    private mainLoop(): Promise<any> {
        return new Promise((resolve, reject) => {
            const taskArray = Array.from({ length: 1000 }, (v, k) => k + 1);
            forEachLimit(
                taskArray,
                this.asyncScraping(),
                (item, cb) => {
                    switch (this.scrapeType) {
                        case 'user':
                            this.getUserId()
                                .then(query => this.submitScrapingRequest({ ...query, cursor: this.maxCursor }, true))
                                .then(kill => cb(kill || null))
                                .catch(error => cb(error));
                            break;
                        case 'hashtag':
                            this.getHashTagId()
                                .then(query => this.submitScrapingRequest({ ...query, cursor: item === 1 ? 0 : (item - 1) * query.count! }, true))
                                .then(kill => cb(kill || null))
                                .catch(error => cb(error));
                            break;
                        case 'trend':
                            this.getTrendingFeedQuery()
                                .then(query => this.submitScrapingRequest({ ...query }, true))
                                .then(kill => cb(kill || null))
                                .catch(error => cb(error));
                            break;
                        case 'music':
                            this.getMusicFeedQuery()
                                .then(query => this.submitScrapingRequest({ ...query, cursor: item === 1 ? 0 : (item - 1) * query.count! }, true))
                                .then(kill => cb(kill || null))
                                .catch(error => cb(error));
                            break;
                        default:
                            break;
                    }
                },
                err => {
                    if (err && err !== true) {
                        return reject(err);
                    }

                    resolve(null);
                },
            );
        });
    }

    /**
     * Submit request to the TikTok web API
     * Collect received metadata
     */
    private async submitScrapingRequest(query: RequestQuery, updatedApiResponse = false): Promise<boolean> {
        try {
            if (!this.validHeaders) {
                /**
                 * As of August 13, 2021 the trend api endpoint requires ttwid cookie value that can be extracted by sending GET request to the tiktok trending page
                 */
                if (this.scrapeType === 'trend') {
                    await this.getValidHeaders(`https://www.tiktok.com/foryou`, false, 'GET');
                }
                this.validHeaders = true;
            }
            const result = await this.scrapeData<ItemListData>(query);
            if (result.statusCode !== 0) {
                throw new Error(`Can't scrape more posts`);
            }
            const { hasMore, maxCursor, cursor } = result;
            if ((updatedApiResponse && !result.itemList) || (!updatedApiResponse && !result.items)) {
                throw new Error('No more posts');
            }
            const { done } = await this.collectPosts(updatedApiResponse ? result.itemList : result.items);

            if (!hasMore) {
                console.error(`Only ${this.collector.length} results could be found.`);
                return true;
            }

            if (done) {
                return true;
            }

            this.maxCursor = parseInt(maxCursor === undefined ? cursor : maxCursor, 10);
            return false;
        } catch (error) {
            throw error.message ? new Error(error.message) : error;
        }
    }

    /**
     * Store collector data in the CSV and/or JSON files
     */
    private async saveCollectorData(): Promise<string[]> {
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

    /**
     * Save post metadata
     * @param param0
     */
    public async saveMetadata({ json, csv }) {
        if (this.collector.length) {
            switch (this.filetype) {
                case 'json':
                    await fromCallback(cb => writeFile(json, JSON.stringify(this.collector), cb));
                    break;
                case 'csv':
                    await fromCallback(cb => writeFile(csv, this.json2csvParser.parse(this.collector), cb));
                    break;
                case 'all':
                    await Promise.all([
                        await fromCallback(cb => writeFile(json, JSON.stringify(this.collector), cb)),
                        await fromCallback(cb => writeFile(csv, this.json2csvParser.parse(this.collector), cb)),
                    ]);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * If option -s is being used then we need to
     * retrieve already downloaded video id's to prevent them to be downloaded again
     */
    private async getDownloadedVideosFromHistory() {
        try {
            const readFromStore = (await fromCallback(cb =>
                readFile(`${this.historyPath}/${this.storeValue}.json`, { encoding: 'utf-8' }, cb),
            )) as string;
            this.store = JSON.parse(readFromStore);
        } catch {
            // continue regardless of error
        }

        this.collector = this.collector.map(item => {
            if (this.store.indexOf(item.id) !== -1) {
                item.repeated = true;
            }
            return item;
        });

        this.collector = this.collector.filter(item => !item.repeated);
    }

    /**
     * Store progress to avoid downloading duplicates
     * Only available from the CLI
     */
    private async storeDownloadProgress() {
        const historyType = this.scrapeType === 'trend' ? 'trend' : `${this.scrapeType}_${this.input}`;
        const totalNewDownloadedVideos = this.collector.filter(item => item.downloaded).length;

        if (this.storeValue && totalNewDownloadedVideos) {
            let history = {} as History;

            try {
                const readFromStore = (await fromCallback(cb =>
                    readFile(`${this.historyPath}/tiktok_history.json`, { encoding: 'utf-8' }, cb),
                )) as string;

                history = JSON.parse(readFromStore);
            } catch (error) {
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
                await fromCallback(cb => writeFile(`${this.historyPath}/${this.storeValue}.json`, JSON.stringify(this.store), cb));
            } catch {
                // continue regardless of error
            }

            try {
                await fromCallback(cb => writeFile(`${this.historyPath}/tiktok_history.json`, JSON.stringify(history), cb));
            } catch {
                // continue regardless of error
            }
        }
    }

    /**
     * Collect post data from the API response
     * @param posts
     */
    private collectPosts(posts: FeedItems[]) {
        const result = {
            done: false,
        };
        for (let i = 0; i < posts.length; i += 1) {
            if (result.done) {
                break;
            }

            if (this.since && posts[i].createTime < this.since) {
                result.done = CONST.chronologicalTypes.indexOf(this.scrapeType) !== -1;

                if (result.done) {
                    break;
                } else {
                    continue;
                }
            }

            if (this.noDuplicates.indexOf(posts[i].id) === -1) {
                this.noDuplicates.push(posts[i].id);
                const item: PostCollector = {
                    id: posts[i].id,
                    secretID: posts[i].video.id,
                    text: posts[i].desc,
                    createTime: posts[i].createTime,
                    authorMeta: {
                        id: posts[i].author.id,
                        secUid: posts[i].author.secUid,
                        name: posts[i].author.uniqueId,
                        nickName: posts[i].author.nickname,
                        verified: posts[i].author.verified,
                        signature: posts[i].author.signature,
                        avatar: posts[i].author.avatarLarger,
                        following: posts[i].authorStats.followingCount,
                        fans: posts[i].authorStats.followerCount,
                        heart: posts[i].authorStats.heartCount,
                        video: posts[i].authorStats.videoCount,
                        digg: posts[i].authorStats.diggCount,
                    },
                    ...(posts[i].music
                        ? {
                              musicMeta: {
                                  musicId: posts[i].music.id,
                                  musicName: posts[i].music.title,
                                  musicAuthor: posts[i].music.authorName,
                                  musicOriginal: posts[i].music.original,
                                  musicAlbum: posts[i].music.album,
                                  playUrl: posts[i].music.playUrl,
                                  coverThumb: posts[i].music.coverThumb,
                                  coverMedium: posts[i].music.coverMedium,
                                  coverLarge: posts[i].music.coverLarge,
                                  duration: posts[i].music.duration,
                              },
                          }
                        : {}),
                    covers: {
                        default: posts[i].video.cover,
                        origin: posts[i].video.originCover,
                        dynamic: posts[i].video.dynamicCover,
                    },
                    webVideoUrl: `https://www.tiktok.com/@${posts[i].author.uniqueId}/video/${posts[i].id}`,
                    videoUrl: posts[i].video.downloadAddr,
                    videoUrlNoWaterMark: '',
                    videoApiUrlNoWaterMark: '',
                    videoMeta: {
                        height: posts[i].video.height,
                        width: posts[i].video.width,
                        duration: posts[i].video.duration,
                    },
                    diggCount: posts[i].stats.diggCount,
                    shareCount: posts[i].stats.shareCount,
                    playCount: posts[i].stats.playCount,
                    commentCount: posts[i].stats.commentCount,
                    downloaded: false,
                    mentions: posts[i].desc.match(/(@\w+)/g) || [],
                    hashtags: posts[i].challenges
                        ? posts[i].challenges.map(({ id, title, desc, coverLarger }) => ({
                              id,
                              name: title,
                              title: desc,
                              cover: coverLarger,
                          }))
                        : [],
                    effectStickers: posts[i].effectStickers
                        ? posts[i].effectStickers.map(({ ID, name }) => ({
                              id: ID,
                              name,
                          }))
                        : [],
                };

                if (this.event) {
                    this.emit('data', item);
                    this.collector.push({} as PostCollector);
                } else {
                    this.collector.push(item);
                }
            }

            if (this.number) {
                if (this.collector.length >= this.number) {
                    result.done = true;
                    break;
                }
            }
        }
        return result;
    }

    /**
     * In order to execute some request, we need to extract valid cookie headers
     * This request is being executed only once per run
     */
    private async getValidHeaders(url = '', signUrl = true, method = 'HEAD') {
        const options = {
            uri: url,
            method,
            ...(signUrl
                ? {
                      qs: {
                          _signature: sign(url, this.headers['user-agent']),
                      },
                  }
                : {}),
            headers: {
                'x-secsdk-csrf-request': 1,
                'x-secsdk-csrf-version': '1.2.5',
            },
        };

        try {
            await this.request<string>(options);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    private async scrapeData<T>(qs: RequestQuery): Promise<T> {
        this.storeValue = this.scrapeType === 'trend' ? 'trend' : qs.id || qs.challengeID! || qs.musicID!;

        const unsignedURL = `${this.getApiEndpoint}?${new URLSearchParams(qs as any).toString()}`;
        const _signature = sign(unsignedURL, this.headers['user-agent']);

        const options = {
            uri: this.getApiEndpoint,
            method: 'GET',
            qs: {
                ...qs,
                _signature,
            },
            json: true,
        };

        try {
            const response = await this.request<T>(options);
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Get trending feed query
     */
    // eslint-disable-next-line class-methods-use-this
    private async getTrendingFeedQuery(): Promise<RequestQuery> {
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

    /**
     * Get music feed query
     */
    private async getMusicFeedQuery(): Promise<RequestQuery> {
        const musicIdRegex = /.com\/music\/[\w+-]+-(\d{15,22})/.exec(this.input);
        if (musicIdRegex) {
            this.input = musicIdRegex[1] as string;
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

    /**
     * Get hashtag ID
     */
    private async getHashTagId(): Promise<RequestQuery> {
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
            const response = await this.request<TikTokMetadata>(query);
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
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Get user ID
     */
    private async getUserId(): Promise<RequestQuery> {
        if (this.byUserId || this.idStore) {
            return {
                id: this.userIdStore,
                secUid: this.idStore ? this.idStore : this.input,
                lang: '',
                aid: 1988,
                count: 30,
                cursor: 0,
                app_name: 'tiktok_web',
                device_platform: 'web_pc',
                cookie_enabled: true,
                history_len: 2,
                focus_state: true,
                is_fullscreen: false,
            };
        }

        try {
            const response = await this.getUserProfileInfo();
            this.idStore = response.user.secUid;
            this.userIdStore = response.user.id;
            return {
                id: this.userIdStore,
                aid: 1988,
                secUid: this.idStore,
                count: 30,
                lang: '',
                cursor: 0,
                app_name: 'tiktok_web',
                device_platform: 'web_pc',
                cookie_enabled: true,
                history_len: 2,
                focus_state: true,
                is_fullscreen: false,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Get user profile information
     * @param {} username
     */
    public async getUserProfileInfo(): Promise<UserMetadata> {
        if (!this.input) {
            throw new Error(`Username is missing`);
        }
        const options = {
            method: 'GET',
            uri: `https://www.tiktok.com/@${encodeURIComponent(this.input)}`,
            json: true,
        };
        try {
            const response = await this.request<string>(options);
            const breakResponse = response
                .split(/<script id="__NEXT_DATA__" type="application\/json" nonce="[\w-]+" crossorigin="anonymous">/)[1]
                .split(`</script>`)[0];
            if (breakResponse) {
                const userMetadata: WebHtmlUserMetadata = JSON.parse(breakResponse);
                return userMetadata.props.pageProps.userInfo;
            }
        } catch (err) {
            if (err.statusCode === 404) {
                throw new Error('User does not exist');
            }
        }
        throw new Error(`Can't extract user metadata from the html page. Make sure that user does exist and try to use proxy`);
    }

    /**
     * Get hashtag information
     * @param {} hashtag
     */
    public async getHashtagInfo(): Promise<HashtagMetadata> {
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
            const response = await this.request<TikTokMetadata>(query);
            if (!response) {
                throw new Error(`Can't find hashtag: ${this.input}`);
            }
            if (response.statusCode !== 0) {
                throw new Error(`Can't find hashtag: ${this.input}`);
            }
            return response.challengeInfo;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Get music information
     * @param {} music link
     */
    public async getMusicInfo(): Promise<MusicMetadata> {
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

        const unsignedURL = `${query.uri}?${new URLSearchParams(query.qs as any).toString()}`;
        const _signature = sign(unsignedURL, this.headers['user-agent']);

        // @ts-ignore
        query.qs._signature = _signature;

        try {
            const response = await this.request<TikTokMetadata>(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can't find music data: ${this.input}`);
            }
            return response.musicInfo;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Sign URL
     * @param {}
     */
    public async signUrl() {
        if (!this.input) {
            throw new Error(`Url is missing`);
        }
        return sign(this.input, this.headers['user-agent']);
    }

    /**
     * Get video metadata from the HTML
     * This method can be used if you aren't able to retrieve video metadata from a simple API call
     * Can be slow
     */
    private async getVideoMetadataFromHtml(): Promise<FeedItems> {
        const options = {
            uri: this.input,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request<string>(options);
            if (!response) {
                throw new Error(`Can't extract video meta data`);
            }

            if (response.includes("__NEXT_DATA__")){
                const rawVideoMetadata = response
                    .split(/<script id="__NEXT_DATA__" type="application\/json" nonce="[\w-]+" crossorigin="anonymous">/)[1]
                    .split(`</script>`)[0];

                const videoProps = JSON.parse(rawVideoMetadata);
                const videoData = videoProps.props.pageProps.itemInfo.itemStruct;
                return videoData as FeedItems;
            }

            if (response.includes('SIGI_STATE')) {
                const rawVideoMetadata = response.split('<script id="SIGI_STATE" type="application/json">')[1].split('</script>')[0];

                const videoProps = JSON.parse(rawVideoMetadata);
                const videoData = Object.values(videoProps.ItemModule)[0];
                return videoData as FeedItems;
            }

            throw new Error('No available parser for html page')
        } catch (error) {
            throw new Error(`Can't extract video metadata: ${this.input}`);
        }
    }

    /**
     * Get video metadata from the regular API endpoint
     */
    private async getVideoMetadata(url = ''): Promise<FeedItems> {
        const videoData = /tiktok.com\/(@[\w.-]+)\/video\/(\d+)/.exec(url || this.input);
        if (videoData) {
            const videoUsername = videoData[1];
            const videoId = videoData[2];

            const options = {
                method: 'GET',
                uri: `https://www.tiktok.com/node/share/video/${videoUsername}/${videoId}`,
                json: true,
            };

            try {
                const response = await this.request<VideoMetadata>(options);
                if (response.statusCode === 0) {
                    return response.itemInfo.itemStruct;
                }
            } catch (err) {
                if (err.statusCode === 404) {
                    throw new Error('Video does not exist');
                }
            }
        }
        throw new Error(`Can't extract video metadata: ${this.input}`);
    }

    /**
     * Get video url without the watermark
     * @param {}
     */

    public async getVideoMeta(html = true): Promise<PostCollector> {
        if (!this.input) {
            throw new Error(`Url is missing`);
        }

        let videoData = {} as FeedItems;
        if (html) {
            videoData = await this.getVideoMetadataFromHtml();
        } else {
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
                nickName: videoData.author.nickname,
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
        } as PostCollector;

        try {
            if (this.noWaterMark) {
                videoItem.videoApiUrlNoWaterMark = await this.extractVideoId(videoItem);
                videoItem.videoUrlNoWaterMark = await this.getUrlWithoutTheWatermark(videoItem.videoApiUrlNoWaterMark);
            }
        } catch {
            // continue regardless of error
        }
        this.collector.push(videoItem);

        return videoItem;
    }

    /**
     * If webhook url was provided then send POST/GET request to the URL with the data from the this.collector
     */
    private sendDataToWebHookUrl() {
        return new Promise(resolve => {
            forEachLimit(
                this.collector,
                3,
                (item, cb) => {
                    rp({
                        uri: this.webHookUrl,
                        method: this.method,
                        headers: {
                            'user-agent': 'TikTok-Scraper',
                        },
                        ...(this.method === 'POST' ? { body: item } : {}),
                        ...(this.method === 'GET' ? { qs: { json: encodeURIComponent(JSON.stringify(item)) } } : {}),
                        json: true,
                    })
                        .then(() => {
                            this.httpRequests.good += 1;
                        })
                        .catch(() => {
                            this.httpRequests.bad += 1;
                        })
                        .finally(() => cb(null));
                },
                () => {
                    resolve(null);
                },
            );
        });
    }
}
