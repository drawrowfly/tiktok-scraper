import response from './response';

const request = options => {
    const { uri } = options;
    switch (true) {
        case /^https:\/\/(www|v[a-z]{1})+\.tiktok\.com\/(\w.+|@(.\w.+)\/video\/(\d+))\?verifyFp=$/.test(uri):
            return { body: response.videoMeta };
        case /^https:\/\/www\.tiktok\.com\/@[\w.-]+/.test(uri):
            return { body: response.userMeta };
        case /^https:\/\/m.tiktok.com\/node\/share\/user\/@\w+\?uniqueId=(\w+)&verifyFp=$/.test(uri): {
            const user = /^https:\/\/m.tiktok.com\/node\/share\/user\/@\w+\?uniqueId=(\w+)&verifyFp=$/.exec(uri);
            if (user) {
                return { body: response.user(user[1]) };
            }
            return { body: null };
        }
        case /^https:\/\/m.tiktok.com\/node\/share\/tag\/\w+\?uniqueId=(\w+)$/.test(uri): {
            const hastag = /^https:\/\/m.tiktok.com\/node\/share\/tag\/\w+\?uniqueId=(\w+)$/.exec(uri);
            if (hastag) {
                return { body: response.hashtag(hastag[1]) };
            }
            return { body: null };
        }
        case uri === 'https://m.tiktok.com/share/item/list/':
            return { body: response.list };
        case uri === 'https://m.tiktok.com/api/item_list/':
            return { body: response.listV2 };
        case /^https:\/\/v([0-9]){2}.muscdn.com.+$/.test(uri):
            return Promise.resolve(
                'vid:v09044ae0000bk2qm0ivfsko76kvric01�gen)dataaweme_6647277225529838341]�mdatok�E���H��,� �#��x264 - core 152 r2854 e9a5903 - H.264/MPEG-4 AVC codec - Copy',
            );
        default:
            return { body: '' };
    }
};

export default request;
