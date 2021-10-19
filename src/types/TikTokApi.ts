/* eslint-disable no-underscore-dangle */

import { DuetInfo } from '.';

export interface ItemInfos {
    id: string;
    text: string;
    createTime: number;
    authorId: string;
    musicId: string;
    covers: string[];
    coversOrigin: string[];
    coversDynamic: string[];
    video: {
        urls: string[];
        videoMeta: {
            width: number;
            height: number;
            ratio: number;
            duration: number;
        };
    };
    diggCount: number;
    shareCount: number;
    playCount: number;
    commentCount: number;
    isOriginal: boolean;
    isOfficial: boolean;
    isActivityItem: boolean;
    warnInfo: any[];
}

export interface AuthorInfos {
    secUid: string;
    userId: string;
    uniqueId: string;
    nickName: string;
    signature: string;
    verified: boolean;
    covers: string[];
    coversMedium: string[];
    coversLarger: string[];
    isSecret: boolean;
}

export interface MusicInfos {
    musicId: string;
    musicName: string;
    authorName: string;
    original: boolean;
    playUrl: string[];
    covers: string[];
    coversMedium: string[];
    coversLarger: string[];
    posts: number;
}

export interface Challenge {
    challengeId: string;
    challengeName: string;
    isCommerce: boolean;
    text: string;
    covers: string[];
    coversMedium: string[];
    coversLarger: string[];
    posts: number;
    views: string;
    splitTitle: string;
}

export interface AuthorStats {
    followingCount: number;
    followerCount: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
}

export interface Item {
    itemInfos: ItemInfos;
    authorInfos: AuthorInfos;
    musicInfos: MusicInfos;
    challengeInfoList: Challenge[];
    authorStats: AuthorStats;
}

export interface RequestQuery {
    id?: string;
    musicID?: string;
    secUid?: string;
    shareUid?: string;
    type?: number;
    sourceType?: number;
    count?: number;
    priority_region?: string;
    lang?: string;
    referer?: string;
    root_referer?: string;
    minCursor?: number;
    maxCursor?: number;
    language?: string;
    verifyFp?: string;
    device_id?: string;
    region?: string;
    'X-Bogus'?: string;
    msToken?: string;
    challengeID?: string;
    insertedItemID?: string;
    noUser?: number;
    fromPage?: string;
    from_page?: string;
    cursor?: number;
    aid?: number;
    itemID?: number;
    appId?: number;
    app_language?: string;
    is_page_visible?: boolean;
    user_agent?: string;
    screen_width?: number;
    screen_height?: number;
    browser_language?: string;
    browser_platform?: string;
    isIOS?: boolean;
    os?: string;
    isMobile?: boolean;
    isAndroid?: boolean;
    cookie_enabled?: boolean;
    history_len?: number;
    focus_state?: boolean;
    is_fullscreen?: boolean;
    appType?: string;
    browser_online?: boolean;
    browser_version?: string;
    browser_name?: string;
    validUniqueId?: string;
    uniqueId?: string;
    isUniqueId?: boolean;
    OS?: string;
    app_name?: string;
    device_platform?: string;
    _signature?: string;
}

export interface VideoProps {
    props: {
        pageProps: {
            videoData: Item;
        };
    };
}

/**
 * New API
 */
export interface ItemListData {
    statusCode: number;
    items: FeedItems[];
    itemList: FeedItems[];
    hasMore: boolean;
    maxCursor: string;
    minCursor: string;
    cursor: string;
}

export interface VideoMetadata {
    statusCode: number;
    itemInfo: { itemStruct: FeedItems };
}

export interface FeedItems {
    id: string;
    desc: string;
    createTime: number;
    video: {
        id: string;
        height: number;
        width: number;
        duration: number;
        ratio: string;
        cover: string;
        originCover: string;
        dynamicCover: string;
        playAddr: string;
        downloadAddr: string;
        shareCover: string[];
    };
    author: {
        id: string;
        uniqueId: string;
        nickname: string;
        avatarThumb: string;
        avatarMedium: string;
        avatarLarger: string;
        signature: string;
        verified: boolean;
        secUid: string;
        relation: number;
        openFavorite: boolean;
        secret: boolean;
    };
    music: {
        id: string;
        title: string;
        playUrl: string;
        coverThumb: string;
        coverMedium: string;
        coverLarge: string;
        authorName: string;
        original: boolean;
        duration: number;
        album: string;
    };
    challenges: {
        id: string;
        title: string;
        desc: string;
        profileThumb: string;
        profileMedium: string;
        profileLarger: string;
        coverThumb: string;
        coverMedium: string;
        coverLarger: string;
    }[];
    stats: {
        diggCount: number;
        shareCount: number;
        commentCount: number;
        playCount: number;
    };
    originalItem: boolean;
    officalItem: boolean;
    textExtra: {
        awemeId: string;
        start: number;
        end: number;
        hashtagName: string;
        hashtagId: string;
        type: number;
        userId: string;
        isCommerce: boolean;
    }[];
    secret: boolean;
    forFriend: boolean;
    digged: boolean;
    itemCommentStatus: number;
    showNotPass: boolean;
    vl1: boolean;
    authorStats: {
        followingCount: number;
        followerCount: number;
        heartCount: number;
        videoCount: number;
        diggCount: number;
    };
    duetEnabled: boolean;
    stitchEnabled: boolean;
    duetInfo: DuetInfo;
    effectStickers: {
        name: string;
        ID: string;
    }[];
}

