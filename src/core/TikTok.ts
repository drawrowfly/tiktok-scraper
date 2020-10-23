/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable no-await-in-loop */
import rp, { OptionsWithUri } from 'request-promise';
import { tmpdir } from 'os';
import { writeFile, readFile, mkdir } from 'fs';
import { Parser } from 'json2csv';
import ora, { Ora } from 'ora';
import { fromCallback } from 'bluebird';
import { EventEmitter } from 'events';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { forEachLimit } from 'async';

import CONST from '../constant';
import { sign } from '../helpers';

import {
    PostCollector,
    ScrapeType,
    TikTokConstructor,
    Result,
    ItemListData,
    MusicMetadata,
    RequestQuery,
    Item,
    History,
    Proxy,
    ItemAPIV2,
    ItemListDataAPIV2,
    TikTokMetadata,
    UserMetadata,
    HashtagMetadata,
} from '../types';

import { Downloader } from '../core';

export class TikTokScraper extends EventEmitter {
    private mainHost: string;

    private userAgent: string;

    private download: boolean;

    private filepath: string;

    private json2csvParser: Parser<any>;

    private filetype: string;

    private input: string;

    private proxy: string[] | string;

    private number: number;

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

    private zip: boolean;

    private fileName: string;

    private test: boolean;

    private hdVideo: boolean;

    private signature: string;

    private webHookUrl: string;

    private method: string;

    private httpRequests: {
        good: number;
        bad: number;
    };

