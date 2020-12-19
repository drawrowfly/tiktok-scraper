import fs from 'fs';
import { ScrapeType, Result, RequestQuery, UserMetadata, PostCollector, HashtagMetadata } from '../types';
import { TikTokScraper } from './TikTok';
import CONST from '../constant';

jest.mock('request-promise-native');
jest.mock('request-promise');

describe('TikTok Scraper MODULE(promise): user(valid input data)', () => {
    let instance;
    beforeAll(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 3,
            filetype: '',
            filepath: '',
            input: 'tiktok',
            noWaterMark: false,
            type: 'user',
            headers: {
                'user-agent': 'Custom user-agent',
            },
            proxy: '',
            number: 5,
        });
    });

    it('user input should not be empty', async () => {
        expect(instance).toBeInstanceOf(TikTokScraper);
        expect(instance.input).toContain('tiktok');
    });

    it('set custom user-agent', async () => {
        expect(instance).toBeInstanceOf(TikTokScraper);
        expect(instance.headers['user-agent']).toContain('Custom user-agent');
    });

    it('getUserId should return a valid Object', async () => {
        const userId: RequestQuery = await instance.getUserId();
        expect(userId).toEqual({
            count: 30,
            id: '107955',
            lang: '',
            maxCursor: 0,
            minCursor: 0,
            secUid: '',
            sourceType: 8,
            verifyFp: '',
        });
    });

    it('result should contain array value with the length 5', async () => {
        const posts: Result = await instance.scrape();
        expect(posts.collector.length).toEqual(5);
    });
});

describe('TikTok Scraper MODULE(event): user(valid input data)', () => {
    let instance;
    beforeAll(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: 'tiktok',
            type: 'user',
            headers: {
                'user-agent': 'Custom user-agent',
            },
            proxy: '',
            number: 1,
            event: true,
        });
    });

    it('result should emit "data" event with the result', done => {
        instance.on('data', data => {
            expect(data).toEqual({
                id: '6833468102982798598',
                text: 'To our community, a message from our CEO...',
                createTime: 1591040777,
                authorMeta: {
                    id: '107955',
                    secUid: 'MS4wLjABAAAAv7iSuuXDJGDvJkmH_vz1qkDZYo1apxgzaxdBSeIuPiM',
                    name: 'tiktok',
                    nickName: 'TikTok',
                    verified: true,
                    signature: 'Make Your Day',
                    avatar: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_1080x1080.jpeg',
                },
                musicMeta: {
                    musicId: '6833468087698803462',
                    musicName: 'original sound',
                    musicAuthor: 'tiktok',
                    musicOriginal: true,
                    playUrl: 'https://p16-va-tiktok.ibyteimg.com/obj/musically-maliva-obj/8933750c078b6b0702864cd3004f989f.mp3',
                    coverThumb: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_100x100.jpeg',
                    coverMedium: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_720x720.jpeg',
                    coverLarge: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_1080x1080.jpeg',
                },
                covers: {
                    default:
                        'https://p16-tiktok-va.ibyteimg.com/obj/tos-maliva-p-0068/57cf33573b3348b9a44b12287601574d_1591040780?x-expires=1591862400&x-signature=dF7jR2iPW2St4BWqBgxi78FvMP0%3D',
                    origin:
                        'https://p16-tiktok-va.ibyteimg.com/obj/tos-maliva-p-0068/1fca8a4bd2cd49eabfc2290a5f3befab_1591040779?x-expires=1591862400&x-signature=ckP5WHRjaPHlD%2FhGJTm0s6%2BS6bo%3D',
                    dynamic:
                        'https://p16-tiktok-va.ibyteimg.com/obj/tos-maliva-p-0068/6f08a25103584cac821e15727c625f65_1591040779?x-expires=1591862400&x-signature=sP2%2BauyoM39NP%2BrUAgCZdh1KilI%3D',
                },
                webVideoUrl: 'https://www.tiktok.com/@tiktok/video/6833468102982798598',
                videoUrl:
                    'https://v19.tiktokcdn.com/270ac5f1885ae68e7bcf5d2fedf02282/5edf9875/video/tos/useast2a/tos-useast2a-ve-0068c001/76cda2fd993649878b0099e4e0d064b3/?a=1233&br=572&bt=286&cr=0&cs=0&dr=0&ds=3&er=&l=2020060908104601018907106605015433&lr=tiktok_m&mime_type=video_mp4&qs=0&rc=anhneHdkeDRvdTMzZjczM0ApOjg5NWk8PGQ2N2Q5Njs2aGdjY2VxZGAwal5fLS00MTZzczJhYGMxMDMxNTBeNi8wYTA6Yw%3D%3D&vl=&vr=',
                videoUrlNoWaterMark: '',
                videoMeta: { height: 1024, width: 576, duration: 15 },
                diggCount: 201200,
                shareCount: 2537,
                playCount: 1800000,
                commentCount: 15700,
                downloaded: false,
                mentions: [],
                hashtags: [],
            });
            done();
        });
        instance.scrape();
    });

    it('result should emit "done" event if task was completed', done => {
        instance.on('done', data => {
            expect(data).toEqual('completed');
            done();
        });
        instance.scrape();
    });
});

