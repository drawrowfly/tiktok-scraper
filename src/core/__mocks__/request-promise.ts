import response from './response';

const request = options => {
    const { uri } = options;
    switch (true) {
        case uri === 'https://www.tiktok.com/trending':
            return { body: response.tac };
        case /^https:\/\/m.tiktok.com\/node\/share\/user\/@(\w+)$/.test(uri): {
            const user = /^https:\/\/m.tiktok.com\/node\/share\/user\/@(\w+)$/.exec(uri);
            if (user) {
                return { body: response.user(user[1]) };
            }
            return { body: null };
        }
        case /^https:\/\/m.tiktok.com\/node\/share\/tag\/(\w+)$/.test(uri): {
            const hastag = /^https:\/\/m.tiktok.com\/node\/share\/tag\/(\w+)$/.exec(uri);
            if (hastag) {
                return { body: response.hashtag(hastag[1]) };
            }
            return { body: null };
        }
        case uri === 'https://m.tiktok.com/share/item/list':
            return { body: response.list() };
        default:
            return { body: '' };
    }
};

export default request;
