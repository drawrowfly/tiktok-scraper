import { getVideoMeta } from '../src';

(async () => {
    try {
        const videoMeta = await getVideoMeta('https://www.tiktok.com/@tiktok/video/6800111723257941253', {});
        console.log(videoMeta);
    } catch (error) {
        console.log(error);
    }
})();

/**
 * Output example
 */
// {
//     id: '6800111723257941253',
//     text: '@madisonbeer shows us her #ultrainstinct',
//     createTime: '1583274394',
//     authorId: '107955',
//     authorName: 'tiktok',
//     musicId: '6795008547961752326',
//     musicName: 'Ultra Instinct',
//     musicAuthor: 'adamdevito',
//     imageUrl: 'https://p16-va-default.akamaized.net/obj/tos-maliva-p-0068/6413b45c9e6f48ccaa458d3ee3499214_1583274398',
//     videoUrl:
//         'https://v16.muscdn.com/fb216f6b6ab561a4ddb2bfa19bd3a9c8/5e7e5949/video/tos/useast2a/tos-useast2a-ve-0068c004/f3573a31d77646d58687bc024cac2989/?a=1233&br=3574&bt=1787&cr=0&cs=0&dr=0&ds=3&er=&l=202003271351290101152280670E6D1537&lr=tiktok_m&qs=0&rc=MzlsZnlnPDhnczMzPDczM0ApNmhmZDo3MzxkN2dnaTdpZGdsYmtxNS5uZ2NfLS1fMTZzc142MmI0YDA2Xi9iNmMxLzA6Yw%3D%3D&vl=&vr=',
//     videoUrlNoWaterMark: 'https://api2.musical.ly/aweme/v1/playwm/?video_id=v09044b90000bpfdj5q91d8vtcnie6o0',
//     diggCount: 515051,
//     shareCount: 1152,
//     playCount: 3874977,
//     commentCount: 4270,
//     downloaded: false,
//     hashtags: [
//         { id: '80332770', name: 'ultrainstinct', title: undefined, cover: undefined },
//         { id: '1652066244561925', name: '生活迷因', title: undefined, cover: undefined },
//     ],
// };