describe('TikTok Scraper MODULE(promise): user(invalid input data)', () => {
    it('Throw error if username is empty', () => {
        const instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: '',
            type: 'user',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });
        expect(instance.scrape()).rejects.toEqual('Missing input');
    });

    it('Throw error if wrong scraping type was provided', () => {
        const instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: '',
            type: 'fake' as ScrapeType,
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });
        expect(instance.scrape()).rejects.toEqual(`Missing scraping type. Scrape types: ${CONST.scrape} `);
    });
});

describe('TikTok Scraper MODULE(event): user(invalid input data)', () => {
    it('Throw error if username is empty', done => {
        const instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: '',
            type: 'user',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 1,
            event: true,
        });
        instance.on('error', data => {
            expect(data).toEqual('Missing input');
            done();
        });
        instance.scrape();
    });

    it('Throw error if wrong scraping type was provided', done => {
        const instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: '',
            type: 'fake' as ScrapeType,
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
            event: true,
        });
        instance.on('error', data => {
            expect(data).toEqual(`Missing scraping type. Scrape types: ${CONST.scrape} `);
            done();
        });
        instance.scrape();
    });
});

describe('TikTok Scraper MODULE(promise): user(save to a file)', () => {
    let instance;
    let posts: Result;
    beforeAll(async () => {
        jest.spyOn(fs, 'writeFile').mockImplementation((file, option, cb) => cb(null));

        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: 'all',
            filepath: '',
            input: 'tiktok',
            type: 'user',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });

        posts = await instance.scrape();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('fs.WriteFile should be called 2 times. Save to a csv and json', async () => {
        expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });

    it('result should contain a valid file names for the csv and json files', async () => {
        expect(posts.csv).toMatch(/^(\w+)_([0-9]{13}).csv$/);
        expect(posts.json).toMatch(/^(\w+)_([0-9]{13}).json$/);
    });
});

describe('TikTok Scraper MODULE(promise): hashtag(valid input data)', () => {
    let instance;
    beforeAll(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: 'summer',
            type: 'hashtag',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });
    });

    it('hashtag input should not be empty', async () => {
        expect(instance).toBeInstanceOf(TikTokScraper);
        expect(instance.input).toContain('summer');
    });

    it('getHashTagId should return a valid Object', async () => {
        const hashtag: RequestQuery = await instance.getHashTagId();
        expect(hashtag).toEqual({ aid: 1988, challengeID: '99770', count: 30, cursor: 0, user_agent: 'okhttp', verifyFp: '' });
    });

    // it('result should contain array value with the length 5', async () => {
    //     const posts: Result = await instance.scrape();
    //     expect(posts.collector.length).toEqual(5);
    // });
});

describe('TikTok Scraper MODULE(promise): signUrl', () => {
    let instance;
    beforeAll(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: 'https://m.tiktok.com/share/item/list?secUid=&id=355503&type=3&count=30&minCursor=0&maxCursor=0&shareUid=&lang=',
            type: 'signature',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });
    });
    it('signUrl should return a valid signature', async () => {
        const signature: string = await instance.signUrl();
        expect(signature).not.toBeNull();
    });

    it('Throw error if input url is empty', async () => {
        instance.input = '';
        await expect(instance.signUrl()).rejects.toBe(`Url is missing`);
    });
});

