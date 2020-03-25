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

import { PostCollector, ScrapeType, TikTokConstructor, Result, ItemListData, ApiResponse, Challenge, UserData, RequestQuery, Item } from '../types';

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

    private collector: PostCollector[];

    private date: number;

    private event: boolean;

    private scrapeType: ScrapeType;

    private cli: boolean;

    private spinner: Ora;

    private byUserId: boolean;

    private storeHistory: boolean;

    private tmpFolder: string;

    private fileName: string;

    private idStore: string;

    private Downloader: Downloader;

    private tacValue: string = '';

    private storeValue: string = '';

    private test: boolean = false;

    private noWaterMark: boolean;

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
        userAgent,
        test = false,
        noWaterMark = false,
    }: TikTokConstructor) {
        super();
        this.mainHost = 'https://m.tiktok.com/';
        this.userAgent = userAgent || CONST.userAgent;
        this.download = download;
        this.filepath = '' || filepath;
        this.json2csvParser = new Parser();
        this.filetype = filetype;
        this.input = input;
        this.agent = proxy && proxy.indexOf('socks') > -1 ? new SocksProxyAgent(proxy) : '';
        this.proxy = proxy && proxy.indexOf('socks') === -1 ? proxy : '';
        this.number = number;
        this.asyncDownload = asyncDownload || 5;
        this.collector = [];
        this.date = Date.now();
        this.event = event;
        this.scrapeType = type;
        this.cli = cli;
        this.spinner = ora('TikTok Scraper Started');
        this.byUserId = by_user_id;
        this.storeHistory = cli && download && store_history;
        this.tmpFolder = tmpdir();
        this.fileName = `${this.scrapeType}_${this.date}`;
        this.idStore = '';
        this.test = test;
        this.noWaterMark = noWaterMark;
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
                    rp({
                        uri: item.videoUrl,
                    })
                        .then(result => {
                            const position = Buffer.from(result).indexOf('vid:');
                            if (position !== -1) {
                                const id = Buffer.from(result)
                                    .slice(position + 4, position + 36)
                                    .toString();
                                // eslint-disable-next-line no-param-reassign
                                item.videoUrlNoWaterMark = `https://api2.musical.ly/aweme/v1/playwm/?video_id=${id}`;
                            }
                            cb(null);
                        })
                        .catch(() => {
                            cb('Error');
                        });
                },
                () => {
                    resolve();
                },
            );
        });
    }

    /**
     * Main loop that collects all required information from the tiktok web
     * This methods is inefficient needs to be replaced in the future. Preferably without async await in the loop
     */
    // eslint-disable-next-line consistent-return
    private async mainLoop() {
        let maxCursor = '0';

        while (true) {
            if (this.number) {
                if (this.collector.length >= this.number) {
                    break;
                }
            }

            try {
                let result = {} as ItemListData;
                switch (this.scrapeType) {
                    case 'hashtag':
                        this.fileName = `${this.input}_${Date.now()}`;
                        result = await this.scrapeData(
                            this.idStore
                                ? {
                                      id: this.idStore,
                                      secUid: '',
                                      type: 3,
                                      count: 48,
                                      minCursor: 0,
                                      lang: '',
                                  }
                                : await this.getHashTagId(),
                            maxCursor,
                        );
                        break;
                    case 'user':
                        this.fileName = `${this.input}_${Date.now()}`;
                        result = await this.scrapeData(
                            this.byUserId || this.idStore
                                ? {
                                      id: this.idStore ? this.idStore : this.input,
                                      secUid: '',
                                      type: 1,
                                      count: 48,
                                      minCursor: 0,
                                      lang: '',
                                  }
                                : await this.getUserId(),
                            maxCursor,
                        );
                        break;
                    case 'trend':
                        result = await this.scrapeData(
                            {
                                id: '',
                                secUid: '',
                                shareUid: '',
                                lang: '',
                                type: 5,
                                count: 30,
                                minCursor: 0,
                            },
                            maxCursor,
                        );
                        break;
                    case 'music':
                        result = await this.scrapeData(
                            {
                                id: this.input,
                                secUid: '',
                                shareUid: '',
                                lang: '',
                                type: 4,
                                count: 30,
                                minCursor: 0,
                            },
                            maxCursor,
                        );
                        break;
                    default:
                        break;
                }

                if (result.statusCode !== 0) {
                    break;
                }
                await this.collectPosts(result.body.itemListData);

                if (!result.body.hasMore) {
                    break;
                } else {
                    maxCursor = result.body.maxCursor;
                }
            } catch (error) {
                if (this.event) {
                    return this.emit('error', error);
                }
                break;
            }
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
                    fileName: this.fileName,
                    asyncDownload: this.asyncDownload,
                });
            }
        }
        let json = '';
        let csv = '';
        let zip = '';

        if (this.collector.length) {
            json = this.filepath ? `${this.filepath}/${this.fileName}.json` : `${this.fileName}.json`;
            csv = this.filepath ? `${this.filepath}/${this.fileName}.csv` : `${this.fileName}.csv`;
            zip = this.filepath ? `${this.filepath}/${this.fileName}.zip` : `${this.fileName}.zip`;

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
        if (this.storeValue) {
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

            try {
                await fromCallback(cb => writeFile(`${this.tmpFolder}/${this.storeValue}.json`, JSON.stringify(store), cb));
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
            const item = {
                id: posts[i].itemInfos.id,
                text: posts[i].itemInfos.text,
                createTime: posts[i].itemInfos.createTime,
                authorId: posts[i].itemInfos.authorId,
                authorName: posts[i].authorInfos.uniqueId,
                authorFollowing: posts[i].authorStats.followingCount,
                authorFans: posts[i].authorStats.followerCount,
                authorHeart: posts[i].authorStats.heartCount,
                authorVideo: posts[i].authorStats.videoCount,
                authorDigg: posts[i].authorStats.diggCount,
                authorVerified: posts[i].authorInfos.verified,
                authorPrivate: posts[i].authorInfos.isSecret,
                authorSignature: posts[i].authorInfos.signature,
                musicId: posts[i].itemInfos.musicId,
                musicName: posts[i].musicInfos.musicName,
                musicAuthor: posts[i].musicInfos.authorName,
                musicOriginal: posts[i].musicInfos.original,
                imageUrl: posts[i].itemInfos.coversOrigin[0],
                videoUrl: posts[i].itemInfos.video.urls[0],
                videoUrlNoWaterMark: '',
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

    private async scrapeData(qs: RequestQuery, maxCursor: string): Promise<ItemListData> {
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
                maxCursor: 0 || maxCursor,
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
            return response;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Get hashtag ID
     */
    private async getHashTagId(): Promise<RequestQuery> {
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
                count: 48,
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
    async getUserProfileInfo(): Promise<UserData> {
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
    async getHashtagInfo(): Promise<Challenge> {
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
    async signUrl() {
        if (!this.input) {
            throw `Url is missing`;
        }
        await this.extractTac();

        return generateSignature(this.input, this.userAgent, this.tacValue);
    }
}
