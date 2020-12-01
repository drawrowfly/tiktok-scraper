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
                'User-Agent': 'Custom User-Agent',
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
        expect(instance.headers['User-Agent']).toContain('Custom User-Agent');
    });

    it('getUserId should return a valid Object', async () => {
        const userId: RequestQuery = await instance.getUserId();
        expect(userId).toEqual({ count: 30, id: '107955', lang: '', maxCursor: 0, minCursor: 0, secUid: '', sourceType: 8, verifyFp: '' });
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
                'User-Agent': 'Custom User-Agent',
            },
            proxy: '',
            number: 1,
            event: true,
        });
    });

    it('result should emit "data" event with the result', done => {
        instance.on('data', data => {
            // eslint-disable-next-line no-console
            console.error(JSON.stringify(data));
            expect(data).toEqual({
                id: '6800111723257941253',
                text: '@madisonbeer shows us her #ultrainstinct',
                createTime: 1583274394,
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
                    musicId: '6795008547961752326',
                    musicName: 'Ultra Instinct',
                    musicAuthor: 'adamdevito',
                    musicOriginal: true,
                    playUrl: 'https://p16-va-tiktok.ibyteimg.com/obj/musically-maliva-obj/1658946263458837.mp3',
                    coverThumb: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1655766966982661~c5_100x100.jpeg',
                    coverMedium: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1655766966982661~c5_720x720.jpeg',
                    coverLarge: 'https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1655766966982661~c5_1080x1080.jpeg',
                },
                covers: {
                    default:
                        'https://p16-tiktok-va.ibyteimg.com/obj/tos-maliva-p-0068/e48225bcc2ed4d49acccd224ee6bef4d_1583274508?x-expires=1591862400&x-signature=C0T7AAfVdmxTzXuQuDZX7C%2Bnz68%3D',
                    origin:
                        'https://p16-tiktok-va.ibyteimg.com/obj/tos-maliva-p-0068/6413b45c9e6f48ccaa458d3ee3499214_1583274398?x-expires=1591862400&x-signature=mabQXicsV3SopgpW0vgZl3vq%2Bx8%3D',
                    dynamic:
                        'https://p16-tiktok-va.ibyteimg.com/obj/tos-maliva-p-0068/4eeadcc7e81c475698838f01c3456483_1583274398?x-expires=1591862400&x-signature=46eVe2t9ugE5hBrZVY4HiB6VWKI%3D',
                },
                webVideoUrl: 'https://www.tiktok.com/@tiktok/video/6800111723257941253',
                videoUrl:
                    'https://v19.tiktokcdn.com/4d67e959107f5b1b8e46ab682fc434e7/5edf986e/video/tos/useast2a/tos-useast2a-ve-0068c004/f3573a31d77646d58687bc024cac2989/?a=1233&br=3574&bt=1787&cr=0&cs=0&dr=0&ds=3&er=&l=2020060908104601018907106605015433&lr=tiktok_m&mime_type=video_mp4&qs=0&rc=MzlsZnlnPDhnczMzPDczM0ApNmhmZDo3MzxkN2dnaTdpZGdsYmtxNS5uZ2NfLS1fMTZzc142MmI0YDA2Xi9iNmMxLzA6Yw%3D%3D&vl=&vr=',
                videoUrlNoWaterMark: '',
                videoMeta: {
                    height: 1280,
                    width: 720,
                    duration: 8,
                },
                textExtra: [
                    {
                        awemeId: '',
                        start: 0,
                        end: 12,
                        hashtagName: '',
                        hashtagId: '',
                        type: 0,
                        userId: '20921174',
                        isCommerce: false,
                    },
                    {
                        awemeId: '',
                        start: 26,
                        end: 40,
                        hashtagName: 'ultrainstinct',
                        hashtagId: '',
                        type: 1,
                        userId: '',
                        isCommerce: false,
                    },
                ],
                diggCount: 964700,
                shareCount: 3349,
                playCount: 10500000,
                commentCount: 9311,
                downloaded: false,
                mentions: ['@madisonbeer'],
                hashtags: [
                    {
                        id: '80332770',
                        name: 'ultrainstinct',
                        title: "Whether you're a momentary expert or struggle with the big moments, show us your #UltraInstinct.",
                        cover: 'https://p16-va-default.akamaized.net/obj/musically-maliva-obj/43d03229b2f2731b71db88ce67a54d47',
                    },
                ],
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
        expect(hashtag).toEqual({ aid: 1988, challengeID: '99770', count: 30, cursor: 0, verifyFp: '' });
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': 'okhttp',
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
                'User-Agent': CONST.userAgent(),
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
