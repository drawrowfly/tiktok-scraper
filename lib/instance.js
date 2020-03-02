const TikTokScraper = require('./');

const vending = options => vending.create(options);

vending.create = options => new TikTokScraper(options);

module.exports = vending;