describe('TikTok Scraper MODULE(promise): getHashtagInfo', () => {
    let instance;
    const hasthagName = 'summer';
    beforeAll(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: hasthagName,
            type: 'single_hashtag',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });
    });
    it('getHashtagInfo should return a valid Object', async () => {
        const hashtag: HashtagMetadata = await instance.getHashtagInfo();
        expect(hashtag).toEqual({
            challenge: {
                id: '99770',
                title: 'duett',
                desc: 'Habt ihr schon unsere neue Duett-Funktion gecheckt? Oben, unten, links, rechts alles möglich jetzt.',
                profileThumb: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/92760d2f9cce09720b20ae060081efc8',
                profileMedium: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/92760d2f9cce09720b20ae060081efc8',
                profileLarger: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/92760d2f9cce09720b20ae060081efc8',
                coverThumb: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/fa5fcd3ee0a9581fc26d9e3b811e428e',
                coverMedium: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/fa5fcd3ee0a9581fc26d9e3b811e428e',
                coverLarger: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/fa5fcd3ee0a9581fc26d9e3b811e428e',
                isCommerce: false,
            },
            stats: { videoCount: 0, viewCount: 37100000000 },
            shareMeta: { title: '#duett on TikTok', desc: '37099.0m views - Watch awesome short videos created with trending hashtag #duett' },
            challengeAnnouncement: {},
        });
    });

    it('Throw error if input hashtag is empty', async () => {
        instance.input = '';
        await expect(instance.getHashtagInfo()).rejects.toBe(`Hashtag is missing`);
    });

    it(`Throw error if hashtag doesn't exist`, async () => {
        instance.input = 'na';
        await expect(instance.getHashtagInfo()).rejects.toBe(`Can't find hashtag: na`);
    });
});

describe('TikTok Scraper MODULE(promise): getUserProfileInfo', () => {
    let instance;
    const userName = 'tiktok';
    beforeAll(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: userName,
            type: 'single_user',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });
    });
    it('getUserProfileInfo should return a valid Object', async () => {
        const user: UserMetadata = await instance.getUserProfileInfo();
        expect(user).toEqual({
            user: {
                id: '107955',
                uniqueId: 'tiktok',
                nickname: 'TikTok',
                avatarThumb:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_100x100.jpeg?x-expires=1603573200&x-signature=XGaOhkftgl2fNr%2BT1OpxPVWUWY4%3D',
                avatarMedium:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_720x720.jpeg?x-expires=1603573200&x-signature=bl%2BxXbD9ME6Tt4VNcWtPDAX4PZI%3D',
                avatarLarger:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_1080x1080.jpeg?x-expires=1603573200&x-signature=4%2FrCxmt8FiH7M9RY%2Bx%2F7WVzd0Og%3D',
                signature: 'Make Your Day',
                verified: true,
                secUid: 'MS4wLjABAAAAv7iSuuXDJGDvJkmH_vz1qkDZYo1apxgzaxdBSeIuPiM',
                secret: false,
                ftc: false,
                relation: 1,
                openFavorite: true,
                commentSetting: 0,
                duetSetting: 0,
                stitchSetting: 0,
                privateAccount: false,
            },
            stats: { followingCount: 491, followerCount: 48300000, heartCount: 241100000, videoCount: 112, diggCount: 35, heart: 241100000 },
            shareMeta: {
                title: 'TikTok on TikTok',
                desc: '@tiktok 48.0m Followers, 491 Following, 241.0m Likes - Watch awesome short videos created by TikTok',
            },
        });
    });

    it('Throw error if input username is empty', async () => {
        instance.input = '';
        await expect(instance.getUserProfileInfo()).rejects.toBe(`Username is missing`);
    });

    it(`Throw error if username doesn't exist`, async () => {
        instance.input = 'na';
        await expect(instance.getUserProfileInfo()).rejects.toBe(`Can't find user: na`);
    });
});

