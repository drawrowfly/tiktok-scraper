/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import request, { OptionsWithUri } from 'request';
import rp from 'request-promise';
import { Agent } from 'http';
import { createWriteStream, writeFile } from 'fs';
import { fromCallback } from 'bluebird';
import archiver from 'archiver';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { forEachLimit } from 'async';

import { MultipleBar } from '../helpers';
import { DownloaderConstructor, PostCollector, DownloadParams, Proxy } from '../types';

export class Downloader {
    public progress: boolean;

    public mbars: MultipleBar;

    public progressBar: any[];

    private proxy: string[] | string;

    public noWaterMark: boolean;

    public userAgent: string;

    public filepath: string;

    public bulk: boolean;

    constructor({ progress, proxy, noWaterMark, userAgent, filepath, bulk }: DownloaderConstructor) {
        this.progress = true || progress;
        this.progressBar = [];
        this.noWaterMark = noWaterMark;
        this.userAgent = userAgent;
        this.filepath = filepath;
        this.mbars = new MultipleBar();
        this.proxy = proxy;
        this.bulk = bulk;
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
     * Add new bar to indicate download progress
     * @param {number} len
     */
    public addBar(type: boolean, len: number): any[] {
        this.progressBar.push(
            this.mbars.newBar(`Downloading (${!type ? 'WITH WM' : 'WITHOUT WM'}) :id [:bar] :percent`, {
                complete: '=',
                incomplete: ' ',
                width: 30,
                total: len,
            }),
        );

        return this.progressBar[this.progressBar.length - 1];
    }

    /**
     * Convert video file to the buffer
     * @param {*} item
     */
    public toBuffer(item: PostCollector): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const proxy = this.getProxy;
            let r = request;
            let barIndex;
            let buffer = Buffer.from('');
            if (proxy.proxy && !proxy.socks) {
                r = request.defaults({ proxy: `http://${proxy.proxy}/` });
            }
            if (proxy.proxy && proxy.socks) {
                r = request.defaults({ agent: (proxy.proxy as unknown) as Agent });
            }

            r.get({
                url: item.videoUrlNoWaterMark ? item.videoUrlNoWaterMark : item.videoUrl,
                headers: {
                    'user-agent': 'okhttp',
                    referer: 'https://www.tiktok.com/',
                },
            })
                .on('response', response => {
                    if (this.progress && !this.bulk) {
                        barIndex = this.addBar(!!item.videoUrlNoWaterMark, parseInt(response.headers['content-length'] as string, 10));
                    }
                })
                .on('data', chunk => {
                    buffer = Buffer.concat([buffer, chunk as Buffer]);
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

    /**
     * Download posts
     * if {zip} is true then zip the result else save posts to the {folder}
     */
    public downloadPosts({ zip, folder, collector, fileName, asyncDownload }: DownloadParams) {
        return new Promise((resolve, reject) => {
            const saveDestination = zip ? `${fileName}.zip` : folder;
            const archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            if (zip) {
                const output = createWriteStream(saveDestination);
                archive.pipe(output);
            }

            forEachLimit(
                collector,
                asyncDownload,
                (item: PostCollector, cb) => {
                    this.toBuffer(item)
                        .then(async buffer => {
                            item.downloaded = true;
                            if (zip) {
                                archive.append(buffer, { name: `${item.id}.mp4` });
                            } else {
                                await fromCallback(cback => writeFile(`${saveDestination}/${item.id}.mp4`, buffer, cback));
                            }
                            cb(null);
                        })
                        .catch(() => {
                            item.downloaded = false;
                            cb(null);
                        });
                },
                error => {
                    if (error) {
                        return reject(error);
                    }

                    if (zip) {
                        archive.finalize();
                        archive.on('end', () => resolve());
                    } else {
                        resolve();
                    }
                },
            );
        });
    }

    /**
     * Download single video without the watermark
     * @param post
     */
    public async downloadSingleVideo(post: PostCollector) {
        const proxy = this.getProxy;
        let url = post.videoUrlNoWaterMark;
        if (!url) {
            url = post.videoUrl;
        }
        const options = ({
            uri: url,
            headers: {
                'user-agent': 'okhttp',
                referer: 'https://www.tiktok.com/',
            },
            encoding: null,
            ...(proxy.proxy && proxy.socks ? { agent: proxy.proxy } : {}),
            ...(proxy.proxy && !proxy.socks ? { proxy: `http://${proxy.proxy}/` } : {}),
        } as unknown) as OptionsWithUri;

        const result = await rp(options);

        await fromCallback(cb => writeFile(`${this.filepath}/${post.id}.mp4`, result, cb));
    }
}
