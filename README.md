# TikTok Scraper & Downloader

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b3ef17f5a8504600931abfa60ac01006)](https://app.codacy.com/manual/drawrowfly/tiktok-scraper?utm_source=github.com&utm_medium=referral&utm_content=drawrowfly/tiktok-scraper&utm_campaign=Badge_Grade_Dashboard)

Scrape and download useful information from TikTok.

## No login or password are required

This is not an official API support and etc. This is just a scraper that is using TikTok Web API to scrape media.

---

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

## Features

-   Download **unlimited** post metadata from the User, Hashtag, Trends, or Music-Id pages
-   Save post metadata to the JSON/CSV files
-   Download media and save to the ZIP file
-   Sign URL to make custom request to the TIkTok API
-   Extract metadata from the the User or Hashtag pages
-   **Save previous progress and download only new videos that weren't downloaded before**. This feature only works from the CLI and only if **download** flag is on.

## To Do

-   [x] CLI: save progress to avoid downloading same videos
-   [x] **Rewrite everything in TypeScript**
-   [x] Improve proxy support
-   [x] Add tests
-   [ ] Scrape users/hashtag
-   [ ] Download video without the watermark
-   [ ] Web interface

## Contribution

-   Please use **develop** branch
-   Add tests if they are missing

```sh
yarn test
```

```sh
yarn build
```

## JSON/CSV output:

```
    id: 'VIDEO_ID',
    text: 'CAPTION',
    createTime: '1583870600',
    authorId: 'AUTHOR_ID',
    authorName: 'AUTHOR_USERNAME',
    authorFollowing: 208,
    authorFans: 2273771,
    authorHeart: 79791624,
    authorVideo: 1149,
    authorDigg: 8922,
    authorVerified: true,
    authorPrivate: false,
    authorSignature: 'AUTHOR_DESCRIPTION(BIO)',
    musicId: 'MUSIC_ID',
    musicName: 'AUTHOR_NICK',
    musicAuthor: 'AUTHOR_NAME',
    musicOriginal: '',
    imageUrl:'IMAGE_URL',
    videoUrl:'VIDEO_URL',
    diggCount: 2104,
    shareCount: 1,
    playCount: 9007,
    commentCount: 50,
    hashtags:
    [{ id: '69573911',
       name: 'PlayWithLife',
       title: 'HASHTAG_TITLE',
       cover: [Array]
    }...]
```

![Demo](https://i.imgur.com/6gIbBzo.png)

**Possible errors**

-   Unknown. Report them if you will receive any

## Installation

tiktok-scraper requires [Node.js](https://nodejs.org/) v10+ to run.

**Install from NPM**

```sh
npm i -g tiktok-scraper
```

**Install from YARN**

```sh
yarn global add tiktok-scraper
```

## USAGE

### In Terminal

```sh
$ tiktok-scraper --help

Usage: tiktok-scraper <command> [options]

Commands:
  tiktok-scraper user [id]     Scrape videos from username. Enter only username
  tiktok-scraper hashtag [id]  Scrape videos from hashtag. Enter hashtag without #
  tiktok-scraper trend         Scrape posts from current trends
  tiktok-scraper music [id]    Scrape posts from a music id number

Options:
  --help, -h              help                                         [boolean]
  --version               Show version number                          [boolean]
  --number, -n            Number of posts to scrape. If you will set 0 then all
                          posts will be scraped                    [default: 20]
  --proxy, -p             Set proxy                                [default: ""]
                                                                    [default: 0]
  --download, -d          Download and archive all scraped videos to a ZIP file
                                                      [boolean] [default: false]
  --filepath              Directory to save all output files.
                [default: "/Users/jackass/Documents/lang/NodeJs/tiktok-scraper"]
  --filetype, --type, -t  Type of output file where post information will be
                          saved. 'all' - save information about all posts to a
                          'json' and 'csv'
                                [choices: "csv", "json", "all"] [default: "csv"]
  --store, -s             Scraper will save the progress in the OS TMP folder
                          and in the future usage will only download new videos
                          avoiding duplicates         [boolean] [default: false]

Examples:
  tiktok-scraper user USERNAME -d -n 100
  tiktok-scraper hashtag HASHTAG_NAME -d -n 100
  tiktok-scraper trend -d -n 100
  tiktok-scraper music MUSICID -n 100
```

**Example 1:**
Scrape 300 video posts from user {USERNAME}. Save post info in to a CSV file (by default)

```sh
tiktok-scraper user USERNAME -n 300

Output:
CSV path: /{CURRENT_PATH}/user_1552945544582.csv
```

**Example 2:**
Scrape 100 posts from hashtag {HASHTAG_NAME}, download and save them to a ZIP archive. Save post info in to a JSON and CSV files (--filetype all)

```sh
tiktok-scraper hashtag HASHTAG_NAME -n 100 -d -t all

Output:
ZIP path: /{CURRENT_PATH}/hashtag_1552945659138.zip
JSON path: /{CURRENT_PATH}/hashtag_1552945659138.json
CSV path: /{CURRENT_PATH}/hashtag_1552945659138.csv
```

**Example 3:**
Scrape 50 posts from trends section, download them to a ZIP and save info to a csv file

```sh
tiktok-scraper trend -n 50 -d -t csv


Output:
ZIP path: /{CURRENT_PATH}/trend_1552945659138.zip
CSV path: /{CURRENT_PATH}/tend_1552945659138.csv
```

**Example 4:**
Scrape 100 posts from a particular music ID (numberical ID from TikTok URL)

```sh
tiktok-scraper music MUSICID -n 100

Output:
ZIP path: /{CURRENT_PATH}/music_1552945659138.zip
CSV path: /{CURRENT_PATH}/music_1552945659138.csv
```

**Example 5:**
Download 20 latest video post from the user {USERNAME} and save the progress to avoid downloading the same videos in the future

-   **NOTE** Progress can only be saved if **download** flag is on
-   When executing same command next time scraper will only download newly posted videos

```sh
tiktok-scraper user USERNAME -n 20 -d -store


Output:
ZIP path: /{CURRENT_PATH}/trend_1552945659138.zip
CSV path: /{CURRENT_PATH}/tend_1552945659138.csv
```

**To make it look better, when downloading posts the progress will be shown in terminal**

```sh
Downloading 6750670497744309509 [==============================] 100%
Downloading 6749962264020782342 [==============================] 100%
Downloading 6749433991113264390 [==============================] 100%
Downloading 6750671571968429318 [==============================] 100%
Downloading 6750668198011505926 [==============================] 100%
Downloading 6748611221903117574 [==============================] 100%
Downloading 6748606789551410438 [==============================] 100%
Downloading 6748139550251535621 [==============================] 100%
Downloading 6748616311166799110 [==============================] 100%
Downloading 6748048372625689861 [==============================] 100%
```

## Module

### Promise

```javascript
const TikTokScraper = require('tiktok-scraper');

// User feed by username
(async () => {
    try {
        const posts = await TikTokScraper.user('USERNAME', { number: 100 });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// User feed by user id
// Some TikTok user id's are larger then MAX_SAFE_INTEGER, you need to pass user id as a string
(async () => {
    try {
        const posts = await TikTokScraper.user(`USER_ID`, { number: 100, by_user_id: true });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// Trend
(async () => {
    try {
        const posts = await TikTokScraper.trend('', { number: 100 });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// Hashtag
(async () => {
    try {
        const posts = await TikTokScraper.hashtag('HASHTAG', { number: 100 });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// Get single user profile information: Number of followers and etc
// input - USERNAME
// options - not required
(async () => {
    try {
        const user = await TikTokScraper.getUserProfileInfo('USERNAME', options);
        console.log(user);
    } catch (error) {
        console.log(error);
    }
})();

// Get single hashtag information: Number of views and etc
// input - HASHTAG NAME
// options - not required
(async () => {
    try {
        const hashtag = await TikTokScraper.getHashtagInfo('HASHTAG', options);
        console.log(hashtag);
    } catch (error) {
        console.log(error);
    }
})();

// Sign tiktok Web Api URL
// url - full url
// options - you can set the User-Agent and other options
const rp = require('request-promise');

(async () => {
    try {
        const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36';
        const url = 'https://m.tiktok.com/share/item/list?secUid=&id=355503&type=3&count=30&minCursor=0&maxCursor=0&shareUid=&lang=';

        const signature = await TikTokScraper.signUrl(url, { userAgent });

        const result = await rp({
            uri: `${url}&_signature=${signature}`,
            headers: {
                'user-agent': userAgent,
            },
        });
        console.log(result);
    } catch (error) {
        console.log(error);
    }
})();
```

**Promise will return current result**

```javascript
{
    collector:[ARRAY_OF_DATA]
    //If {filetype} and {download} options are enbabled then:
    zip: '/{CURRENT_PATH}/user_1552963581094.zip',
    json: '/{CURRENT_PATH}/user_1552963581094.json',
    csv: '/{CURRENT_PATH}/user_1552963581094.csv'
}
```

### Event

```javascript
const TikTokScraper = require('tiktok-scraper');

const users = TikTokScraper.userEvent({ USERNAME }, { number: 30 });
users.on('data', json => {
    //data in JSON format
});
users.on('done', () => {
    //completed
});
users.on('error', error => {
    //error message
});
users.scrape();

const hashtag = TikTokScraper.hashtagEvent({ HASHTAG }, { number: 250, proxy: 'socks5://1.1.1.1:90' });
hashtag.on('data', json => {
    //data in JSON format
});
hashtag.on('done', () => {
    //completed
});
hashtag.on('error', error => {
    //error message
});
hashtag.scrape();
```

### Methods

```javascript
.user(id, options) //Scrape posts from a specific user (Promise)
.hashtag(id, options) //Scrape posts from hashtag section (Promise)
.trend('', options) // Scrape posts from a trends section (Promise)
.music(id, options) // Scrape posts by music id (Promise)

.userEvent(id, options) //Scrape posts from a specific user (Event)
.hashtagEvent(id, options) //Scrape posts from hashtag section (Event)
.trendEvent('', options) // Scrape posts from a trends section (Event)
.musicEvent(id, options) // Scrape posts by music id (Event)

.getUserProfileInfo('USERNAME', options) // Get user profile information
.getHashtagInfo('HASHTAG', options) // Get hashtag information
.signUrl('URL', options) // Get signature for the request
```

### Options

```javascript
let options = {
    // Number of posts to scrape: {int default: 20}
    number: 50,

    // Set proxy {string default: ''}
    // http proxy: 127.0.0.1:8080
    // socks proxy: socks5://127.0.0.1:8080
    proxy: '',

    // Set to {true} to search by user id: {boolean default: false}
    by_user_id: false,

    // Download posts or not. If true ZIP archive in {filepath} will be created: {boolean default: false}
    download: false,

    // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
    asyncDownload: 5,

    // File path where all files will be saved: {string default: 'CURRENT_DIR'}
    filepath: `CURRENT_DIR`,

    // Output with information can be saved to a CSV or JSON files: {string default: 'na'}
    // 'csv' to save in csv
    // 'json' to save in json
    // 'all' to save in json and csv
    // 'na' to skip this step
    filetype: `na`,

    // Custom User-Agent
    // {string default: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36' }
    userAgent: '',
};
```

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

License

---

**MIT**

**Free Software**
