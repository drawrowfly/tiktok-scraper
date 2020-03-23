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
    | 'signature';

export interface Options {
    proxy?: string;
    event?: boolean;
    by_user_id?: boolean;
    download?: boolean;
    asyncDownload?: number;
    filepath?: string;
    filetype?: string;
    progress?: boolean;
    number?: number;
    userAgent?: string;
}
export interface TikTokConstructor {
    download: boolean;
    filepath: string;
    filetype: string;
    proxy: string;
    asyncDownload: number;
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
    createTime: string;
    authorId: string;
    authorName: string;
    authorFollowing: number;
    authorFans: number;
    authorHeart: number;
    authorVideo: number;
    authorDigg: number;
    authorVerified: boolean;
    authorPrivate: boolean;
    authorSignature: string;
    musicId: string;
    musicName: string;
    musicAuthor: string;
    musicOriginal: boolean;
    imageUrl: string;
    videoUrl: string;
    diggCount: number;
    shareCount: number;
    playCount: number;
    commentCount: number;
    hashtags: Hashtags[];
    repeated?: boolean;
}

export interface Result {
    collector: PostCollector[];
    zip?: string;
    json?: string;
    csv?: string;
}
