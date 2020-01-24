'use strict';

const rp = require('request-promise');
const request = require('request');
const { jar } = require('request');
const crypto = require('crypto');
const archiver = require('archiver');
const fs = require('fs');
const async = require('async');
const Json2csvParser = require('json2csv').Parser;
const ProgressBar = require('progress');
const ora = require('ora');
const Bluebird = require('Bluebird');
const EventEmitter = require('events');
const CONST = require('./constant');

const MultipleBar = require('./multipleBar');
const generateSignature = require('./signature');

class TikTokScraper extends EventEmitter {
    constructor({ download, filepath, filetype, proxy, asyncDownload, cli, event, timeout, progress, input, number, type }) {
        super();
        this._mainHost = 'https://www.tiktok.com/';
        this._mHost = 'https://m.tiktok.com/';
        this._userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:69.0) Gecko/20100101 Firefox/69.0';
        this._download = download;
        this._filepath = '' || filepath;
        this._mbars = new MultipleBar();
        this._json2csvParser = new Json2csvParser();
        this._filetype = filetype;
        this._input = input;
        this._proxy = proxy;
        this._number = number;
        this._asyncDownload = asyncDownload || 5;
        this._collector = [];
        this._date = Date.now();
        this._cookieJar = jar();
        this._event = event;
        this._timeout = timeout;
        this._scrapeType = type;
        this._progress = true || progress;
        this._progressBar = [];
        this._cli = cli;
        this._spinner = cli ? ora('TikTok Scraper Started').start() : '';
        this._hasNextPage = false;
    }

    _addBar(len) {
        this._progressBar.push(
            this._mbars.newBar('Downloading :id [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                width: 30,
                total: len,
            }),
        );

        return this._progressBar[this._progressBar.length - 1];
    }

    toBuffer(item) {
        return new Promise((resolve, reject) => {
            let r = request;
            let barIndex;
            let downloaded = 0;
            let buffer = Buffer.from('');
            if (this._proxy) {
                r = request.defaults({ proxy: `http://${this._proxy}/` });
            }
            r.get(item.videoUrl)
                .on('response', response => {
                    if (this._progress) {
                        barIndex = this._addBar(parseInt(response.headers['content-length']));
                    }
                })
                .on('data', chunk => {
                    buffer = Buffer.concat([buffer, chunk]);
                    if (this._progress) {
                        barIndex.tick(chunk.length, { id: item.id });
                    }
                })
                .on('end', () => {
                    resolve(buffer);
                })
                .on('error', () => {
                    reject(`Cant download media. If you were using proxy, please try without it.`);
                });
        });
    }

    zipIt() {
        return new Promise(async (resolve, reject) => {
            let zip = this._filepath ? `${this._filepath}/${this._scrapeType}_${this._date}.zip` : `${this._scrapeType}_${this._date}.zip`;
            let output = fs.createWriteStream(zip);
            let archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            archive.pipe(output);

            async.forEachLimit(
                this._collector,
                this._asyncDownload,
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

    _request({ uri, method, qs, body, form, headers, json, gzip }) {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await rp({
                    uri,
                    method,
                    ...(qs ? { qs } : {}),
                    ...(body ? { body } : {}),
                    ...(form ? { form } : {}),
                    headers: {
                        'User-Agent': this._userAgent,
                        ...headers,
                    },
                    ...(json ? { json: true } : {}),
                    ...(gzip ? { gzip: true } : {}),
                    jar: this._cookieJar,
                    resolveWithFullResponse: true,
                    ...(this._proxy ? { proxy: `https://${this._proxy}/` } : {}),
                    timeout: 10000,
                });

                if (this._timeout) {
                    setTimeout(() => {
                        resolve(response.body);
                    }, this._timeout);
                } else {
                    resolve(response.body);
                }
            } catch (error) {
                if (error.name === 'StatusCodeError') {
                    if (error.statusCode === 404) {
                        return reject({ message: 'Not found' });
                    }
                    reject(error.response.body);
                } else {
                    reject({ message: error.message ? error.message : 'Request error' });
                }
            }
        });
    }

    _scrape() {
        return new Promise(async (resolve, reject) => {
            if (!this._scrapeType || CONST.scrape.indexOf(this._scrapeType) === -1) {
                return reject(`Missing scraping type. Scrape types: ${CONST.scrape} `);
            }
            if (this._scrapeType !== 'trend' && !this._input) {
                return reject('Missing input');
            }

            let maxCursor = 0;
            let hasMore = true;

            while (true) {
                if (this._number) {
                    if (this._collector.length >= this._number) {
                        break;
                    }
                }

                try {
                    switch (this._scrapeType) {
                        case 'hashtag':
                            var result = await this._scrapeData(await this._getHashTagId(), maxCursor);
                            break;
                        case 'user':
                            var result = await this._scrapeData(await this._getUserId(), maxCursor);
                            break;
                        case 'trend':
                            var result = await this._scrapeData(
                                {
                                    id: '',
                                    secUid: '',
                                    shareUid: '',
                                    type: 5,
                                    count: 48,
                                    minCursor: 0,
                                },
                                maxCursor,
                            );
                            break;
                    }
                    await this._collectPosts(result.body.itemListData);

                    if (!result.body.hasMore) {
                        break;
                    } else {
                        maxCursor = result.body.maxCursor;
                    }
                } catch (error) {
                    if (this._event) {
                        return this.emit('error', error);
                    }
                    break;
                }
            }
            if (this._event) {
                return this.emit('done', 'completed');
            }

            if (!this._event) {
                try {
                    if (this._download) {
                        if (this._cli) {
                            this._spinner.stop();
                        }
                        await this.zipIt();
                    }

                    let json = this._filepath ? `${this._filepath}/${this._scrapeType}_${this._date}.json` : `${this._scrapeType}_${this._date}.json`;
                    let csv = this._filepath ? `${this._filepath}/${this._scrapeType}_${this._date}.csv` : `${this._scrapeType}_${this._date}.csv`;
                    let zip = this._filepath ? `${this._filepath}/${this._scrapeType}_${this._date}.zip` : `${this._scrapeType}_${this._date}.zip`;

                    if (this._collector.length) {
                        switch (this._filetype) {
                            case 'json':
                                await Bluebird.fromCallback(cb => fs.writeFile(json, JSON.stringify(this._collector), cb));
                                break;
                            case 'csv':
                                await Bluebird.fromCallback(cb => fs.writeFile(csv, this._json2csvParser.parse(this._collector), cb));
                                break;
                            case 'all':
                                await Promise.all([
                                    await Bluebird.fromCallback(cb => fs.writeFile(json, JSON.stringify(this._collector), cb)),
                                    await Bluebird.fromCallback(cb => fs.writeFile(csv, this._json2csvParser.parse(this._collector), cb)),
                                ]);
                                break;
                            default:
                                break;
                        }
                    }
                    if (this._cli) {
                        this._spinner.stop();
                    }

                    return resolve({
                        collector: this._collector,
                        ...(this._download ? { zip } : {}),
                        ...(this._filetype === 'all' ? { json, csv } : {}),
                        ...(this._filetype === 'json' ? { json } : {}),
                        ...(this._filetype === 'csv' ? { csv } : {}),
                    });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    _collectPosts(posts) {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < posts.length; i++) {
                if (this._number) {
                    if (this._collector.length >= this._number) {
                        break;
                    }
                }
                let item = {
                    id: posts[i].itemInfos.id,
                    text: posts[i].itemInfos.text,
                    createTime: posts[i].itemInfos.createTime,
                    authorId: posts[i].itemInfos.authorId,
                    musicId: posts[i].itemInfos.musicId,
                    videoUrl: posts[i].itemInfos.video.urls[0],
                    diggCount: posts[i].itemInfos.diggCount,
                    shareCount: posts[i].itemInfos.shareCount,
                    commentCount: posts[i].itemInfos.commentCount,
                };

                if (this._event) {
                    this.emit('data', item);
                    this._collector.push('');
                } else {
                    this._collector.push(item);
                }
            }
            resolve();
        });
    }
    _scrapeData(qs, maxCursor) {
        return new Promise(async (resolve, reject) => {
            let _signature = generateSignature(
                `https://www.tiktok.com/share/item/list?secUid=${qs.secUid}&id=${qs.id}&type=${qs.type}&count=${qs.count}&minCursor=${
                    qs.minCursor
                }&maxCursor=${maxCursor || 0}`,
            );
            let query = {
                uri: `${this._mainHost}share/item/list`,
                method: 'GET',
                qs: {
                    ...qs,
                    _signature,
                    maxCursor,
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    referer: 'https://www.tiktok.com/',
                },
                json: true,
            };
            try {
                let body = await this._request(query);
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

    // Start Get Id's
    _getIds({ uri, type }) {
        return new Promise(async (resolve, reject) => {
            let query = {
                uri,
                method: 'GET',
            };
            try {
                let body = await this._request(query);
                body = JSON.parse(body.split('<script id="__NEXT_DATA__" type="application/json" crossorigin="anonymous">')[1].split('</script>')[0]);
                if (type === 'user') {
                    if (body.props.pageProps.statusCode !== 0) {
                        return reject({ message: `Can't find anything` });
                    }
                    resolve({
                        id: body.props.pageProps.userData.userId,
                        secUid: body.props.pageProps.userData.secUid,
                        type: 1,
                        count: 48,
                        minCursor: 0,
                    });
                }
                if (type === 'hashtag') {
                    if (body.props.pageProps.statusCode !== 0) {
                        return reject({ message: `Can't find anything.` });
                    }

                    resolve({
                        id: body.props.pageProps.challengeData.challengeId,
                        secUid: '',
                        type: 3,
                        count: 48,
                        minCursor: -1,
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    _getHashTagId() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    this._getIds({
                        uri: `${this._mainHost}tag/${this._input}`,
                        type: 'hashtag',
                    }),
                );
            } catch (error) {
                reject(error);
            }
        });
    }
    _getUserId() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(
                    this._getIds({
                        uri: `${this._mainHost}@${this._input}`,
                        type: 'user',
                    }),
                );
            } catch (error) {
                reject(error);
            }
        });
    }
    // End Get ID's
}

module.exports = TikTokScraper;
