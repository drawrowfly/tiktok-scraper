export type ScrapeType =
    | 'user'
    | 'hashtag'
    | 'trend'
    | 'music'
    | 'discover_user'
    | 'discover_hashtag'
    | 'discover_music'
    | 'single_user'
    | 'single_hashtag'
    | 'signature'
    | 'video_meta';

export interface Options {
    proxy?: string;
    event?: boolean;
    by_user_id?: boolean;
    download?: boolean;
    asyncDownload?: number;
    asyncScraping?: number;
    filepath?: string;
    filetype?: string;
    progress?: boolean;
    number?: number;
    userAgent?: string;
    noWaterMark?: boolean;
    remove?: string;
    fileName?: string;
}
export interface TikTokConstructor {
    download: boolean;
    filepath: string;
    filetype: string;
    proxy: string;
    asyncDownload: number;
    asyncScraping: number;
    cli?: boolean;
    event?: boolean;
    progress?: boolean;
    input: string;
    number: number;
    type: ScrapeType;
    by_user_id?: boolean;
    store_history?: boolean;
    userAgent: string;
    test?: boolean;
    noWaterMark?: boolean;
    fileName?: string;
}

export interface Hashtags {
    id: string;
    name: string;
    title: string;
    cover: string[];
}

export interface PostCollector {
    id: string;
    text: string;
    createTime: number;
    authorMeta: {
        id: string;
        name: string;
        following: number;
        fans: number;
        heart: number;
        video: number;
        digg: number;
        verified: boolean;
        private: boolean;
        signature: string;
        avatar: string;
    };
    musicMeta: {
        musicId: string;
        musicName: string;
        musicAuthor: string;
        musicOriginal: boolean;
    };
    imageUrl: string;
    videoUrl: string;
    videoUrlNoWaterMark: string;
    videoMeta: {
        width: number;
        height: number;
        ratio: number;
        duration: number;
    };
    diggCount: number;
    shareCount: number;
    playCount: number;
    commentCount: number;
    hashtags: Hashtags[];
    repeated?: boolean;
    downloaded: boolean;
}

export interface Result {
    collector: PostCollector[];
    zip?: string;
    json?: string;
    csv?: string;
}
