import { TikTokScraper } from './core';
import { TikTokConstructor, Options, ScrapeType, Result, UserData, Challenge } from './types';

const INIT_OPTIONS = {
    number: 20,
    download: false,
    asyncDownload: 5,
    proxy: '',
    filepath: process.cwd(),
    filetype: 'na',
    progress: false,
    event: false,
    by_user_id: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:74.0) Gecko/20100101 Firefox/74.0',
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
