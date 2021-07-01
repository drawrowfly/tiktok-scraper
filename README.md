# TikTok Scraper & Downloader

![NPM](https://img.shields.io/npm/l/tiktok-scraper.svg?style=for-the-badge) ![npm](https://img.shields.io/npm/v/tiktok-scraper.svg?style=for-the-badge) ![Codacy grade](https://img.shields.io/codacy/grade/b3ef17f5a8504600931abfa60ac01006.svg?style=for-the-badge) ![CI](https://img.shields.io/github/workflow/status/drawrowfly/tiktok-scraper/CI?style=for-the-badge)

Scrape and download useful information from TikTok.

## No login or password are required

This is not an official API support and etc. This is just a scraper that is using TikTok Web API to scrape media and related meta information.

---

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

<a href="https://discord.gg/ffskw9k" target="_blank"><img src="https://i.imgur.com/dUwek7T.jpg" alt="Discord Server" width="435" height="190" ></a>


---
## Content
- [Features](#features)
- [To Do](#to-do)
- [Contribution](#contribution)
- [Installation](#installation)
- [Usage](#usage)
	- [In Terminal](#in-terminal)
	    - [Terminal Examples](https://github.com/drawrowfly/tiktok-scraper/tree/master/examples/CLI/Examples.md)
	    - [Manage Download History](https://github.com/drawrowfly/tiktok-scraper/tree/master/examples/CLI/DownloadHistory.md)
	    - [Scrape and Download in Batch](https://github.com/drawrowfly/tiktok-scraper/tree/master/examples/CLI/BatchDownload.md)
	    - [Output File Example](#output-file-example)
	- [Docker](#docker)
	    - [Build](#build)
	    - [Run](#run)
	- [Module](#docker)
	    - [Methods](#methods)
	    - [Options](#options)
	    - [Use with Promises](#promise)
	    - [Use with Events](#event)
	    - [How to get/set session value](#get-set-session)
	    - [How to access/download video](#download-video)
	    - [Output Example](#json-output-example)
	        - [Video Feed Methods](#video-feed)
	        - [getUserProfileInfo](#getUserProfileInfo)
	        - [getHashtagInfo](#getHashtagInfo)
	        - [getVideoMeta](#getVideoMeta)
            - [getMusicInfo](#getMusicInfo)
## Important notes
- As of right now it is NOT possible to download video without the watermark

## Features

-   Download **unlimited** post metadata from the User, Hashtag, Trends, or Music-Id pages
-   Save post metadata to the JSON/CSV files
-   Download media **with and without the watermark** and save to the ZIP file
-   Download single video without the watermark from the CLI
-   Sign URL to make custom request to the TikTok API
-   Extract metadata from the User, Hashtag and Single Video pages
-   **Save previous progress and download only new videos that weren't downloaded before**. This feature only works from the CLI and only if **download** flag is on.
-   **View and manage previously downloaded posts history in the CLI**
-   Scrape and download user, hashtag, music feeds and single videos specified in the file in batch mode

## To Do

-   [x] CLI: save progress to avoid downloading same videos
-   [x] **Rewrite everything in TypeScript**
-   [x] Improve proxy support
-   [x] Add tests
-   [x] Download video without the watermark
-   [x] Indicate in the output file(csv/json) if the video was downloaded or not
-   [x] Build and run from Docker
-   [x] CLI: Scrape and download in batch
-   [x] CLI: Load proxies from a file
-   [x] CLI: Optional ZIP
-   [x] Renew API
-   [x] Set WebHook URL (CLI)
-   [x] Add new method to collect music metadata
-   [ ] Add Manual Pagination
-   [ ] Improve documentation
-   [ ] Download audio files
-   [ ] Web interface

## Contribution

-   Don't forget about tests

```sh
yarn test
```

```sh
yarn build
```
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
  tiktok-scraper video [id]    Download single video without the watermark
  tiktok-scraper history       View previous download history
  tiktok-scraper from-file [file] [async]  Scrape users, hashtags, music, videos mentioned
                                in a file. 1 value per 1 line

Options:
  --version            Show version number                             [boolean]
  --session            Set session cookie value. Sometimes session can be
                       helpful when scraping data from any method  [default: ""]
  --session-file       Set path to the file with list of active sessions. One
                       session per line!                           [default: ""]
  --timeout            Set timeout between requests. Timeout is in Milliseconds:
                       1000 mls = 1 s                               [default: 0]
  --number, -n         Number of posts to scrape. If you will set 0 then all
                       posts will be scraped                        [default: 0]
  --since              Scrape no posts published before this date (timestamp).
                       If set to 0 the filter is deactived          [default: 0]
  --proxy, -p          Set single proxy                            [default: ""]
  --proxy-file         Use proxies from a file. Scraper will use random proxies
                       from the file per each request. 1 line 1 proxy.
                                                                   [default: ""]
  --download, -d       Download video posts to the folder with the name input
                       [id]                           [boolean] [default: false]
  --asyncDownload, -a  Number of concurrent downloads               [default: 5]
  --hd                 Download video in HD. Video size will be x5-x10 times
                       larger and this will affect scraper execution speed. This
                       option only works in combination with -w flag
                                                      [boolean] [default: false]
  --zip, -z            ZIP all downloaded video posts [boolean] [default: false]
  --filepath           File path to save all output files.
      [default: "/Users/karl.wint/Documents/projects/javascript/tiktok-scraper"]
  --filetype, -t       Type of the output file where post information will be
                       saved. 'all' - save information about all posts to the`
                       'json' and 'csv'
                               [choices: "csv", "json", "all", ""] [default: ""]
  --filename, -f       Set custom filename for the output files    [default: ""]
  --noWaterMark, -w    Download video without the watermark. NOTE: With the
                       recent update you only need to use this option if you are
                       scraping Hashtag Feed. User/Trend/Music feeds will have
                       this url by default            [boolean] [default: false]
  --store, -s          Scraper will save the progress in the OS TMP or Custom
                       folder and in the future usage will only download new
                       videos avoiding duplicates     [boolean] [default: false]
  --historypath        Set custom path where history file/files will be stored
                   [default: "/var/folders/d5/fyh1_f2926q7c65g7skc0qh80000gn/T"]
  --remove, -r         Delete the history record by entering "TYPE:INPUT" or
                       "all" to clean all the history. For example: user:bob
                                                                   [default: ""]
  --webHookUrl         Set webhook url to receive scraper result as HTTP
                       requests. For example to your own API       [default: ""]
  --method             Receive data to your webhook url as POST or GET request
                                      [choices: "GET", "POST"] [default: "POST"]
  --help               Show help                                       [boolean]

Examples:
  tiktok-scraper user USERNAME -d -n 100 --session sid_tt=dae32131231
  tiktok-scraper trend -d -n 100 --session sid_tt=dae32131231
  tiktok-scraper hashtag HASHTAG_NAME -d -n 100 --session sid_tt=dae32131231
  tiktok-scraper music MUSIC_ID -d -n 50 --session sid_tt=dae32131231
  tiktok-scraper video https://www.tiktok.com/@tiktok/video/6807491984882765062 -d
  tiktok-scraper history
  tiktok-scraper history -r user:bob
  tiktok-scraper history -r all
  tiktok-scraper from-file BATCH_FILE ASYNC_TASKS -d
```
- [Terminal Examples](https://github.com/drawrowfly/tiktok-scraper/tree/master/examples/CLI/Examples.md)
- [Manage Download History](https://github.com/drawrowfly/tiktok-scraper/tree/master/examples/CLI/DownloadHistory.md)
- [Scrape and Download in Batch](https://github.com/drawrowfly/tiktok-scraper/tree/master/examples/CLI/BatchDownload.md)

### Output File Example

![Demo](https://i.imgur.com/6gIbBzo.png)

## Docker

By using docker you won't be able to use --filepath and --historypath , but you can set volume(**host path where all files will be saved**) by using -v

##### Build

```sh
docker build . -t tiktok-scraper
```

##### Run

**Example 1:**
All files including history file will be saved in the directory(\$pwd) where you running the docker from

```sh
docker run -v $(pwd):/usr/app/files tiktok-scraper user tiktok -d -n 5 -s
```

**Example 2:**
All files including history file will be saved in /User/blah/downloads

```sh
docker run -v /User/blah/downloads:/usr/app/files tiktok-scraper user tiktok -d -n 5 -s
```

## Module

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
.getVideoMeta('WEB_VIDEO_URL', options) // Get video meta info, including video url without the watermark
.getMusicInfo('https://www.tiktok.com/music/original-sound-6801885499343571718', options) // Get music metadata
```

### Options

```javascript
const options = {
    // Number of posts to scrape: {int default: 20}
    number: 50,

    // Scrape posts published since this date: { int default: 0}
    since: 0,

    // Set session: {string[] default: ['']}
    // Authenticated session cookie value is required to scrape user/trending/music/hashtag feed
    // You can put here any number of sessions, each request will select random session from the list
    sessionList: ['sid_tt=21312213'],

    // Set proxy {string[] | string default: ''}
    // http proxy: 127.0.0.1:8080
    // socks proxy: socks5://127.0.0.1:8080
    // You can pass proxies as an array and scraper will randomly select a proxy from the array to execute the requests
    proxy: '',

    // Set to {true} to search by user id: {boolean default: false}
    by_user_id: false,

    // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
    asyncDownload: 5,

    // How many post should be scraped asynchronously: {int default: 3}
    // Current option will be applied only with current types: music and hashtag
    // With other types it is always 1 because every request response to the TikTok API is providing the "maxCursor" value
    // that is required to send the next request
    asyncScraping: 3,

    // File path where all files will be saved: {string default: 'CURRENT_DIR'}
    filepath: `CURRENT_DIR`,

    // Custom file name for the output files: {string default: ''}
    fileName: `CURRENT_DIR`,

    // Output with information can be saved to a CSV or JSON files: {string default: 'na'}
    // 'csv' to save in csv
    // 'json' to save in json
    // 'all' to save in json and csv
    // 'na' to skip this step
    filetype: `na`,

    // Set custom headers: user-agent, cookie and etc
    // NOTE: When you parse video feed or single video metadata then in return you will receive {headers} object
    // that was used to extract the information and in order to access and download video through received {videoUrl} value you need to use same headers
    headers: {
        'user-agent': "BLAH",
        referer: 'https://www.tiktok.com/',
        cookie: `tt_webid_v2=68dssds`,
    },

    // Download video without the watermark: {boolean default: false}
    // Set to true to download without the watermark
    // This option will affect the execution speed
    noWaterMark: false,

    // Create link to HD video: {boolean default: false}
    // This option will only work if {noWaterMark} is set to {true}
    hdVideo: false,

    // verifyFp is used to verify the request and avoid captcha
    // When you are using proxy then there are high chances that the request will be
    // blocked with captcha
    // You can set your own verifyFp value or default(hardcoded) will be used
    verifyFp: '',

    // Switch main host to Tiktok test enpoint.
    // When your requests are blocked by captcha you can try to use Tiktok test endpoints.
    useTestEndpoints: false
};
```

Don't forget to check the **examples** folder

### Promise

```javascript
const TikTokScraper = require('tiktok-scraper');

// User feed by username
(async () => {
    try {
        const posts = await TikTokScraper.user('USERNAME', {
            number: 100,
            sessionList: ['sid_tt=58ba9e34431774703d3c34e60d584475;']
        });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// User feed by user id
// Some TikTok user id's are larger then MAX_SAFE_INTEGER, you need to pass user id as a string
(async () => {
    try {
        const posts = await TikTokScraper.user(`USER_ID`, {
            number: 100,
            by_user_id: true,
            sessionList: ['sid_tt=58ba9e34431774703d3c34e60d584475;']
        });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// Trending feed
(async () => {
    try {
        const posts = await TikTokScraper.trend('', {
            number: 100,
            sessionList: ['sid_tt=58ba9e34431774703d3c34e60d584475;']
        });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// Hashtag feed
(async () => {
    try {
        const posts = await TikTokScraper.hashtag('HASHTAG', {
            number: 100,
            sessionList: ['sid_tt=58ba9e34431774703d3c34e60d584475;']
        });
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


// Get single video metadata
// input - WEB_VIDEO_URL
// For example: https://www.tiktok.com/@tiktok/video/6807491984882765062
// options - not required
(async () => {
    try {
        const videoMeta = await TikTokScraper.getVideoMeta('https://www.tiktok.com/@tiktok/video/6807491984882765062', options);
        console.log(videoMeta);
    } catch (error) {
        console.log(error);
    }
})();
```

### Event

```javascript
const TikTokScraper = require('tiktok-scraper');

const users = TikTokScraper.userEvent("tiktok", { number: 30 });
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

const hashtag = TikTokScraper.hashtagEvent("summer", { number: 250, proxy: 'socks5://1.1.1.1:90' });
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
### Get Set Session
**NOT REQUIRED**

**Very common problem is when tiktok is blacklisting your IP/PROXY and in such case you can try to set session and there will be higher chances for success**

Get the session:
- Open https://www.tiktok.com/ in any browser
- Login in to your account
- Right click -> inspector -> networking
- Refresh page -> select any request that was made to the tiktok -> go to the Request Header sections -> Cookies
- Find in cookies **sid_tt** value. It usually looks like that: **sid_tt=521kkadkasdaskdj4j213j12j312;**
- **sid_tt=521kkadkasdaskdj4j213j12j312;** - this will be your authenticated session cookie value that should be used to scrape user/hashtag/music/trending feed

Set the session:
- **CLI**:
    -  Set single session by using option **--session**. For example **--session sid_tt=521kkadkasdaskdj4j213j12j312;**
    -  Set path to the file with the list of sessions by using option **--session-file**. For example **--session-file /var/bob/sessionList.txt**
        - Example content /var/bob/sessionList.txt:
        ```
        sid_tt=521kkadkasdaskdj4j213j12j312;
        sid_tt=521kkadkasdaskdj4j213j12j312;
        sid_tt=521kkadkasdaskdj4j213j12j312;
        sid_tt=521kkadkasdaskdj4j213j12j312;
        ```

- In the **MODULE** you can set session by setting the option value sessionList . For example **sessionList:["sid_tt=521kkadkasdaskdj4j213j12j312;", "sid_tt=12312312312312;"]**

### Download Video
**This part is related to the MODULE usage (NOT THE CLI)**

The **{videoUrl}** value is binded to the cookie value **{tt_webid_v2}** that can contain **any value**

#### Method 1: default headers

When you extract videos from the user, hashtag, music, trending feed or single video then in response besides the video metadata you will receive **headers** object that will contain params that were used to extract the data. Here is the important part, **in order to access/download video through {videoUrl} value you need to use same {headers} values**.

```json
    headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
        "referer": "https://www.tiktok.com/",
        "cookie": "tt_webid_v2=689854141086886123"
    },
```
#### Method 2: custom headers

You can pass your own headers with the **{options}**.

```javascript
const headers = {
    "user-agent": "BOB",
    "referer": "https://www.tiktok.com/",
    "cookie": "tt_webid_v2=BOB"
}
getVideoMeta('WEB_VIDEO_URL', {headers})
user('WEB_VIDEO_URL', {headers})
hashtag('WEB_VIDEO_URL', {headers})
trend('WEB_VIDEO_URL', {headers})
music('WEB_VIDEO_URL', {headers})
// And after you can access video through {videoUrl} value by using same custom headers
```


### Json Output Example

##### Video Feed
Example output for the methods: **user, hashtag, trend, music, userEvent, hashtagEvent, musicEvent, trendEvent**
```javascript
{
    headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36',
        referer: 'https://www.tiktok.com/',
        cookie: 'tt_webid_v2=689854141086886123'
    },
    collector:[{
        id: 'VIDEO_ID',
        text: 'CAPTION',
        createTime: '1583870600',
        authorMeta:{
            id: 'USER ID',
            name: 'USERNAME',
            following: 195,
            fans: 43500,
            heart: '1093998',
            video: 3,
            digg: 95,
            verified: false,
            private: false,
            signature: 'USER BIO',
            avatar:'AVATAR_URL'
        },
        musicMeta:{
            musicId: '6808098113188120838',
            musicName: 'blah blah',
            musicAuthor: 'blah',
            musicOriginal: true,
            playUrl: 'SOUND/MUSIC_URL',
        },
        covers:{
            default: 'COVER_URL',
            origin: 'COVER_URL',
            dynamic: 'COVER_URL'
        },
        imageUrl:'IMAGE_URL',
        videoUrl:'VIDEO_URL',
        videoUrlNoWaterMark:'VIDEO_URL_WITHOUT_THE_WATERMARK',
        videoMeta: { width: 480, height: 864, ratio: 14, duration: 14 },
        diggCount: 2104,
        shareCount: 1,
        playCount: 9007,
        commentCount: 50,
        mentions: ['@bob', '@sam', '@bob_again', '@and_sam_again'],
        hashtags:
        [{
            id: '69573911',
            name: 'PlayWithLife',
            title: 'HASHTAG_TITLE',
            cover: [Array]
        }...],
        downloaded: true
    }...],
    //If {filetype} and {download} options are enbabled then:
    zip: '/{CURRENT_PATH}/user_1552963581094.zip',
    json: '/{CURRENT_PATH}/user_1552963581094.json',
    csv: '/{CURRENT_PATH}/user_1552963581094.csv'
}
```

##### getUserProfileInfo

```javascript
{
    secUid: 'MS4wLjABAAAAv7iSuuXDJGDvJkmH_vz1qkDZYo1apxgzaxdBSeIuPiM',
    userId: '107955',
    isSecret: false,
    uniqueId: 'tiktok',
    nickName: 'TikTok',
    signature: 'Make Your Day',
    covers: ['COVER_URL'],
    coversMedium: ['COVER_URL'],
    following: 490,
    fans: 38040567,
    heart: '211522962',
    video: 93,
    verified: true,
    digg: 29,
}
```

##### getHashtagInfo

```javascript
{
    challengeId: '4231',
    challengeName: 'love',
    text: '',
    covers: [],
    coversMedium: [],
    posts: 66904972,
    views: '194557706433',
    isCommerce: false,
    splitTitle: ''
}
```

##### getVideoMeta

```javascript
{
    headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36',
        referer: 'https://www.tiktok.com/',
        cookie: 'tt_webid_v2=689854141086886123'
    },
    collector:[{
        id: '6807491984882765062',
        text: 'We’re kicking off the #happyathome live stream series today at 5pm PT!',
        createTime: '1584992742',
        authorMeta: { id: '6812221792183403526', name: 'blah' },
        musicMeta:{
            musicId: '6822233276137213677',
            musicName: 'blah',
            musicAuthor: 'blah'
        },
        imageUrl: 'IMAGE_URL',
        videoUrl: 'VIDEO_URL',
        videoUrlNoWaterMark: 'VIDEO_URL_WITHOUT_THE_WATERMARK',
        videoMeta: { width: 480, height: 864, ratio: 14, duration: 14 },
        covers:{
            default: 'COVER_URL',
            origin: 'COVER_URL'
        },
        diggCount: 49292,
        shareCount: 339,
        playCount: 614678,
        commentCount: 4023,
        downloaded: false,
        hashtags: [],
    }]
}
```

##### getMusicInfo

```javascript
{
    music: {
        id: '6882925279036066566',
        title: 'doja x calabria',
        playUrl: 'dfdfdfdf',
        coverThumb:
            'dfdfdf',
        coverMedium:
            'dfdfdf',
        coverLarge:
            'fdfdf',
        authorName: 'bryce',
        original: true,
        playToken:
            'ffdfdf',
        keyToken: 'dfdfdfd',
        audioURLWithcookie: false,
        private: false,
        duration: 46,
        album: '',
    },
    author: {
        id: '6835300004094166021',
        uniqueId: 'mashupsbybryce',
        nickname: 'bryce',
        avatarThumb:
            'dfdfd',
        avatarMedium:
            'dfdfdf',
        avatarLarger:
            'dfdfdf',
        signature: 'hi ily :)\n70k sounds cool tbh\n👇follow my soundcloud & insta👇',
        verified: false,
        secUid: 'MS4wLjABAAAA1_5bjLAamayD4rv3q49qJGa_7dZ5jzExTO0ozOybqIwwhw5TAg_iM25lkO94DM3K',
        secret: false,
        ftc: false,
        relation: 0,
        openFavorite: false,
        commentSetting: 0,
        duetSetting: 0,
        stitchSetting: 0,
        privateAccount: false,
    },
    stats: { videoCount: 361700 },
    shareMeta: {
        title: 'bryceyouloser | ♬ doja x calabria | on TikTok',
        desc: '361.0k videos - Watch awesome short ' + 'videos created with ♬ doja x calabria',
    },
};
```

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

License

---

**MIT**

**Free Software**
