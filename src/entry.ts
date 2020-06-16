/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-throw-literal */
/* eslint-disable no-restricted-syntax */
import { tmpdir } from 'os';
import { readFile, writeFile, unlink } from 'fs';
import { fromCallback } from 'bluebird';
import { forEachLimit } from 'async';
import { TikTokScraper } from './core';
import { TikTokConstructor, Options, ScrapeType, Result, UserData, Challenge, PostCollector, History, HistoryItem } from './types';
import CONST from './constant';

const INIT_OPTIONS = {
    number: 20,
    download: false,
    zip: false,
    asyncDownload: 5,
    asyncScraping: 3,
    proxy: [],
    filepath: process.cwd(),
    filetype: 'na',
    progress: false,
    event: false,
    by_user_id: false,
    noWaterMark: false,
    hdVideo: false,
    timeout: 0,
    userAgent: CONST.userAgentList[Math.floor(Math.random() * CONST.userAgentList.length)],
    tac: '',
    signature: '',
};

/**
 * Randomize user-agent version
 * Only if {randomUa} is set to {true}
 */
const randomUserAgent = () => CONST.userAgentList[Math.floor(Math.random() * CONST.userAgentList.length)];

/**
 * Load proxys from a file
 * @param file
 */
const proxyFromFile = async (file: string) => {
    try {
        const data = (await fromCallback(cb => readFile(file, { encoding: 'utf-8' }, cb))) as string;
        const proxyList = data.split('\n');
        if (!proxyList.length) {
            throw new Error('Proxy file is empty');
        }
        return proxyList;
    } catch (error) {
        throw error.message;
    }
};

const promiseScraper = async (input: string, type: ScrapeType, options = {} as Options): Promise<Result> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }

    if (!options?.userAgent) {
        options!.userAgent = randomUserAgent();
    }

    const constructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type, input } };

    const scraper = new TikTokScraper(constructor);

    const result = await scraper.scrape();
    return result;
};

const eventScraper = (input: string, type: ScrapeType, options = {} as Options): TikTokScraper => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }

    if (!options?.userAgent) {
        options!.userAgent = randomUserAgent();
    }

    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type, input, event: true } };
    return new TikTokScraper(contructor);
};

export const hashtag = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'hashtag', options);
export const user = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'user', options);
export const trend = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'trend', options);
export const music = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'music', options);

export const hashtagEvent = (input: string, options: Options): TikTokScraper => eventScraper(input, 'hashtag', options);
export const userEvent = (input: string, options: Options): TikTokScraper => eventScraper(input, 'user', options);
export const musicEvent = (input: string, options: Options): TikTokScraper => eventScraper(input, 'music', options);
export const trendEvent = (input: string, options: Options): TikTokScraper => eventScraper(input, 'trend', options);

export const getHashtagInfo = async (input: string, options = {} as Options): Promise<Challenge> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }

    if (!options?.userAgent) {
        options!.userAgent = randomUserAgent();
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type: 'signle_hashtag' as ScrapeType, input } };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.getHashtagInfo();
    return result;
};

export const getUserProfileInfo = async (input: string, options = {} as Options): Promise<UserData> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options?.randomUa) {
        options.userAgent = randomUserAgent();
    }

    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type: 'sinsgle_user' as ScrapeType, input } };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.getUserProfileInfo();
    return result;
};

export const signUrl = async (input: string, options = {} as Options): Promise<string> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }

    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type: 'signature' as ScrapeType, input } };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.signUrl();
    return result;
};

export const getVideoMeta = async (input: string, options = {} as Options): Promise<PostCollector> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options?.randomUa) {
        options.userAgent = randomUserAgent();
    }
    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type: 'video_meta' as ScrapeType, input } };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.getVideoMeta();
    return result;
};

export const video = async (input: string, options = {} as Options): Promise<any> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    if (options?.randomUa) {
        options.userAgent = randomUserAgent();
    }
    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...options, ...{ type: 'video' as ScrapeType, input } };
    const scraper = new TikTokScraper(contructor);
    const result: PostCollector = await scraper.getVideoMeta();

    const path = options?.filepath ? `${options?.filepath}/${result.id}` : result.id;
    let outputMessage = {};

    if (options?.filetype) {
        await scraper.saveMetadata({ json: `${path}.json`, csv: `${path}.csv` });

        outputMessage = {
            ...(options?.filetype === 'all' ? { json: `${path}.json`, csv: `${path}.csv` } : {}),
            ...(options?.filetype === 'json' ? { json: `${path}.json` } : {}),
            ...(options?.filetype === 'csv' ? { csv: `${path}.csv` } : {}),
        };
    }

    if (options?.download) {
        await scraper.Downloader.downloadSingleVideo(result);
    }
    return {
        ...(options?.download ? { message: `Video location: ${contructor.filepath}/${result.id}.mp4` } : {}),
        ...outputMessage,
    };
};

