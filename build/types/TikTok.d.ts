import { SocksProxyAgent } from 'socks-proxy-agent';
export declare type ScrapeType = 'user' | 'hashtag' | 'trend' | 'music' | 'discover_user' | 'discover_hashtag' | 'discover_music' | 'single_user' | 'single_hashtag' | 'single_music' | 'signature' | 'video_meta' | 'video';
export interface Proxy {
    socks: boolean;
    proxy: string | SocksProxyAgent;
}
export interface Options {
    proxy?: string[] | string;
    sessionList?: string[];
    proxyFile?: string;
    sessionFile?: string;
    event?: boolean;
    useTestEndpoints?: boolean;
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
    since?: number;
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
    useTestEndpoints?: boolean;
    proxy: string[] | string;
    strictSSL?: boolean;
    asyncDownload: number;
    asyncScraping: number;
    cli?: boolean;
    zip?: boolean;
    event?: boolean;
    progress?: boolean;
    bulk?: boolean;
    input: string;
    number: number;
    since: number;
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
    sessionList?: string[];
}
export interface Hashtags {
    id: string;
    name: string;
    title: string;
    cover: string[] | string;
}
export interface DuetInfo {
    duetFromId: string;
}
export interface EffectStickers {
    id: string;
    name: string;
}
export interface PostCollector {
    id: string;
    secretID: string;
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
        musicAlbum: string;
        playUrl: string;
        coverThumb?: string;
        coverMedium?: string;
        coverLarge?: string;
        duration?: number;
    };
    covers: {
        default: string;
        origin: string;
        dynamic: string;
    };
    imageUrl?: string;
    webVideoUrl?: string;
    videoUrl: string;
    videoUrlNoWaterMark?: string;
    videoApiUrlNoWaterMark?: string;
    videoMeta: {
        width: number;
        height: number;
        ratio?: string;
        duration: number;
        duetEnabled?: boolean;
        stitchEnabled?: boolean;
        duetInfo?: DuetInfo;
    };
    diggCount: number;
    shareCount: number;
    playCount: number;
    commentCount: number;
    mentions: string[] | null;
    hashtags: Hashtags[];
    repeated?: boolean;
    downloaded: boolean;
    effectStickers: EffectStickers[];
}
export interface Result {
    headers: Headers;
    collector: PostCollector[];
    zip?: string;
    json?: string;
    csv?: string;
}
export interface Headers {
    'user-agent': string;
    referer?: string;
    cookie?: string;
}
