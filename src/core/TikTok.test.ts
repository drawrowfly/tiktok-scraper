/* eslint-disable */
import fs from 'fs';
import { ScrapeType, Result, RequestQuery, Challenge, UserData, PostCollector } from '../types';
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
            userAgent: 'Custom User-Agent',
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
        expect(instance.userAgent).toContain('Custom User-Agent');
    });

    it('getUserId should return a valid Object', async () => {
        const userId: RequestQuery = await instance.getUserId();
        expect(userId).toEqual({ id: '5831967', secUid: '', sourceType: 8, verifyFp: '', count: 30, minCursor: 0, lang: '' });
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
            userAgent: 'Custom User-Agent',
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
            userAgent: 'http',
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
            userAgent: 'http',
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
            userAgent: 'http',
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
            userAgent: 'http',
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
            userAgent: 'http',
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
            userAgent: 'http',
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
        expect(hashtag).toEqual({ id: '4100', secUid: '', type: 3, verifyFp: '', count: 100, minCursor: 0, lang: '' });
    });

    it('result should contain array value with the length 5', async () => {
        const posts: Result = await instance.scrape();
        expect(posts.collector.length).toEqual(5);
    });
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
            userAgent: 'http',
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
        try {
            await instance.signUrl();
        } catch (error) {
            expect(error).toEqual(`Url is missing`);
        }
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
            userAgent: 'http',
            proxy: '',
            number: 5,
        });
    });
    it('getHashtagInfo should return a valid Object', async () => {
        const hashtag: Challenge = await instance.getHashtagInfo();
        expect(hashtag).toEqual({
            challengeId: '4100',
            challengeName: hasthagName,
            text: `Beach, sun, fun!\nDo you have some cool ${hasthagName} videos? Upload them with the hashtag #${hasthagName}.`,
            covers: [],
            coversMedium: [],
            posts: 3088974,
            views: '6226592362',
            isCommerce: false,
            splitTitle: '',
        });
    });

    it('Throw error if input hashtag is empty', async () => {
        instance.input = '';
        try {
            await instance.getHashtagInfo();
        } catch (error) {
            expect(error).toEqual(`Hashtag is missing`);
        }
    });

    it(`Throw error if hashtag doesn't exist`, async () => {
        instance.input = 'na';
        try {
            await instance.getHashtagInfo();
        } catch (error) {
            expect(error).toEqual(`Can't find hashtag: na`);
        }
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
            userAgent: 'http',
            proxy: '',
            number: 5,
        });
    });
    it('getUserProfileInfo should return a valid Object', async () => {
        const user: UserData = await instance.getUserProfileInfo();
        expect(user).toEqual({
            secUid: 'MS4wLjABAAAA-VASjiXTh7wDDyXvjk10VFhMWUAoxr8bgfO1kAL1-9s',
            userId: '5831967',
            isSecret: false,
            uniqueId: userName,
            nickName: 'Test User',
            signature: 'don’t worry i don’t get the hype either',
            covers: ['https://p16.muscdn.com/img/musically-maliva-obj/1655662764778502~c5_100x100.jpeg'],
            coversMedium: ['https://p16.muscdn.com/img/musically-maliva-obj/1655662764778502~c5_720x720.jpeg'],
            following: 932,
            fans: 40421477,
            heart: '2425050211',
            video: 1071,
            verified: true,
            digg: 3553,
        });
    });

    it('Throw error if input username is empty', async () => {
        instance.input = '';
        try {
            await instance.getUserProfileInfo();
        } catch (error) {
            expect(error).toEqual(`Username is missing`);
        }
    });

    it(`Throw error if username doesn't exist`, async () => {
        instance.input = 'na';
        try {
            await instance.getUserProfileInfo();
        } catch (error) {
            expect(error).toEqual(`Can't find user: na`);
        }
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
            userAgent: 'http',
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
            userAgent: 'http',
            proxy: '',
            number: 5,
            hdVideo: false,
        });
    });
    it('getVideoMeta should return a valid Object', async () => {
        const post: PostCollector = await instance.getVideoMeta();
        expect(post).toEqual({
            id: '6807491984882765062',
            text: 'We’re kicking off the #happyathome live stream series today at 5pm PT!',
            createTime: '1584992742',
            authorMeta: { id: '107955', name: 'tiktok' },
            musicMeta: { musicId: '6807487887634909957', musicName: 'original sound', musicAuthor: 'tiktok' },
            imageUrl: 'https://p16-va-default.akamaized.net/obj/tos-maliva-p-0068/d1b00294a06e488b851ad6553cad41a0_1584992746',
            videoUrl:
                'https://v16.muscdn.com/f950058182bcefa15345108bd9ab241f/5e7e615a/video/tos/useast2a/tos-useast2a-ve-0068c003/0dc9964505df43288febb6aac33ac6a0/?a=1233&br=472&bt=236&cr=0&cs=0&dr=0&ds=3&er=&l=20200327142546010115115156167B9215&lr=tiktok_m&qs=0&rc=M3Vna3N1d3FrczMzOzczM0ApO2Q6NjZnOzs0N2k7aGhpaGcxaDM0ay1gMHBfLS0wMTZzc182MWI1YzEtYTY2LWNjXzU6Yw%3D%3D&vl=&vr=',
            videoUrlNoWaterMark:
                'https://api2-16-h2.musical.ly/aweme/v1/play/?video_id=v09044ae0000bk2qm0ivfsko76kvric0&vr_type=0&is_play_url=1&source=PackSourceEnum_PUBLISH&media_type=4',
            videoMeta: { width: 576, height: 1024, ratio: 16, duration: 16 },
            diggCount: 35650,
            shareCount: 256,
            playCount: 445444,
            commentCount: 2543,
            covers: {
                default: 'https://p16-va-default.akamaized.net/obj/tos-maliva-p-0068/2bc9c980bea7409698bd0acf0206bb8f_1584992746',
                origin: 'https://p16-va-default.akamaized.net/obj/tos-maliva-p-0068/d1b00294a06e488b851ad6553cad41a0_1584992746',
            },
            downloaded: false,
            hashtags: [{ id: '609365', name: 'happyathome', title: undefined, cover: undefined }],
            mentions: [],
        });
    });

    it('Throw error if input url is empty', async () => {
        instance.input = '';
        try {
            await instance.getVideoMeta();
        } catch (error) {
            expect(error).toEqual(`Url is missing`);
        }
    });

    it(`Throw error if user has provided incorrect URL`, async () => {
        instance.input = 'na';
        try {
            await instance.getVideoMeta();
        } catch (error) {
            expect(error).toEqual(`Can't extract metadata from the video: na`);
        }
    });
});
