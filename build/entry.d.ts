import { TikTokScraper } from './core';
import { Options, Result, UserMetadata, HashtagMetadata, HistoryItem, MusicMetadata } from './types';
export declare const hashtag: (input: string, options?: Options | undefined) => Promise<Result>;
export declare const user: (input: string, options?: Options | undefined) => Promise<Result>;
export declare const trend: (input: string, options?: Options | undefined) => Promise<Result>;
export declare const music: (input: string, options?: Options | undefined) => Promise<Result>;
export declare const hashtagEvent: (input: string, options: Options) => TikTokScraper;
export declare const userEvent: (input: string, options: Options) => TikTokScraper;
export declare const musicEvent: (input: string, options: Options) => TikTokScraper;
export declare const trendEvent: (input: string, options: Options) => TikTokScraper;
export declare const getHashtagInfo: (input: string, options?: Options) => Promise<HashtagMetadata>;
export declare const getMusicInfo: (input: string, options?: Options) => Promise<MusicMetadata>;
export declare const getUserProfileInfo: (input: string, options?: Options) => Promise<UserMetadata>;
export declare const signUrl: (input: string, options?: Options) => Promise<string>;
export declare const getVideoMeta: (input: string, options?: Options) => Promise<Result>;
export declare const video: (input: string, options?: Options) => Promise<any>;
export declare const history: (input: string, options?: Options) => Promise<{
    message: string;
    table?: undefined;
} | {
    table: HistoryItem[];
    message?: undefined;
}>;
export declare const fromfile: (input: string, options?: Options) => Promise<{
    table: any[];
}>;
