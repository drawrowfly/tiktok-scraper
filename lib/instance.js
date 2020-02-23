'use strict';

const TikTokScraper = require('./');

let vending = options => {
    return vending.create(options);
};

vending.create = options => {
    let instance = new TikTokScraper(options);

    if (options.event) {
        instance._scrape();
        return instance;
    }
    return instance;
};

module.exports = vending;
