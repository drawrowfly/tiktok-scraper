/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-async-promise-executor */

const rp = require('request-promise');
const request = require('request');
const { jar } = require('request');
const { tmpdir } = require('os');
const archiver = require('archiver');
const { writeFile, readFile, createWriteStream } = require('fs');
const { forEachLimit } = require('async');
const Json2csvParser = require('json2csv').Parser;
const ora = require('ora');
const { fromCallback } = require('bluebird');
const EventEmitter = require('events');

const CONST = require('./constant');
const MultipleBar = require('./helpers/multipleBar');
const generateSignature = require('./helpers/signature');

class TikTokScraper extends EventEmitter {
    constructor({
        download,
        filepath,
        filetype,
        proxy,
        asyncDownload,
        cli,
        event,
        timeout,
        progress,
        input,
        number,
        type,
        by_user_id = false,
        user_data = false,
        store_history = false,
    }) {
        super();
        this.mainHost = 'https://www.tiktok.com/';
        this.mHost = 'https://m.tiktok.com/';
        this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:73.0) Gecko/20100101 Firefox/73.0';
        this.download = download;
        this.filepath = '' || filepath;
        this.mbars = new MultipleBar();
        this.json2csvParser = new Json2csvParser();
        this.filetype = filetype;
        this.input = input;
        this.proxy = proxy;
        this.number = number;
        this.asyncDownload = asyncDownload || 5;
        this.collector = [];
        this.date = Date.now();
        this.cookieJar = jar();
        this.event = event;
        this.timeout = timeout;
        this.scrapeType = type;
        this.progress = true || progress;
        this.progressBar = [];
        this.cli = cli;
        this.spinner = cli ? ora('TikTok Scraper Started').start() : '';
        this.hasNextPage = false;
        // eslint-disable-next-line camelcase
        this.by_user_id = by_user_id;
        // eslint-disable-next-line camelcase
        this.user_data = user_data;
        this.rate_limit_count = 0;
        this.rate_limit = Date.now();
        // eslint-disable-next-line camelcase
        this.store_history = cli && download && store_history;
        this.tmp_folder = tmpdir();
        this.file_name = `${this.scrapeType}_${this.date}`;
    }

    /**
     * CLI progress bar
     * @param {*} len
     */
    addBar(len) {
        this.progressBar.push(
            this.mbars.newBar('Downloading :id [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                width: 30,
                total: len,
            }),
        );

        return this.progressBar[this.progressBar.length - 1];
    }

    /**
     * Convert video file to a buffer
     * @param {*} item
     */
    toBuffer(item) {
        return new Promise((resolve, reject) => {
            let r = request;
            let barIndex;
            let buffer = Buffer.from('');
            if (this.proxy) {
                r = request.defaults({ proxy: `http://${this.proxy}/` });
            }
            r.get(item.videoUrl)
                .on('response', response => {
                    if (this.progress) {
                        barIndex = this.addBar(parseInt(response.headers['content-length'], 10));
                    }
                })
                .on('data', chunk => {
                    buffer = Buffer.concat([buffer, chunk]);
                    if (this.progress) {
                        barIndex.tick(chunk.length, { id: item.id });
                    }
                })
                .on('end', () => {
                    resolve(buffer);
                })
                .on('error', () => {
                    reject(new Error('Cant download media. If you were using proxy, please try without it.'));
                });
        });
    }

    /**
     * Download and ZIP video files
     */
    zipIt() {
        return new Promise((resolve, reject) => {
            const zip = this.filepath ? `${this.filepath}/${this.file_name}.zip` : `${this.file_name}.zip`;
            const output = createWriteStream(zip);
            const archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            archive.pipe(output);

            forEachLimit(
                this.collector,
                this.asyncDownload,
                (item, cb) => {
                    this.toBuffer(item)
                        .then(buffer => {
                            archive.append(buffer, { name: `${item.id}.mp4` });
                            cb(null);
                        })
                        .catch(error => {
                            cb(error);
                        });
                },
                error => {
                    if (error) {
                        return reject(error);
                    }

                    archive.finalize();
                    archive.on('end', () => resolve());
                },
            );
        });
    }

    /**
     * Main request method
     * @param {*} object
     */
    request({ uri, method, qs, body, form, headers, json, gzip }) {
        return new Promise(async (resolve, reject) => {
            const query = {
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
                jar: this.cookieJar,
                resolveWithFullResponse: true,
                ...(this.proxy ? { proxy: `https://${this.proxy}/` } : {}),
                timeout: 10000,
            };
            try {
                const response = await rp(query);

                if (this.timeout) {
                    setTimeout(() => {
                        return resolve(response.body);
                    }, this.timeout);
                } else {
                    return resolve(response.body, response.headers['content-type']);
                }
            } catch (error) {
                if (error.name === 'StatusCodeError') {
                    if (error.statusCode === 404) {
                        return reject(new Error({ message: 'Not found' }));
                    }
                    return reject(new Error(error.response.body));
                }
                return reject(new Error({ message: error.message ? error.message : 'Request error' }));
            }
        });
    }

    /**
     * Collect tiktok user profile information
     */
    collectUserProfileInformation() {
        return new Promise(resolve => {
            const store = {};
            if (this.rate_limit > Date.now()) {
                return resolve();
            }

            forEachLimit(
                this.collector,
                this.asyncDownload,
                (item, cb) => {
                    if (this.rate_limit > Date.now()) {
                        return cb(null);
                    }

                    if (store[item.authorName]) {
                        const { following, fans, heart, video, digg, verified } = store[item.authorName];
                        item.authorFollowing = following;
                        item.authorFans = fans;
                        item.authorHeart = heart;
                        item.authorVideo = video;
                        item.authorDigg = digg;
                        item.authorVerified = verified;
                        cb(null);
                    } else {
                        this.request({
                            method: 'GET',
                            uri: `${this.mainHost}/node/share/user/@${item.authorName}`,
                            headers: {
                                'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_${Math.floor(
                                    Math.random() * (15 - 10) + 10,
                                )}_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * (79 - 70) + 70)}.0.3945.117 Safari/537.36`,
                            },
                            json: true,
                        })
                            .then(response => {
                                const { statusCode, body } = response;
                                if (statusCode !== 0) {
                                    this.rate_limit_count += 1;
                                    if (this.rate_limit_count > 3) {
                                        this.rate_limit_count = 0;
                                        this.rate_limit = Date.now() + 60000 * 5;
                                    }
                                } else {
                                    const { following, fans, heart, video, digg, verified } = body.userData;
                                    item.authorFollowing = following;
                                    item.authorFans = fans;
                                    item.authorHeart = heart;
                                    item.authorVideo = video;
                                    item.authorDigg = digg;
                                    item.authorVerified = verified;
                                }
                                cb(null);
                            })
                            .catch(() => {
                                cb(null);
                            });
                    }
                },
                () => {
                    resolve();
                },
            );
        });
    }

    returnInitError(error) {
        if (this.cli) {
            this.spinner.stop();
        }
        if (this.event) {
            return this.emit('error', error);
        }
        throw new Error(error);
    }

    /**
     * Initiate scraping process
     */
    async scrape() {
        if (!this.scrapeType || CONST.scrape.indexOf(this.scrapeType) === -1) {
            return this.returnInitError(`Missing scraping type. Scrape types: ${CONST.scrape} `);
        }
        if (this.scrapeType !== 'trend' && !this.input) {
            return this.returnInitError('Missing input');
        }

        await this.mainLoop();

        if (this.user_data) {
            await this.collectUserProfileInformation();
        }

        if (this.event) {
            return this.emit('done', 'completed');
        }

        if (this.store_history) {
            await this.storeDownlodProgress();
        }

        try {
            const [json, csv, zip] = await this.saveCollectorData();

            return {
                collector: this.collector,
                ...(this.download ? { zip } : {}),
                ...(this.filetype === 'all' ? { json, csv } : {}),
                ...(this.filetype === 'json' ? { json } : {}),
                ...(this.filetype === 'csv' ? { csv } : {}),
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Main loop that collects all required information from the tiktok web
     * This methods is inefficient needs to be replaced in the future. Preferably without async await in the loop
     */
    async mainLoop() {
        let maxCursor = 0;
        while (true) {
            if (this.number) {
                if (this.collector.length >= this.number) {
                    break;
                }
            }

            try {
                let result;
                switch (this.scrapeType) {
                    case 'hashtag':
                        this.file_name = `${this.input}_${Date.now()}`;
                        result = await this.scrapeData(await this.getHashTagId(), maxCursor);
                        break;
                    case 'user':
                        this.file_name = `${this.input}_${Date.now()}`;
                        result = await this.scrapeData(
                            this.by_user_id
                                ? {
                                      id: this.input,
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
    async saveCollectorData() {
        if (this.download) {
            if (this.cli) {
                this.spinner.stop();
            }
            if (this.collector.length) {
                await this.zipIt();
            }
        }
        let json = '';
        let csv = '';
        let zip = '';

        if (this.collector.length) {
            json = this.filepath ? `${this.filepath}/${this.file_name}.json` : `${this.file_name}.json`;
            csv = this.filepath ? `${this.filepath}/${this.file_name}.csv` : `${this.file_name}.csv`;
            zip = this.filepath ? `${this.filepath}/${this.file_name}.zip` : `${this.file_name}.zip`;

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
     */
    async storeDownlodProgress() {
        if (this.store_value) {
            let store = [];
            try {
                store = await fromCallback(cb => readFile(`${this.tmp_folder}/${this.store_value}.json`, { encoding: 'utf-8' }, cb));
                store = JSON.parse(store);
            } catch (error) {
                store = [];
            }

            this.collector = this.collector.map(item => {
                if (store.indexOf(item.id) === -1) {
                    store.push(item.id);
                } else {
                    item.repeated = true;
                }
                return item;
            });
            this.collector = this.collector.filter(item => !item.repeated);

            try {
                await fromCallback(cb => writeFile(`${this.tmp_folder}/${this.store_value}.json`, JSON.stringify(store), cb));
            } catch (error) {
                // continue regardless of error
            }
        }
    }

    collectPosts(posts) {
        return new Promise(async resolve => {
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
                    authorFollowing: 0,
                    authorFans: 0,
                    authorHeart: 0,
                    authorVideo: 0,
                    authorDigg: 0,
                    authorVerified: '',
                    musicId: posts[i].itemInfos.musicId,
                    musicName: posts[i].musicInfos.musicName,
                    musicAuthor: posts[i].musicInfos.authorName,
                    musicOriginal: posts[i].musicInfos.original,
                    videoUrl: posts[i].itemInfos.video.urls[0],
                    diggCount: posts[i].itemInfos.diggCount,
                    shareCount: posts[i].itemInfos.shareCount,
                    playCount: posts[i].itemInfos.playCount,
                    commentCount: posts[i].itemInfos.commentCount,
                };

                if (this.event) {
                    this.emit('data', item);
                    this.collector.push('');
                } else {
                    this.collector.push(item);
                }
            }
            resolve();
        });
    }

    scrapeData(qs, maxCursor) {
        return new Promise(async (resolve, reject) => {
            const shareUid = qs.type === 4 || qs.type === 5 ? '&shareUid=' : '';
            const signature = generateSignature(
                `${this.mHost}share/item/list?secUid=${qs.secUid}&id=${qs.id}&type=${qs.type}&count=${qs.count}&minCursor=${
                    qs.minCursor
                }&maxCursor=${maxCursor || 0}${shareUid}&lang=${qs.lang}`,
                this.userAgent,
            );

            this.store_value = this.scrapeType === 'trend' ? 'trend' : qs.id;

            const query = {
                uri: `${this.mHost}share/item/list`,
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
                const body = await this.request(query);
                if (body.statusCode === 0) {
                    resolve(body);
                } else {
                    reject(body);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get hashtag ID
     */
    getHashTagId() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    this.getIds({
                        uri: `${this.mainHost}node/share/tag/${this.input}`,
                        type: 'hashtag',
                    }),
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get user ID
     */
    getUserId() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    this.getIds({
                        uri: `${this.mainHost}node/share/user/@${this.input}`,
                        type: 'user',
                    }),
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     *
     * @param {uri, type} object
     * Get hastag and user ID
     */
    getIds({ uri, type }) {
        return new Promise(async (resolve, reject) => {
            const query = {
                uri,
                method: 'GET',
                json: true,
            };
            try {
                const response = await this.request(query);
                if (response.statusCode !== 0) {
                    return reject(new Error({ message: "Can't find anything" }));
                }
                if (type === 'user') {
                    resolve({
                        id: response.body.userData.userId,
                        secUid: '',
                        type: 1,
                        count: 48,
                        minCursor: 0,
                        lang: '',
                    });
                }
                if (type === 'hashtag') {
                    resolve({
                        id: response.body.challengeData.challengeId,
                        secUid: '',
                        type: 3,
                        count: 48,
                        minCursor: 0,
                        lang: '',
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = TikTokScraper;
