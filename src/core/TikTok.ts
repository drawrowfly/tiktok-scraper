/* eslint-disable no-throw-literal */
/* eslint-disable no-await-in-loop */
import rp, { OptionsWithUri } from 'request-promise';
import { tmpdir } from 'os';
import { writeFile, readFile } from 'fs';
import { Parser } from 'json2csv';
import ora, { Ora } from 'ora';
import { fromCallback } from 'bluebird';
import { EventEmitter } from 'events';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { forEachLimit } from 'async';

import CONST from '../constant';

import { generateSignature } from '../helpers';

import { PostCollector, ScrapeType, TikTokConstructor, Result, ItemListData, ApiResponse, Challenge, UserData, RequestQuery, Item, History } from '../types';

import { Downloader } from '../core';

export class TikTokScraper extends EventEmitter {
    private mainHost: string;

    private userAgent: string;

    private download: boolean;

    private filepath: string;

    private json2csvParser: Parser<any>;

    private filetype: string;

    private input: string;

    private agent: SocksProxyAgent | string;

    private proxy: string;

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

    private tmpFolder: string;

    private fileName: () => string;

    private idStore: string;

    public Downloader: Downloader;

    private tacValue: string = '';

    private storeValue: string = '';

    private maxCursor: number;

    private test: boolean = false;

    private noWaterMark: boolean;

    private noDuplicates: string[];

    constructor({
        download,
        filepath,
        filetype,
        proxy,
        asyncDownload,
        asyncScraping,
        cli = false,
        event = false,
        progress = false,
        input,
        number,
        type,
        by_user_id = false,
        store_history = false,
        userAgent,
        test = false,
        noWaterMark = false,
        fileName,
    }: TikTokConstructor) {
        super();
        this.mainHost = 'https://m.tiktok.com/';
        this.userAgent = userAgent || CONST.userAgent;
        this.download = download;
        this.filepath = '' || filepath;
        this.json2csvParser = new Parser({ flatten: true });
        this.filetype = filetype;
        this.input = input;
        this.agent = proxy && proxy.indexOf('socks') > -1 ? new SocksProxyAgent(proxy) : '';
        this.proxy = proxy && proxy.indexOf('socks') === -1 ? proxy : '';
        this.number = number;
        this.asyncDownload = asyncDownload || 5;
        this.asyncScraping = (): number => {
            switch (this.scrapeType) {
                case 'user':
                case 'trend':
                    return 1;
                default:
                    return asyncScraping || 3;
            }
        };
        this.collector = [];
        this.event = event;
        this.scrapeType = type;
        this.cli = cli;
        this.spinner = ora('TikTok Scraper Started');
        this.byUserId = by_user_id;
        this.storeHistory = cli && download && store_history;
        this.tmpFolder = tmpdir();
        this.fileName = (): string => {
            if (fileName) {
                return fileName;
            }
            switch (type) {
                case 'user':
                case 'hashtag':
                    return `${input}_${Date.now()}`;
                default:
                    return `${this.scrapeType}_${Date.now()}`;
            }
        };
        this.idStore = '';
        this.test = test;
        this.noWaterMark = noWaterMark;
        this.maxCursor = 0;
        this.noDuplicates = [];
        this.Downloader = new Downloader({
            progress,
            proxy,
            test,
            noWaterMark,
            userAgent,
        });
    }

    /**
     * Main request method
     * @param {} OptionsWithUri
     */
    private async request<T>({ uri, method, qs, body, form, headers, json, gzip }: OptionsWithUri): Promise<T> {
        const query = {
            uri,
            method,
            ...(qs ? { qs } : {}),
            ...(body ? { body } : {}),
            ...(form ? { form } : {}),
            headers: {
                'User-Agent': this.userAgent,
                referer: 'https://www.tiktok.com/',
                ...headers,
            },
            ...(json ? { json: true } : {}),
            ...(gzip ? { gzip: true } : {}),
            resolveWithFullResponse: true,
            ...(this.proxy ? { proxy: `http://${this.proxy}/` } : {}),
            ...(this.agent ? { agent: this.agent } : {}),
            timeout: 10000,
        } as OptionsWithUri;

        const response = await rp(query);

        return response.body;
    }

    private returnInitError(error) {
        if (this.cli) {
            this.spinner.stop();
        }
        if (this.event) {
            this.emit('error', error);
        } else {
            throw error;
        }
    }

