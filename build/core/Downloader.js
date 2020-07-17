"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader = void 0;
const request_1 = __importDefault(require("request"));
const request_promise_1 = __importDefault(require("request-promise"));
const fs_1 = require("fs");
const bluebird_1 = require("bluebird");
const archiver_1 = __importDefault(require("archiver"));
const socks_proxy_agent_1 = require("socks-proxy-agent");
const async_1 = require("async");
const helpers_1 = require("../helpers");
class Downloader {
    constructor({ progress, proxy, noWaterMark, userAgent, filepath, bulk }) {
        this.progress = true || progress;
        this.progressBar = [];
        this.noWaterMark = noWaterMark;
        this.userAgent = userAgent;
        this.filepath = filepath;
        this.mbars = new helpers_1.MultipleBar();
        this.proxy = proxy;
        this.bulk = bulk;
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
    addBar(len) {
        this.progressBar.push(this.mbars.newBar('Downloading :id [:bar] :percent', {
            complete: '=',
            incomplete: ' ',
            width: 30,
            total: len,
        }));
        return this.progressBar[this.progressBar.length - 1];
    }
    toBuffer(item) {
        return new Promise((resolve, reject) => {
            const proxy = this.getProxy;
            let r = request_1.default;
            let barIndex;
            let buffer = Buffer.from('');
            if (proxy.proxy && !proxy.socks) {
                r = request_1.default.defaults({ proxy: `http://${proxy.proxy}/` });
            }
            if (proxy.proxy && proxy.socks) {
                r = request_1.default.defaults({ agent: proxy.proxy });
            }
            r.get({
                url: item.videoUrlNoWaterMark ? item.videoUrlNoWaterMark : item.videoUrl,
                headers: {
                    'user-agent': 'okhttp',
                },
            })
                .on('response', response => {
                if (this.progress && !this.bulk) {
                    barIndex = this.addBar(parseInt(response.headers['content-length'], 10));
                }
            })
                .on('data', chunk => {
                buffer = Buffer.concat([buffer, chunk]);
                if (this.progress && !this.bulk) {
                    barIndex.tick(chunk.length, { id: item.id });
                }
            })
                .on('end', () => {
                resolve(buffer);
            })
                .on('error', () => {
                reject(new Error(`Cant download video: ${item.id}. If you were using proxy, please try without it.`));
            });
        });
    }
    downloadPosts({ zip, folder, collector, fileName, asyncDownload }) {
        return new Promise((resolve, reject) => {
            const saveDestination = zip ? `${fileName}.zip` : folder;
            const archive = archiver_1.default('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            if (zip) {
                const output = fs_1.createWriteStream(saveDestination);
                archive.pipe(output);
            }
            async_1.forEachLimit(collector, asyncDownload, (item, cb) => {
                this.toBuffer(item)
                    .then(async (buffer) => {
                    item.downloaded = true;
                    if (zip) {
                        archive.append(buffer, { name: `${item.id}.mp4` });
                    }
                    else {
                        await bluebird_1.fromCallback(cback => fs_1.writeFile(`${saveDestination}/${item.id}.mp4`, buffer, cback));
                    }
                    cb(null);
                })
                    .catch(() => {
                    item.downloaded = false;
                    cb(null);
                });
            }, error => {
                if (error) {
                    return reject(error);
                }
                if (zip) {
                    archive.finalize();
                    archive.on('end', () => resolve());
                }
                else {
                    resolve();
                }
            });
        });
    }
    async downloadSingleVideo(post) {
        const proxy = this.getProxy;
        const options = Object.assign(Object.assign({ uri: post.videoUrlNoWaterMark, encoding: null }, (proxy.proxy && proxy.socks ? { agent: proxy.proxy } : {})), (proxy.proxy && !proxy.socks ? { proxy: `http://${proxy.proxy}/` } : {}));
        try {
            const result = await request_promise_1.default(options);
            await bluebird_1.fromCallback(cb => fs_1.writeFile(`${this.filepath}/${post.id}.mp4`, result, cb));
        }
        catch (error) {
            throw error.message;
        }
    }
}
exports.Downloader = Downloader;
