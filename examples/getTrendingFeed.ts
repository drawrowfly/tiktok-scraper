import { trend } from '../src';

(async () => {
    try {
        const posts = await trend('', { number: 1, sessionList: ['sid_tt=asdasd13123123123adasda;'] });
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
//         id: '6781748520685767942',
//         text: '',
//         createTime: '1578998878',
//         authorId: '6618844870109134853',
//         authorName: 'adliismail',
//         authorFollowing: 3478,
//         authorFans: 21256,
//         authorHeart: '347556',
//         authorVideo: 404,
//         authorDigg: 13547,
//         authorVerified: false,
//         authorPrivate: false,
//         authorSignature: '',
//         musicId: '6548327243720952577',
//         musicName: 'グミベア',
//         musicAuthor: 'ももちゃん',
//         musicOriginal: true,
//         imageUrl: 'https://p16-va-default.akamaized.net/obj/tos-maliva-p-0068/de3cb83bb4564d9a843187ad85a30c66_1578998882',
//         videoUrl:
//             'https://v16.muscdn.com/911c122c3cc2f73a927241e401c54aa8/5e7e5861/video/tos/useast2a/tos-useast2a-ve-0068/2dcb4a7ca27341978ada0b9812e2a405/?a=1233&br=2598&bt=1299&cr=0&cs=0&dr=0&ds=3&er=&l=202003271347330101890740123B21FBD9&lr=tiktok_m&qs=0&rc=ajlkbjlwbW9zcjMzZTczM0ApZmg1ZDxoODtnNzk7ZWY2N2dlMWk2L2kvbGJfLS0zMTZzczIxLWIwMzQ1LWEtMjNhYV86Yw%3D%3D&vl=&vr=',
//         videoUrlNoWaterMark: 'https://api2.musical.ly/aweme/v1/playwm/?video_id=v090446b0000boepol2jlm269kla46hg',
//         diggCount: 339670,
//         shareCount: 22085,
//         playCount: 3182675,
//         commentCount: 1240,
//         downloaded: false,
//         hashtags: [],
//     },
// ];
