/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import request from 'request';
import rp from 'request-promise';
import { Agent } from 'http';
import { createWriteStream, writeFile } from 'fs';
import { fromCallback } from 'bluebird';
import archiver from 'archiver';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { forEachLimit } from 'async';

import { MultipleBar } from '../helpers';
import { DownloaderConstructor, PostCollector, ZipValues } from '../types';

export class Downloader {
    public progress: boolean;

    public mbars: MultipleBar;

    public progressBar: any[];

    public proxy: string;

    public agent: Agent | string;

    public test: boolean;

    public noWaterMark: boolean;

    public userAgent: string;

    constructor({ progress, proxy, test, noWaterMark, userAgent }: DownloaderConstructor) {
        this.progress = true || progress;
        this.progressBar = [];
        this.test = test;
        this.noWaterMark = noWaterMark;
        this.userAgent = userAgent;
        this.mbars = new MultipleBar();
        this.agent = proxy && proxy.indexOf('socks') > -1 ? new SocksProxyAgent(proxy) : '';
        this.proxy = proxy && proxy.indexOf('socks') === -1 ? proxy : '';
    }

    /**
     * Add new bard to indicate download progress
     * @param {number} len
     */
    public addBar(len: number): any[] {
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
    public toBuffer(item: PostCollector): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            let r = request;
            let barIndex;
            let buffer = Buffer.from('');
            if (this.proxy) {
                r = request.defaults({ proxy: `http://${this.proxy}/` });
            }
            if (this.agent) {
                r = request.defaults({ agent: this.agent as Agent });
            }
            r.get({
                url: this.noWaterMark ? item.videoUrlNoWaterMark || item.videoUrl : item.videoUrl,
                headers: {
                    'user-agent': this.userAgent,
                },
            })
                .on('response', response => {
                    if (this.progress && !this.test) {
                        barIndex = this.addBar(parseInt(response.headers['content-length'] as string, 10));
                    }
                })
                .on('data', chunk => {
                    buffer = Buffer.concat([buffer, chunk as Buffer]);
                    if (this.progress && !this.test) {
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
     * Download and ZIP video files
     */
    public zipIt({ collector, filepath, fileName, asyncDownload }: ZipValues) {
        return new Promise((resolve, reject) => {
            const zip = filepath ? `${filepath}/${fileName}.zip` : `${fileName}.zip`;
            const output = createWriteStream(zip);
            const archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            archive.pipe(output);

            forEachLimit(
                collector,
                asyncDownload,
                (item: PostCollector, cb) => {
                    this.toBuffer(item)
                        .then(buffer => {
                            item.downloaded = true;
                            archive.append(buffer, { name: `${item.id}.mp4` });
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

                    archive.finalize();
                    archive.on('end', () => resolve());
                },
            );
        });
    }

    public async downloadSingleVideo(post: PostCollector) {
        const query = {
            uri: post.videoUrlNoWaterMark,
            headers: {
                'user-agent': this.userAgent,
            },
            encoding: null,
        };
        try {
            const result = await rp(query);

            await fromCallback(cb => writeFile(`${post.id}.mp4`, result, cb));
        } catch (error) {
            throw error.message;
        }
    }
}