describe('TikTok Scraper CLI: user(save progress)', () => {
    let instance;
    let posts: Result;
    beforeAll(async () => {
        jest.spyOn(fs, 'writeFile').mockImplementation((file, option, cb) => cb(null));
        jest.spyOn(fs, 'readFile').mockImplementation((file, cb) => cb(null, Buffer.from('0')));

        instance = new TikTokScraper({
            download: true,
            cli: true,
            zip: true,
            store_history: true,
            test: true,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: 'tiktok',
            type: 'user',
            headers: {
                'user-agent': 'okhttp',
            },
            proxy: '',
            number: 5,
        });

        posts = await instance.scrape();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('fs.readFile should be called 2 times', async () => {
        expect(fs.readFile).toHaveBeenCalledTimes(2);
    });

    it('fs.writeFile should be called 2 times', async () => {
        expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });

    it('result should contain a valid file name for the Zip file', async () => {
        expect(posts.zip).toMatch(/^(\w+)_([0-9]{13}).zip$/);
    });
});

describe('TikTok Scraper MODULE(promise): getVideoMeta', () => {
    let instance;
    beforeEach(() => {
        instance = new TikTokScraper({
            download: false,
            asyncDownload: 5,
            asyncScraping: 5,
            filetype: '',
            filepath: '',
            input: 'https://www.tiktok.com/@tiktok/video/6807491984882765062',
            type: 'video_meta',
            headers: {
                'user-agent': CONST.userAgent(),
            },
            proxy: '',
            number: 5,
            hdVideo: false,
        });
    });
    it('getVideoMeta should return a valid Object', async () => {
        const post: PostCollector = await instance.getVideoMeta();
        expect(post).toEqual({
            id: '6881450806688664838',
            text: 'Good vibes only 🤙 @420doggface208 @mickfleetwood @tomhayes603',
            createTime: 1602212662,
            authorMeta: {
                id: '107955',
                secUid: 'MS4wLjABAAAAv7iSuuXDJGDvJkmH_vz1qkDZYo1apxgzaxdBSeIuPiM',
                name: 'tiktok',
                nickName: 'TikTok',
                following: 491,
                fans: 48300000,
                heart: 241100000,
                video: 112,
                digg: 35,
                verified: true,
                private: false,
                signature: 'Make Your Day',
                avatar:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_1080x1080.jpeg?x-expires=1603573200&x-signature=4%2FrCxmt8FiH7M9RY%2Bx%2F7WVzd0Og%3D',
            },
            musicMeta: {
                musicId: '6881450829518293766',
                musicName: 'original sound',
                musicAuthor: 'TikTok',
                musicOriginal: true,
                coverThumb:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_100x100.jpeg?x-expires=1603573200&x-signature=XGaOhkftgl2fNr%2BT1OpxPVWUWY4%3D',
                coverMedium:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_720x720.jpeg?x-expires=1603573200&x-signature=bl%2BxXbD9ME6Tt4VNcWtPDAX4PZI%3D',
                coverLarge:
                    'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1645136815763462~c5_1080x1080.jpeg?x-expires=1603573200&x-signature=4%2FrCxmt8FiH7M9RY%2Bx%2F7WVzd0Og%3D',
            },
            imageUrl:
                'https://p16-sign-sg.tiktokcdn.com/obj/tos-maliva-p-0068/5f1e128e900c4008bd6d612964ef7d1b?x-expires=1603508400&x-signature=lXSV%2BKG4%2B8G%2BGJREfeNEys6m3eg%3D',
            videoUrl:
                'https://v16-web-newkey.tiktokcdn.com/2ea83f8b07e61eb2844a644d0b1ff238/5f939968/video/tos/useast2a/tos-useast2a-pve-0068/2141262fa24c4f7687f2d6b0df121616/?a=1988&br=3316&bt=1658&cr=0&cs=0&cv=1&dr=0&ds=3&er=&l=202010232102490101902192101109C365&lr=tiktok_m&mime_type=video_mp4&qs=0&rc=anFwZTh4N2R3dzMzZzczM0ApNWY0O2QzaDszNzxlOTRlN2dkbzVlbGRkM3NfLS0xMTZzc2EwNC4vLWEuYS5hMmFiMy06Yw%3D%3D&vl=&vr=',
            videoUrlNoWaterMark: null,
            videoMeta: { width: 576, height: 1024, ratio: '720p', duration: 15 },
            covers: {
                default:
                    'https://p16-sign-sg.tiktokcdn.com/obj/tos-maliva-p-0068/5f1e128e900c4008bd6d612964ef7d1b?x-expires=1603508400&x-signature=lXSV%2BKG4%2B8G%2BGJREfeNEys6m3eg%3D',
                origin:
                    'https://p16-sign-sg.tiktokcdn.com/obj/tos-maliva-p-0068/fe538f49b1334b75890ea3d741d3e357_1602212663?x-expires=1603508400&x-signature=JlLy1gxqASLp0msjeJSxMEFco7I%3D',
            },
            diggCount: 1300000,
            shareCount: 13100,
            playCount: 25700,
            commentCount: 25700,
            downloaded: false,
            mentions: ['@420doggface208', '@mickfleetwood', '@tomhayes603'],
            hashtags: [],
        });
    });

    it('Throw error if input url is empty', async () => {
        instance.input = '';
        await expect(instance.getVideoMeta()).rejects.toBe(`Url is missing`);
    });

    it(`Throw error if user has provided incorrect URL`, async () => {
        instance.input = 'na';
        await expect(instance.getVideoMeta()).rejects.toBe(`Can't extract metadata from the video: na`);
    });
});
