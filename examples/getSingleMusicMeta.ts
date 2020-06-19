import { getMusicInfo } from '../src';

(async () => {
    try {
        const musicMeta = await getMusicInfo('https://www.tiktok.com/music/Say-So-6763054442704145158?lang=en', {});
        console.log(musicMeta);
    } catch (error) {
        console.log(error);
    }
})();

/**
 * Output example
 */
// { musicId: '6763054442704145158',
//   musicName: 'Say So',
//   uniqueId: '',
//   secUid: '',
//   authorId: '',
//   authorName: 'Doja Cat',
//   playUrl:
//    { Uri: 'tiktok-obj/7fbdd1d4ac0ee21b1c9336fa76d52c78.mp3',
//      UrlList:
//       [ 'https://sf16-sg.muscdn.com/obj/tiktok-obj/7fbdd1d4ac0ee21b1c9336fa76d52c78.mp3' ] },
//   covers:
//    [ 'https://p16-tiktokcdn-com.akamaized.net/aweme/100x100/tos-alisg-i-0000/adc3f8ba8e42458a80c2fc1ccb99e754.jpeg' ],
//   posts: 20300000,
//   original: '',
//   authorCovers: [],
//   coversMedium:
//    [ 'https://p16-tiktokcdn-com.akamaized.net/aweme/200x200/tos-alisg-i-0000/adc3f8ba8e42458a80c2fc1ccb99e754.jpeg' ],
//   playToken: '',
//   keyToken: '',
//   audioURLWithCookie: false,
//   private: false }