    /**
     * Extract new Tac value
     * @param {*} uri
     */
    private async extractTac(uri = 'https://www.tiktok.com/discover') {
        const query = {
            uri,
            method: 'GET',
            headers: {
                accept: 'application/json, text/plain, */*',
                referer: 'https://www.tiktok.com/',
            },
            gzip: true,
        };

        try {
            const response = await this.request<string>(query);
            const tacRegex = /<script>tac='([^]*)'<\/script>/.exec(response);
            if (tacRegex) {
                // eslint-disable-next-line prefer-destructuring
                this.tacValue = tacRegex[1];
            } else {
                throw new TypeError("Can't extract Tac value");
            }
        } catch (error) {
            this.returnInitError(error.message);
        }
    }

    /**
     * Initiate scraping process
     */
    // eslint-disable-next-line consistent-return
    public async scrape(): Promise<Result | any> {
        if (this.cli) {
            this.spinner.start();
        }

        if (!this.scrapeType || CONST.scrape.indexOf(this.scrapeType) === -1) {
            return this.returnInitError(`Missing scraping type. Scrape types: ${CONST.scrape} `);
        }
        if (this.scrapeType !== 'trend' && !this.input) {
            return this.returnInitError('Missing input');
        }

        await this.extractTac();

        if (this.tacValue) {
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

            return {
                collector: this.collector,
                ...(this.download ? { zip } : {}),
                ...(this.filetype === 'all' ? { json, csv } : {}),
                ...(this.filetype === 'json' ? { json } : {}),
                ...(this.filetype === 'csv' ? { csv } : {}),
            };
        }
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
                    this.extractVideoId(item.videoUrl)
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

    // eslint-disable-next-line class-methods-use-this
    private async extractVideoId(uri): Promise<string> {
        try {
            const result = await rp({ uri });
            const position = Buffer.from(result).indexOf('vid:');
            if (position !== -1) {
                const id = Buffer.from(result)
                    .slice(position + 4, position + 36)
                    .toString();
                return `https://api2.musical.ly/aweme/v1/playwm/?video_id=${id}`;
            }
            throw new Error(`Cant extract video id`);
        } catch (error) {
            return '';
        }
    }

    /**
     * Main loop that collects all required metadata from the tiktok web api
     */
    private mainLoop(): Promise<any> {
        return new Promise(resolve => {
            let arrayLength = this.number % 27 ? Math.ceil(this.number / 27) : Math.ceil(this.number / 27) + 1;
            if (!this.number) {
                arrayLength = 1000;
            }
            const taskArray = Array.from({ length: arrayLength }, (v, k) => k + 1);
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
                                .then(query => this.submitScrapingRequest(query, item === 1 ? 0 : (item - 1) * query.count))
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
    private async submitScrapingRequest(query, item): Promise<any> {
        try {
            const result = await this.scrapeData(query, item);

            if (result.statusCode !== 0) {
                throw new Error('No result');
            }

            await this.collectPosts(result.body.itemListData);

            if (!result.body.hasMore) {
                throw new Error('No more posts');
            }
            this.maxCursor = parseInt(result.body.maxCursor, 10);
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
                await this.Downloader.zipIt({
                    collector: this.collector,
                    filepath: this.filepath,
                    fileName: this.fileName(),
                    asyncDownload: this.asyncDownload,
                });
            }
        }
        let json = '';
        let csv = '';
        let zip = '';

        if (this.collector.length) {
            json = this.filepath ? `${this.filepath}/${this.fileName()}.json` : `${this.fileName()}.json`;
            csv = this.filepath ? `${this.filepath}/${this.fileName()}.csv` : `${this.fileName()}.csv`;
            zip = this.filepath ? `${this.filepath}/${this.fileName()}.zip` : `${this.fileName()}.zip`;

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
        if (this.cli) {
            this.spinner.stop();
        }
        return [json, csv, zip];
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
                const readFromStore = (await fromCallback(cb => readFile(`${this.tmpFolder}/tiktok_history.json`, { encoding: 'utf-8' }, cb))) as string;
                history = JSON.parse(readFromStore);
            } catch (error) {
                history[historyType] = {
                    type: this.scrapeType,
                    input: this.input,
                    downloaded_posts: 0,
                    last_change: new Date(),
                    file_location: `${this.tmpFolder}/${this.storeValue}.json`,
                };
            }

            if (!history[historyType]) {
                history[historyType] = {
                    type: this.scrapeType,
                    input: this.input,
                    downloaded_posts: 0,
                    last_change: new Date(),
                    file_location: `${this.tmpFolder}/${this.storeValue}.json`,
                };
            }
            let store: string[];
            try {
                const readFromStore = (await fromCallback(cb => readFile(`${this.tmpFolder}/${this.storeValue}.json`, { encoding: 'utf-8' }, cb))) as string;
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
                file_location: `${this.tmpFolder}/${this.storeValue}.json`,
            };

            try {
                await fromCallback(cb => writeFile(`${this.tmpFolder}/${this.storeValue}.json`, JSON.stringify(store), cb));
            } catch (error) {
                // continue regardless of error
            }

            try {
                await fromCallback(cb => writeFile(`${this.tmpFolder}/tiktok_history.json`, JSON.stringify(history), cb));
            } catch (error) {
                // continue regardless of error
            }
        }
    }

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
                    },
                    covers: {
                        default: posts[i].itemInfos.covers[0],
                        origin: posts[i].itemInfos.coversOrigin[0],
                        dynamic: posts[i].itemInfos.coversDynamic[0],
                    },
                    imageUrl: posts[i].itemInfos.coversOrigin[0],
                    videoUrl: posts[i].itemInfos.video.urls[0],
                    videoUrlNoWaterMark: '',
                    videoMeta: posts[i].itemInfos.video.videoMeta,
                    diggCount: posts[i].itemInfos.diggCount,
                    shareCount: posts[i].itemInfos.shareCount,
                    playCount: posts[i].itemInfos.playCount,
                    commentCount: posts[i].itemInfos.commentCount,
                    downloaded: false,
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

    private async scrapeData(qs: RequestQuery, maxCursor: number): Promise<ItemListData> {
        const shareUid = qs.type === 4 || qs.type === 5 ? '&shareUid=' : '';
        const signature = generateSignature(
            `${this.mainHost}share/item/list?secUid=${qs.secUid}&id=${qs.id}&type=${qs.type}&count=${qs.count}&minCursor=${
                qs.minCursor
            }&maxCursor=${maxCursor || 0}${shareUid}&lang=${qs.lang}`,
            this.userAgent,
            this.tacValue,
        );

        this.storeValue = this.scrapeType === 'trend' ? 'trend' : qs.id;

        const query = {
            uri: `${this.mainHost}share/item/list`,
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
            const response = await this.request<ItemListData>(query);

            if (response.statusCode === 0) {
                return response;
            }
            throw new Error('Not more posts');
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
            id: '',
            secUid: '',
            shareUid: '',
            lang: '',
            type: 5,
            count: 30,
            minCursor: 0,
        };
    }

    /**
     * Get music feed query
     */
    private async getMusicFeedQuery(): Promise<RequestQuery> {
        return {
            id: this.input,
            secUid: '',
            shareUid: '',
            lang: '',
            type: 4,
            count: 30,
            minCursor: 0,
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
                count: 30,
                minCursor: 0,
                lang: '',
            };
        }
        const query = {
            uri: `${this.mainHost}node/share/tag/${this.input}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request<ApiResponse<'challengeData', Challenge>>(query);
            if (response.statusCode !== 0 || !response.body.challengeData) {
                throw new Error(`Can not find the hashtag: ${this.input}`);
            }
            this.idStore = response.body.challengeData.challengeId;
            return {
                id: response.body.challengeData.challengeId,
                secUid: '',
                type: 3,
                count: 30,
                minCursor: 0,
                lang: '',
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
                type: 1,
                count: 30,
                minCursor: 0,
                lang: '',
            };
        }

        const query = {
            uri: `${this.mainHost}node/share/user/@${this.input}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request<ApiResponse<'userData', UserData>>(query);
            if (response.statusCode !== 0 || !response.body.userData) {
                throw new Error(`Can not find the user: ${this.input}`);
            }
            this.idStore = response.body.userData.userId;

            return {
                id: response.body.userData.userId,
                secUid: '',
                type: 1,
                count: 30,
                minCursor: 0,
                lang: '',
            };
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Get user profile information
     * @param {} username
     */
    public async getUserProfileInfo(): Promise<UserData> {
        if (!this.input) {
            throw `Username is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/user/@${this.input}`,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request<ApiResponse<'userData', UserData>>(query);
            if (response.statusCode !== 0 || !response.body.userData) {
                throw new Error(`Can't find user: ${this.input}`);
            }
            return response.body.userData;
        } catch (error) {
            throw error.message;
        }
    }

    /**
     * Get hashtag information
     * @param {} hashtag
     */
    public async getHashtagInfo(): Promise<Challenge> {
        if (!this.input) {
            throw `Hashtag is missing`;
        }
        const query = {
            uri: `${this.mainHost}node/share/tag/${this.input}`,
            method: 'GET',
            json: true,
        };

        try {
            const response = await this.request<ApiResponse<'challengeData', Challenge>>(query);
            if (response.statusCode !== 0 || !response.body.challengeData) {
                throw new Error(`Can't find hashtag: ${this.input}`);
            }
            return response.body.challengeData;
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
        await this.extractTac();

        return generateSignature(this.input, this.userAgent, this.tacValue);
    }

    /**
     * Get video url without the watermark
     * @param {}
     */
    public async getVideoMeta(): Promise<PostCollector> {
        if (!this.input) {
            throw `Url is missing`;
        }
        if (!/^https:\/\/www\.tiktok\.com\/@(\w.+)\/video\/(\d+)$/.test(this.input)) {
            throw `Bad url format. Correct format: https://www.tiktok.com/@USERNAME/video/ID`;
        }
        const query = {
            uri: this.input,
            method: 'GET',
            json: true,
        };
        try {
            const response = await this.request<string>(query);
            if (!response) {
                throw new Error(`Can't extract video meta data`);
            }
            const regex = /<script id="__NEXT_DATA__" type="application\/json" crossorigin="anonymous">([^]*)<\/script><script crossorigin="anonymous" nomodule=/.exec(
                response,
            );
            if (regex) {
                const videoProps = JSON.parse(regex[1]);
                let videoItem = {} as PostCollector;
                if (videoProps.props.pageProps.statusCode) {
                    throw new Error(`Can't find video: ${this.input}`);
                }
                videoItem = {
                    id: videoProps.props.pageProps.videoData.itemInfos.id,
                    text: videoProps.props.pageProps.videoData.itemInfos.text,
                    createTime: videoProps.props.pageProps.videoData.itemInfos.createTime,
                    authorMeta: {
                        id: videoProps.props.pageProps.videoData.itemInfos.authorId,
                        name: videoProps.props.pageProps.videoData.authorInfos.uniqueId,
                    },
                    musicMeta: {
                        musicId: videoProps.props.pageProps.videoData.musicInfos.musicId,
                        musicName: videoProps.props.pageProps.videoData.musicInfos.musicName,
                        musicAuthor: videoProps.props.pageProps.videoData.musicInfos.authorName,
                    },
                    imageUrl: videoProps.props.pageProps.videoData.itemInfos.coversOrigin[0],
                    videoUrl: videoProps.props.pageProps.videoData.itemInfos.video.urls[0],
                    videoUrlNoWaterMark: '',
                    videoMeta: videoProps.props.pageProps.videoData.itemInfos.video.videoMeta,
                    diggCount: videoProps.props.pageProps.videoData.itemInfos.diggCount,
                    shareCount: videoProps.props.pageProps.videoData.itemInfos.shareCount,
                    playCount: videoProps.props.pageProps.videoData.itemInfos.playCount,
                    commentCount: videoProps.props.pageProps.videoData.itemInfos.commentCount,
                    downloaded: false,
                    hashtags: videoProps.props.pageProps.videoData.challengeInfoList.map(({ challengeId, challengeName, text, coversLarger }) => ({
                        id: challengeId,
                        name: challengeName,
                        title: text,
                        cover: coversLarger,
                    })),
                } as PostCollector;

                try {
                    const video = await this.extractVideoId(videoItem.videoUrl);
                    videoItem.videoUrlNoWaterMark = video;
                } catch (error) {
                    // continue regardless of error
                }
                return videoItem;
            }
            throw new Error(`Can't extract video meta data`);
        } catch (error) {
            throw error.message;
        }
    }
}
