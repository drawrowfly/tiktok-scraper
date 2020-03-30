import { getHashtagInfo } from '../src';

(async () => {
    try {
        const hashtagMeta = await getHashtagInfo('summer', {});
        console.log(hashtagMeta);
    } catch (error) {
        console.log(error);
    }
})();

/**
 * Output example
 */
// {
//     challengeId: '4100',
//     challengeName: 'summer',
//     text: 'Beach, sun, fun!\nDo you have some cool summer videos? Upload them with the hashtag #summer.',
//     covers: [],
//     coversMedium: [],
//     posts: 3102990,
//     views: '6296125310',
//     isCommerce: false,
//     splitTitle: '',
// };
