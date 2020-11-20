import { SocksProxyAgent } from 'socks-proxy-agent';
export declare type ScrapeType = 'user' | 'hashtag' | 'trend' | 'music' | 'discover_user' | 'discover_hashtag' | 'discover_music' | 'single_user' | 'single_hashtag' | 'single_music' | 'signature' | 'video_meta' | 'video';
export interface Proxy {
    socks: boolean;
    proxy: string | SocksProxyAgent;
}
export interface Options {
    proxy?: string[] | string;
    proxyFile?: string;
    event?: boolean;
    by_user_id?: boolean;
    download?: boolean;
    bulk?: boolean;
    cli?: boolean;
    asyncBulk?: number;
    asyncDownload?: number;
    asyncScraping?: number;
    filepath?: string;
    filetype?: string;
    progress?: boolean;
    number?: number;
    noWaterMark?: boolean;
    remove?: string;
    fileName?: string;
    historyPath?: string;
    timeout?: number;
    hdVideo?: boolean;
    randomUa?: boolean;
    webHookUrl?: string;
    method?: string;
    headers?: Headers;
    verifyFp?: string;
}
export interface TikTokConstructor {
    download: boolean;
    filepath: string;
    filetype: string;
    proxy: string[] | string;
    asyncDownload: number;
    asyncScraping: number;
    cli?: boolean;
    zip?: boolean;
    event?: boolean;
    progress?: boolean;
    bulk?: boolean;
    input: string;
    number: number;
    type: ScrapeType;
    by_user_id?: boolean;
    store_history?: boolean;
    historyPath?: string;
    noWaterMark?: boolean;
    fileName?: string;
    timeout?: number;
    test?: boolean;
    hdVideo?: boolean;
    signature?: string;
    webHookUrl?: string;
    method?: string;
    headers: Headers;
    verifyFp?: string;
}
export interface Hashtags {
    id: string;
    name: string;
    title: string;
    cover: string[] | string;
}
export interface PostCollector {
    id: string;
    text: string;
    createTime: number;
    authorMeta: {
        id: string;
        secUid: string;
        name: string;
        nickName: string;
        following?: number;
        fans?: number;
        heart?: number;
        video?: number;
        digg?: number;
        verified: boolean;
        private?: boolean;
        signature: string;
        avatar: string;
    };
    musicMeta?: {
        musicId: string;
        musicName: string;
        musicAuthor: string;
        musicOriginal: boolean;
        playUrl: string;
        coverThumb?: string;
        coverMedium?: string;
        coverLarge?: string;
    };
    covers: {
        default: string;
        origin: string;
        dynamic: string;
    };
    imageUrl?: string;
    webVideoUrl?: string;
    videoUrl: string;
    videoUrlNoWaterMark: string | null;
    videoMeta: {
        width: number;
        height: number;
        ratio?: number;
        duration: number;
    };
    diggCount: number;
    shareCount: number;
    playCount: number;
    commentCount: number;
    mentions: string[] | null;
    hashtags: Hashtags[];
    repeated?: boolean;
    downloaded: boolean;
}
export interface Result {
    headers: Headers;
    collector: PostCollector[];
    zip?: string;
    json?: string;
    csv?: string;
}
export interface Headers {
    'User-Agent': string;
    Referer?: string;
    Cookie?: string;
}