/**
 * __
 */
export interface TikTokMetadata {
    statusCode: number;
    userInfo: UserMetadata;
    challengeInfo: HashtagMetadata;
    musicInfo: MusicMetadata;
}

export interface MusicMetadata {
    music: {
        id: string;
        title: string;
        playUrl: string;
        coverThumb: string;
        coverMedium: string;
        coverLarge: string;
        authorName: string;
        original: boolean;
        playToken: string;
        keyToken: string;
        audioURLWithCookie: boolean;
        private: boolean;
        duration: number;
        album: string;
    };
    author: {
        id: string;
        uniqueId: string;
        nickname: string;
        avatarThumb: string;
        avatarMedium: string;
        avatarLarger: string;
        signature: string;
        verified: boolean;
        secUid: string;
        secret: boolean;
        ftc: boolean;
        relation: number;
        openFavorite: boolean;
        commentSetting: number;
        duetSetting: number;
        stitchSetting: number;
        privateAccount: boolean;
    };
    stats: {
        videoCount: number;
    };
    shareMeta: {
        title: string;
        desc: string;
    };
}

export interface UserMetadata {
    user: {
        id: string;
        uniqueId: string;
        nickname: string;
        avatarThumb: string;
        avatarMedium: string;
        avatarLarger: string;
        signature: string;
        verified: boolean;
        secUid: string;
        secret: boolean;
        ftc: boolean;
        relation: number;
        openFavorite: boolean;
        commentSetting: number;
        duetSetting: number;
        stitchSetting: number;
        privateAccount: boolean;
    };
    stats: {
        followingCount: number;
        followerCount: number;
        heartCount: number;
        videoCount: number;
        diggCount: number;
        heart: number;
    };
    shareMeta: {
        title: string;
        desc: string;
    };
}

export interface HashtagMetadata {
    challenge: {
        id: string;
        title: string;
        desc: string;
        profileThumb: string;
        profileMedium: string;
        profileLarger: string;
        coverThumb: string;
        coverMedium: string;
        coverLarger: string;
        isCommerce: boolean;
    };
    stats: { videoCount: number; viewCount: number };
}

export interface WebHtmlUserMetadata {
    props: {
        pageProps: {
            userInfo: UserMetadata;
        };
    };
}

export interface CommentsData {
    status_code: number;
    status_message: string;
    comments: CommentMetadata[];
    cursor: string;
    hasMore: boolean;
    reply_style: number;
    total: number;
    // log_pb:
    // top_gifts:
    alias_comment_deleted: boolean;
}

export interface CommentMetadata {
    aweme_id: string;
    cid: string;
    create_time: number;
    digg_count: number;
    status: number;
    text: string;
    author_pin: boolean;
    collect_stat: number;
    is_author_digged: boolean;
    no_show: boolean;
    reply_comment_total: number;
    reply_id: string;
    reply_to_reply_id: string;
    stick_position: number;
    text_extra: [];
    user_buried: boolean;
    user_digged: number;
    // label_list: null;
    // reply_comment: null;
    user: {
        avatar_thumb: {
            uri: string;
            url_list: string[];
        };
        custom_verify: string;
        enterprise_verify_reason: string;
        nickname: string;
        sec_uid: string;
        unique_id: string;
        uid: string;
        // ad_cover_url: null;
        // bold_fields: null;
        // can_set_geofencing: null;
        // cha_list: null;
        // cover_url: null;
        // events: null;
        // followers_detail: null;
        // geofencing: null;
        // homepage_bottom_toast: null;
        // item_list: null;
        // mutual_relation_avatars: null;
        // need_points: null;
        // platform_sync_info: null;
        // relative_users: null;
        // search_highlight: null;
        // type_label: null;
        // user_tags: null;
        // white_cover_url: null;
    };
}