    constructor({
        download,
        filepath,
        filetype,
        proxy,
        asyncDownload,
        cli = false,
        event = false,
        progress = false,
        input,
        number,
        type,
        by_user_id = false,
        store_history = false,
        historyPath = '',
        userAgent,
        noWaterMark = false,
        fileName = '',
        timeout = 0,
        bulk = false,
        zip = false,
        test = false,
        hdVideo = false,
        signature = '',
        webHookUrl = '',
        method = 'POST',
    }: TikTokConstructor) {
        super();
        this.mainHost = 'https://m.tiktok.com/';
        this.userAgent = userAgent;
        this.download = download;
        this.filepath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '';
        this.fileName = fileName;
        this.json2csvParser = new Parser({ flatten: true });
        this.filetype = filetype;
        this.input = input;
        this.test = test;
        this.proxy = proxy;
        this.number = number;
        this.zip = zip;
        this.hdVideo = hdVideo;
        this.asyncDownload = asyncDownload || 5;
        this.signature = signature;
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
        this.Downloader = new Downloader({
            progress,
            proxy,
            noWaterMark,
            userAgent,
            filepath: process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : filepath || '',
            bulk,
        });
        this.webHookUrl = webHookUrl;
        this.method = method;
        this.httpRequests = {
            good: 0,
            bad: 0,
        };
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
                return this.filepath ? `${this.filepath}/music:${this.input}` : `music:${this.input}`;
            case 'trend':
                return this.filepath ? `${this.filepath}/trend` : `trend`;
            case 'video':
                return this.filepath ? `${this.filepath}/video` : `video`;
            default:
                throw new TypeError(`${this.scrapeType} is not supported`);
        }
    }

    /**
     * Get proxy
     */
    private get getProxy(): Proxy {
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
                proxy: new SocksProxyAgent(this.proxy as string),
            };
        }
        return {
            socks: false,
            proxy: this.proxy as string,
        };
    }

    /**
     * Main request method
     * @param {} OptionsWithUri
     */
    private request<T>({ uri, method, qs, body, form, headers, json, gzip }: OptionsWithUri): Promise<T> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const proxy = this.getProxy;
            const query = ({
                uri,
                method,
                ...(qs ? { qs } : {}),
                ...(body ? { body } : {}),
                ...(form ? { form } : {}),
                headers: {
                    'User-Agent': this.userAgent,
                    ...headers,
                },
                ...(json ? { json: true } : {}),
                ...(gzip ? { gzip: true } : {}),
                resolveWithFullResponse: true,
                ...(proxy.proxy && proxy.socks ? { agent: proxy.proxy } : {}),
                ...(proxy.proxy && !proxy.socks ? { proxy: `http://${proxy.proxy}/` } : {}),
                timeout: 10000,
            } as unknown) as OptionsWithUri;

            try {
                const response = await rp(query);
                setTimeout(() => {
                    resolve(response.body);
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
            await this.storeDownlodProgress();
        }

        if (this.noWaterMark) {
            await this.withoutWatermark();
        }

        const [json, csv, zip] = await this.saveCollectorData();

        if (this.webHookUrl) {
            await this.sendDataToWebHookUrl();
        }

        return {
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
        return new Promise(resolve => {
            forEachLimit(
                this.collector,
                5,
                (item: PostCollector, cb) => {
                    this.extractVideoId(item)
                        .then(video => {
                            if (video) {
                                // eslint-disable-next-line no-param-reassign
                                item.videoUrlNoWaterMark = video;
                            }
                            cb(null);
                        })
                        .catch(() => cb(null));
                },
                () => {
                    resolve();
                },
            );
        });
    }

    /**
     * Extract uniq video id
     * @param uri
     */
    // eslint-disable-next-line class-methods-use-this
    private async extractVideoId(item: PostCollector): Promise<string | null> {
        // All videos after July 27 2020 do not store unique video id
        // it means that we can't extract url to the video without the watermark
        if (item.createTime > 1595808000) {
            return null;
        }
        try {
            const result = await rp({
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

                return `https://api2-16-h2.musical.ly/aweme/v1/play/?video_id=${id}&vr_type=0&is_play_url=1&source=PackSourceEnum_PUBLISH&media_type=4${
                    this.hdVideo ? `&ratio=default&improve_bitrate=1` : ''
                }`;
            }
        } catch {
            // continue regardless of error
        }
        return null;
    }

    /**
     * Main loop that collects all required metadata from the tiktok web api
     */
    private mainLoop(): Promise<any> {
        return new Promise(resolve => {
            const taskArray = Array.from({ length: 1000 }, (v, k) => k + 1);
            forEachLimit(
                taskArray,
                this.asyncScraping(),
                (item, cb) => {
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
                },
                () => {
                    resolve();
                },
            );
        });
    }

    /**
     * Submit request to the TikTok web API
     * Collect received metadata
     */
    private async submitScrapingRequest(query: RequestQuery, item, apiv1 = false): Promise<any> {
        try {
            let hasMore = false;
            let maxCursor = '';
            if (apiv1) {
                const result = await this.scrapeData<ItemListData>(query, item, apiv1);
                if (result.statusCode !== 0) {
                    throw new Error(`Can't scrape more posts`);
                }
                hasMore = result.body.hasMore;
                maxCursor = result.body.maxCursor;
                await this.collectPosts(result.body.itemListData);
            } else {
                const result = await this.scrapeData<ItemListDataAPIV2>(query, item, apiv1);
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
        } catch (error) {
            throw error.message;
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
     * Store progress to avoid downloading duplicates
     * Only available from the CLI
     */
    private async storeDownlodProgress() {
        const historyType = this.scrapeType === 'trend' ? 'trend' : `${this.scrapeType}_${this.input}`;
        if (this.storeValue) {
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
            let store: string[];
            try {
                const readFromStore = (await fromCallback(cb =>
                    readFile(`${this.historyPath}/${this.storeValue}.json`, { encoding: 'utf-8' }, cb),
                )) as string;
                store = JSON.parse(readFromStore);
            } catch (error) {
                store = [];
            }

            this.collector = this.collector.map(item => {
                if (store.indexOf(item.id) === -1) {
                    store.push(item.id);
                } else {
                    // eslint-disable-next-line no-param-reassign
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
                await fromCallback(cb => writeFile(`${this.historyPath}/${this.storeValue}.json`, JSON.stringify(store), cb));
            } catch (error) {
                // continue regardless of error
            }

            try {
                await fromCallback(cb => writeFile(`${this.historyPath}/tiktok_history.json`, JSON.stringify(history), cb));
            } catch (error) {
                // continue regardless of error
            }
        }
    }

    /**
     * Collect post from new API
     * @param posts
     */
    private collectPostsV2(posts: ItemAPIV2[]) {
        for (let i = 0; i < posts.length; i += 1) {
            if (this.number) {
                if (this.collector.length >= this.number) {
                    break;
                }
            }

            if (this.noDuplicates.indexOf(posts[i].id) === -1) {
                this.noDuplicates.push(posts[i].id);
                const item: PostCollector = {
                    id: posts[i].id,
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
                    },
                    ...(posts[i].music
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
                        : {}),
                    covers: {
                        default: posts[i].video.cover,
                        origin: posts[i].video.originCover,
                        dynamic: posts[i].video.dynamicCover,
                    },
                    webVideoUrl: `https://www.tiktok.com/@${posts[i].author.uniqueId}/video/${posts[i].id}`,
                    videoUrl: posts[i].video.downloadAddr,
                    videoUrlNoWaterMark: '',
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
                };

                if (this.event) {
                    this.emit('data', item);
                    this.collector.push({} as PostCollector);
                } else {
                    this.collector.push(item);
                }
            }
        }
    }

    /**
     * Collecting posts from API V1
     * This method will be removed in the future
     * @param posts
     */
    private collectPosts(posts: Item[]) {
        for (let i = 0; i < posts.length; i += 1) {
            if (this.number) {
                if (this.collector.length >= this.number) {
                    break;
                }
            }

            if (this.noDuplicates.indexOf(posts[i].itemInfos.id) === -1) {
                this.noDuplicates.push(posts[i].itemInfos.id);
                const item: PostCollector = {
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
                    this.collector.push({} as PostCollector);
                } else {
                    this.collector.push(item);
                }
            }
        }
    }

    private async scrapeData<T>(qs: RequestQuery, maxCursor: number, apiv1 = false): Promise<T> {
        /**
         * API V1 is being used to collect data from hashtag
         * With the current signature method, hashtag feed can return randomly empty result
         */
        const apiEndpoint = `${this.mainHost}${apiv1 ? 'share/item/list/' : 'api/item_list/'}`;
        const urlToSign = `${apiEndpoint}?secUid=${qs.secUid}&id=${qs.id}&${apiv1 ? 'type' : 'sourceType'}=${
            qs.sourceType ? qs.sourceType : qs.type
        }&count=${qs.count}&minCursor=${qs.minCursor}&maxCursor=${maxCursor || 0}&lang=${qs.lang}&verifyFp=${qs.verifyFp}`;

        const signature = this.signature ? this.signature : sign(this.userAgent, urlToSign);

        this.signature = '';
        this.storeValue = this.scrapeType === 'trend' ? 'trend' : qs.id;

        const options = {
            uri: apiEndpoint,
            method: 'GET',
            qs: {
                ...qs,
                _signature: signature,
                maxCursor: maxCursor || 0,
            },
            headers: {
                accept: 'application/json, text/plain, */*',
                referer: 'https://www.tiktok.com/',
            },
            json: true,
        };
        try {
            const response = await this.request<T>(options);
            return response;
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Get trending feed query
     */
    // eslint-disable-next-line class-methods-use-this
    private async getTrendingFeedQuery(): Promise<RequestQuery> {
        return {
            id: '1',
            secUid: '',
            lang: '',
            sourceType: CONST.sourceType.trend,
            count: this.number > 30 ? 50 : 30,
            minCursor: 0,
            verifyFp: '',
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
        console.log(this.input);
        return {
            id: this.input,
            secUid: '',
            lang: '',
            sourceType: CONST.sourceType.music,
            count: this.number > 30 ? 50 : 30,
            minCursor: 0,
            verifyFp: '',
        };
    }

    /**
     * Get hashtag ID
     */
    private async getHashTagId(): Promise<RequestQuery> {
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
            const response = await this.request<TikTokMetadata>(query);
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
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Get user ID
     */
    private async getUserId(): Promise<RequestQuery> {
        if (this.byUserId || this.idStore) {
            return {
                id: this.idStore ? this.idStore : this.input,
                secUid: '',
                sourceType: CONST.sourceType.user,
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
            const response = await this.request<TikTokMetadata>(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can't find the user: ${this.input}`);
            }
            this.idStore = response.userInfo.user.id;
            return {
                id: this.idStore,
                secUid: '',
                sourceType: CONST.sourceType.user,
                count: this.number > 30 ? 50 : 30,
                minCursor: 0,
                lang: '',
                verifyFp: '',
            };
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Get user profile information
     * @param {} username
     */
    public async getUserProfileInfo(): Promise<UserMetadata> {
        if (!this.input) {
            throw `Username is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/user/@${this.input}?uniqueId=${this.input}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request<TikTokMetadata>(query);

            if (!response) {
                throw new Error(`Can't find user: ${this.input}`);
            }
            if (response.statusCode !== 0) {
                throw new Error(`Can't find user: ${this.input}`);
            }
            return response.userInfo;
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Get hashtag information
     * @param {} hashtag
     */
    public async getHashtagInfo(): Promise<HashtagMetadata> {
        if (!this.input) {
            throw `Hashtag is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/tag/${this.input}?uniqueId=${this.input}`,
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
            throw error.message;
        }
    }

    /**
     * Get music information
     * @param {} music link
     */
    public async getMusicInfo(): Promise<MusicMetadata> {
        if (!this.input) {
            throw `Music is missing`;
        }

        // const regex = /music\/([^?]+)/.exec(this.input);

        // if (!regex) {
        //     throw `Music is missing`;
        // }

        const query = {
            uri: `${this.mainHost}node/share/music/-${this.input}`,
            method: 'GET',
            json: true,
        };

        try {
            const response = await this.request<TikTokMetadata>(query);
            if (response.statusCode !== 0) {
                throw new Error(`Can't find music data: ${this.input}`);
            }
            return response.musicInfo;
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Sign URL
     * @param {}
     */
    public async signUrl() {
        if (!this.input) {
            throw `Url is missing`;
        }

        return sign(this.userAgent, this.input);
    }

    /**
     * Get video url without the watermark
     * @param {}
     */

    public async getVideoMeta(): Promise<PostCollector> {
        if (!this.input) {
            throw `Url is missing`;
        }
        const query = {
            uri: this.input,
            headers: {
                'user-agent': this.userAgent,
                referer: 'https://www.tiktok.com/',
            },
            method: 'GET',
            json: true,
        };
        try {
            let short = false;
            let regex: RegExpExecArray | null;
            const response = await this.request<string>(query);
            if (!response) {
                throw new Error(`Can't extract video meta data`);
            }

            if (response.indexOf('<script>window.__INIT_PROPS__ = ') > -1) {
                short = true;
            }

            if (short) {
                regex = /<script>window.__INIT_PROPS__ = ([^]*)\}<\/script>/.exec(response);
            } else {
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
                    } else if (videoProps['/i18n/share/video/:id']) {
                        shortKey = '/i18n/share/video/:id';
                        if (videoProps['/i18n/share/video/:id'].statusCode) {
                            throw new Error();
                        }
                    } else {
                        throw new Error();
                    }
                } else if (videoProps.props.pageProps.statusCode) {
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
                    playCount: videoData.stats.commentCount,
                    commentCount: videoData.stats.playCount,
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
                } as PostCollector;

                try {
                    const video = await this.extractVideoId(videoItem);
                    videoItem.videoUrlNoWaterMark = video;
                } catch (error) {
                    // continue regardless of error
                }
                this.collector.push(videoItem);

                return videoItem;
            }
            throw new Error();
        } catch (error) {
            throw `Can't extract metadata from the video: ${this.input}`;
        }
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
                    resolve();
                },
            );
        });
    }
}
