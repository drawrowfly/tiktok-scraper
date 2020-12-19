import { user } from '../src';

(async () => {
    try {
        const posts = await user('tiktok', { number: 1, sessionList: ['sid_tt=asdasd13123123123adasda;'] });
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
//         id: '6807491984882765062',
//         text: 'We’re kicking off the #happyathome live stream series today at 5pm PT!',
//         createTime: '1584992742',
//         authorId: '107955',
//         authorName: 'tiktok',
//         authorFollowing: 490,
//         authorFans: 37950715,
//         authorHeart: '211390566',
//         authorVideo: 93,
//         authorDigg: 29,
//         authorVerified: true,
//         authorPrivate: false,
//         authorSignature: 'Make Your Day',
//         musicId: '6807487887634909957',
//         musicName: 'original sound',
//         musicAuthor: 'tiktok',
//         musicOriginal: true,
//         imageUrl: 'https://p16-va-default.akamaized.net/obj/tos-maliva-p-0068/d1b00294a06e488b851ad6553cad41a0_1584992746',
//         videoUrl:
//             'https://v16.muscdn.com/947a0413a6bb952eb9789df61fbd33cd/5e7e57d7/video/tos/useast2a/tos-useast2a-ve-0068c003/0dc9964505df43288febb6aac33ac6a0/?a=1233&br=472&bt=236&cr=0&cs=0&dr=0&ds=3&er=&l=202003271345110101890660493C20AED5&lr=tiktok_m&qs=0&rc=M3Vna3N1d3FrczMzOzczM0ApO2Q6NjZnOzs0N2k7aGhpaGcxaDM0ay1gMHBfLS0wMTZzc182MWI1YzEtYTY2LWNjXzU6Yw%3D%3D&vl=&vr=',
//         videoUrlNoWaterMark: 'https://api2.musical.ly/aweme/v1/playwm/?video_id=v09044380000bpsh3nct0rnp7h6dkr40',
//         diggCount: 35439,
//         shareCount: 256,
//         playCount: 443031,
//         commentCount: 2538,
//         downloaded: false,
//         hashtags: [[Object]],
//     },
// ];
