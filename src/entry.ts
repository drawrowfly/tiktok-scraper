/* eslint-disable no-throw-literal */
/* eslint-disable no-restricted-syntax */
import { tmpdir } from 'os';
import { readFile, writeFile, unlink } from 'fs';
import { fromCallback } from 'bluebird';
import { TikTokScraper } from './core';
import { TikTokConstructor, Options, ScrapeType, Result, UserData, Challenge, PostCollector, History, HistoryItem } from './types';
import CONST from './constant';

const INIT_OPTIONS = {
    number: 20,
    download: false,
    asyncDownload: 5,
    asyncScraping: 3,
    proxy: '',
    filepath: process.cwd(),
    filetype: 'na',
    progress: false,
    event: false,
    by_user_id: false,
    noWaterMark: false,
    userAgent: CONST.userAgent,
};

const promiseScraper = async (input: string, type: ScrapeType, options?: Options): Promise<Result> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type, input }, ...options };

    const scraper = new TikTokScraper(contructor);

    const result = await scraper.scrape();
    return result;
};

const eventScraper = (input: string, type: ScrapeType, options?: Options): TikTokScraper => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type, input, event: true }, ...options };
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

export const getHashtagInfo = async (input: string, options?: Options): Promise<Challenge> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type: 'signle_hashtag' as ScrapeType, input }, ...options };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.getHashtagInfo();
    return result;
};

export const getUserProfileInfo = async (input: string, options?: Options): Promise<UserData> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type: 'sinsgle_user' as ScrapeType, input }, ...options };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.getUserProfileInfo();
    return result;
};

export const signUrl = async (input: string, options?: Options): Promise<string> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type: 'signature' as ScrapeType, input }, ...options };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.signUrl();
    return result;
};

export const getVideoMeta = async (input: string, options?: Options): Promise<PostCollector> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type: 'video_meta' as ScrapeType, input }, ...options };
    const scraper = new TikTokScraper(contructor);

    const result = await scraper.getVideoMeta();
    return result;
};

export const video = async (input: string, options?: Options): Promise<any> => {
    const contructor: TikTokConstructor = { ...INIT_OPTIONS, ...{ type: 'video' as ScrapeType, input }, ...options };
    const scraper = new TikTokScraper(contructor);
    const result: PostCollector = await scraper.getVideoMeta();

    await scraper.Downloader.downloadSingleVideo(result);
    return { message: `Video was saved in: ${contructor.filepath}/${result.id}.mp4` };
};

// eslint-disable-next-line no-unused-vars
export const history = async (input: string, options?: Options) => {
    let store: string;

    const historyPath = options?.historyPath || tmpdir();
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
