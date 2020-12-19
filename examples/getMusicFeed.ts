import { music } from '../src';

(async () => {
    try {
        const posts = await music('6548327243720952577', { number: 1, sessionList: ['sid_tt=asdasd13123123123adasda;'] });
        console.log(posts.collector);
    } catch (error) {
        console.log(error);
    }
})();

/**
 * Output example
 */
// [
//     {
//         id: '6759379825577725185',
//         text: 'コリラックマ🐻#可愛い息子#ぐみべあ',
//         createTime: '1573790762',
//         authorId: '6616945592576081921',
//         authorName: 'miyu.s.f.k',
//         authorFollowing: 71,
//         authorFans: 119443,
//         authorHeart: '795324',
//         authorVideo: 46,
//         authorDigg: 443,
//         authorVerified: false,
//         authorPrivate: false,
//         authorSignature: '2歳の娘と8ヶ月の息子がいます❤',
//         musicId: '6548327243720952577',
//         musicName: 'グミベア',
//         musicAuthor: 'ももちゃん',
//         musicOriginal: true,
//         imageUrl: 'https://p16-sg-default.akamaized.net/obj/v0201/c626cee5bc8b4cd596c8946e07834817_1573790769',
//         videoUrl:
//             'https://v16.tiktokcdn.com/cf104457fc32e8b1d4c9b8e315c1b461/5e7e588f/video/n/v0102/0ae57676e47342a89f78d00f2c7e421e/?a=1180&br=2508&bt=1254&cr=0&cs=0&dr=3&ds=3&er=&l=2020032713482001018907301923216852&lr=tiktok&qs=0&rc=M2RtNng3czs1cTMzZzgzM0ApOjY3aWc3Zjs4Nzc3N2llNWc0MW9qL2VyNTRfLS1gLzRzczUuNS8yNDUxYy8uL14uYzA6Yw%3D%3D&vl=&vr=',
//         videoUrlNoWaterMark: 'https://api2.musical.ly/aweme/v1/playwm/?video_id=v07025cd0000bn7288uph42um3rj4a70',
//         diggCount: 724657,
//         shareCount: 47315,
//         playCount: 11425391,
//         commentCount: 2738,
//         downloaded: false,
//         hashtags: [[]],
//     },
// ];
