export const makeid = (len: number) => {
    let text = '';
    const char_list = '0123456789';
    for (let i = 0; i < len; i += 1) {
        text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return text;
};

export const makeidHex = (len: number) => {
    let text = '';
    const char_list = '0123456789abcdef';
    for (let i = 0; i < len; i += 1) {
        text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return text;
};

export const makeVerifyFp = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charlen = chars.length;
    const time = Buffer.from(new Date().getTime().toString()).toString('base64');
    const arr = '0'.repeat(36).split('');
    arr[8] = '_';
    arr[13] = '_';
    arr[18] = '_';
    arr[23] = '_';
    arr[14] = '4';
    const str = arr.map(x => (x === '0' ? chars.charAt(Math.floor(Math.random() * charlen)) : x)).join('');
    return `verify_${time.toLowerCase()}_${str}`;
};