// eslint-disable-next-line no-unused-vars
export const history = async (input: string, options = {} as Options) => {
    let store: string;

    const historyPath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : options?.historyPath || tmpdir();
    try {
        store = (await fromCallback(cb => readFile(`${historyPath}/tiktok_history.json`, { encoding: 'utf-8' }, cb))) as string;
    } catch (error) {
        throw `History file doesn't exist`;
    }
    const historyStore: History = JSON.parse(store);

    if (options?.remove) {
        const split = options.remove.split(':');
        const type = split[0];

        if (type === 'all') {
            const remove: any = [];
            for (const key of Object.keys(historyStore)) {
                remove.push(fromCallback(cb => unlink(historyStore[key].file_location, cb)));
            }
            remove.push(fromCallback(cb => unlink(`${historyPath}/tiktok_history.json`, cb)));

            await Promise.all(remove);

            return { message: `History was completely removed` };
        }

        const key = type !== 'trend' ? options.remove.replace(':', '_') : 'trend';

        if (historyStore[key]) {
            const historyFile = historyStore[key].file_location;

            await fromCallback(cb => unlink(historyFile, cb));

            delete historyStore[key];

            await fromCallback(cb => writeFile(`${historyPath}/tiktok_history.json`, JSON.stringify(historyStore), cb));

            return { message: `Record ${key} was removed` };
        }
        throw `Can't find record: ${key.split('_').join(' ')}`;
    }
    const table: HistoryItem[] = [];
    for (const key of Object.keys(historyStore)) {
        table.push(historyStore[key]);
    }
    return { table };
};

interface Batcher {
    type: string;
    input: string;
    by_user_id?: boolean;
}

const batchProcessor = (batch: Batcher[], options = {} as Options): Promise<any[]> => {
    return new Promise(resolve => {
        console.log('TikTok Bulk Scraping Started');
        const result: any[] = [];
        forEachLimit(
            batch,
            options.asyncBulk || 5,
            async item => {
                switch (item.type) {
                    case 'user':
                        try {
                            const output = await user(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.type, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.type} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.type, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'hashtag':
                        try {
                            const output = await hashtag(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.type, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.type} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.type, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'video':
                        try {
                            await video(item.input, options);
                            result.push({ type: item.type, input: item.input, completed: true });
                            console.log(`Scraping completed: ${item.type} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.type, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'music':
                        try {
                            const output = await music(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.type, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.type} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.type, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    default:
                        break;
                }
            },
            () => {
                resolve(result);
            },
        );
    });
};

export const fromfile = async (input: string, options = {} as Options) => {
    let inputFile: string;
    try {
        inputFile = (await fromCallback(cb => readFile(input, { encoding: 'utf-8' }, cb))) as string;
    } catch (error) {
        throw `Can't find fle: ${input}`;
    }
    const batch: Batcher[] = inputFile
        .split('\n')
        .filter(item => item.indexOf('##') === -1 && item.length)
        .map(item => {
            item = item.replace(/\s/g, '');
            if (item.indexOf('#') > -1) {
                return {
                    type: 'hashtag',
                    input: item.split('#')[1],
                };
            }
            if (/^https:\/\/(www|v[a-z]{1})+\.tiktok\.com\/(\w.+|@(.\w.+)\/video\/(\d+))$/.test(item)) {
                return {
                    type: 'video',
                    input: item,
                };
            }
            if (item.indexOf('music:') > -1) {
                return {
                    type: 'music',
                    input: item.split(':')[1],
                };
            }
            if (item.indexOf('id:') > -1) {
                return {
                    type: 'user',
                    input: item.split(':')[1],
                    by_user_id: true,
                };
            }
            return {
                type: 'user',
                input: item,
            };
        });
    if (!batch.length) {
        throw `File is empty: ${input}`;
    }
    if (options?.randomUa) {
        options.userAgent = randomUserAgent();
    }
    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }
    const result = await batchProcessor(batch, options);

    return { table: result };
};
