import { getUserProfileInfo } from '../src';

(async () => {
    try {
        const userMeta = await getUserProfileInfo('tiktok', {});
        console.log(userMeta);
    } catch (error) {
        console.log(error);
    }
})();

/**
 * Output example
 */
// {
//     secUid: 'MS4wLjABAAAAv7iSuuXDJGDvJkmH_vz1qkDZYo1apxgzaxdBSeIuPiM',
//     userId: '107955',
//     isSecret: false,
//     uniqueId: 'tiktok',
//     nickName: 'TikTok',
//     signature: 'Make Your Day',
//     covers: ['https://p16.muscdn.com/img/musically-maliva-obj/1645136815763462~c5_100x100.jpeg'],
//     coversMedium: ['https://p16.muscdn.com/img/musically-maliva-obj/1645136815763462~c5_720x720.jpeg'],
//     following: 490,
//     fans: 37950849,
//     heart: '211390823',
//     video: 93,
//     verified: true,
//     digg: 29,
// };
