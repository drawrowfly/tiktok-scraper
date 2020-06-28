# TikTok Scraper & Downloader

![NPM](https://img.shields.io/npm/l/tiktok-scraper.svg?style=for-the-badge) ![npm](https://img.shields.io/npm/v/tiktok-scraper.svg?style=for-the-badge) ![Codacy grade](https://img.shields.io/codacy/grade/b3ef17f5a8504600931abfa60ac01006.svg?style=for-the-badge) ![CI](https://img.shields.io/github/workflow/status/drawrowfly/tiktok-scraper/CI?style=for-the-badge)

Scrape and download useful information from TikTok.

## No login or password are required

This is not an official API support and etc. This is just a scraper that is using TikTok Web API to scrape media and related meta information.

---

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

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
	    - [Output Example](#json-output-example)
	        - [Video Feed Methods](#video-feed)
	        - [getUserProfileInfo](#getUserProfileInfo)
	        - [getHashtagInfo](#getHashtagInfo)
	        - [getVideoMeta](#getVideoMeta)
            - [getMusicInfo](#getMusicInfo)
## Features

-   Download **unlimited** post metadata from the User, Hashtag, Trends, or Music-Id pages
-   Save post metadata to the JSON/CSV files
-   Download media **with and without the watermark** and save to the ZIP file
-   Download single video without the watermark from the CLI
-   Sign URL to make custom request to the TIkTok API
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
-   [x] CLi: Load proxies from a file
-   [x] CLI: Optional ZIP
-   [x] Renew API
-   [x] Set WebHook URL (CLI)
-   [ ] Add new method to collect music metadata
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
  --version               Show version number                          [boolean]
  --timeout               Set timeout between requests. Timeout is in
                          Milliseconds: 1000 mls = 1 s              [default: 0]
  --number, -n            Number of posts to scrape. If you will set 0 then all
                          posts will be scraped                     [default: 0]
  --proxy, -p             Set single proxy                         [default: ""]
  --proxy-file            Use proxies from a file. Scraper will use random
                          proxies from the file per each request. 1 line 1
                          proxy.                                   [default: ""]
  --download, -d          Download video posts to the folder with the name input
                          [id]                        [boolean] [default: false]
  --asyncDownload, -a     Number of concurrent downloads            [default: 5]
  --hd                    Download video in HD. Video size will be x5-x10 times
                          larger and this will affect scraper execution speed.
                          This option only works in combination with -w flag
                                                      [boolean] [default: false]
  --zip, -z               ZIP all downloaded video posts
                                                      [boolean] [default: false]
  --filepath              File path to save all output files.
      [default: "/Users/blah/blah"]
  --filetype, --type, -t  Type of the output file where post information will
                          be saved. 'all' - save information about all posts to
                          the` 'json' and 'csv'
                               [choices: "csv", "json", "all", ""] [default: ""]
  --filename, -f          Set custom filename for the output files [default: ""]
  --noWaterMark, -w       Download video without the watermark. This option will
                          affect the execution speed  [boolean] [default: false]
  --store, -s             Scraper will save the progress in the OS TMP or Custom
                          folder and in the future usage will only download new
                          videos avoiding duplicates  [boolean] [default: false]
  --historypath           Set custom path where history file/files will be
                          stored
                   [default: "/var/folders/d5/fyh1_f2926q7c65g7skc0qh80000gn/T"]
  --remove, -r            Delete the history record by entering "TYPE:INPUT" or
                          "all" to clean all the history. For example: user:bob
                                                                   [default: ""]
  --webHookUrl       Set webhook url to receive scraper result as HTTP requests.
                     For example to your own API                   [default: ""]
  --method           Receive data to your webhook url as POST or GET request
                                      [choices: "GET", "POST"] [default: "POST"]
  --help             Show help                                         [boolean]

Examples:
  tiktok-scraper user USERNAME -d -n 100
  tiktok-scraper user USERNAME -d -n 100 -f customFileName
  tiktok-scraper hashtag HASHTAG_NAME -d -n 100
  tiktok-scraper trend -d -n 100
  tiktok-scraper music MUSICID -n 100
  tiktok-scraper music MUSIC_ID -d -n 50
  tiktok-scraper video https://www.tiktok.com/@tiktok/video/6807491984882765062
  tiktok-scraper history
  tiktok-scraper history -r user:bob
  tiktok-scraper history -r all
  tiktok-scraper from-file BATCH_FILE ASYNC_TASKS -d -n 25
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

    // Custom User-Agent
    // {string default: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{RANDOM_VERSION}.0.3987.122 Safari/537.36' }
    userAgent: '',
    
    // Download video without the watermark: {boolean default: false}
    // Set to true to download without the watermark
    // This option will affect the execution speed
    noWaterMark: false,
    
    // Create link to HD video: {boolean default: false}
    // This option will only work if {noWaterMark} is set to {true}
    hdVideo: false,
};
```

Don't forget to check the **examples** folder

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

// Trending feed
(async () => {
    try {
        const posts = await TikTokScraper.trend('', { number: 100 });
        console.log(posts);
    } catch (error) {
        console.log(error);
    }
})();

// Hashtag feed
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

const users = TikTokScraper.userEvent("tiktok" { number: 30 });
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

### Json Output Example

##### Video Feed
Example output for the methods: **user, hashtag, trend, music, userEvent, hashtagEvent, musicEvent, trendEvent**
```javascript
{
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
}
```

##### getMusicInfo

```javascript
{
    musicId: '6801885499343571718',
    musicName: 'original sound',
    uniqueId: 'tiktok',
    secUid: 'MS4wLjABAAAAv7iSuuXDJGDvJkmH_vz1qkDZYo1apxgzaxdBSeIuPiM',
    authorId: '107955',
    authorName: 'tiktok',
    playUrl: {
        Uri: 'musically-maliva-obj/1660617654568981.mp3',
        UrlList: ['https://p16-va-tiktok.ibyteimg.com/obj/musically-maliva-obj/1660617654568981.mp3'],
    },
    covers: ['https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_100x100.jpeg'],
    posts: 214,
    original: true,
    authorCovers: ['https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_720x720.jpeg'],
    coversMedium: ['https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/1645136815763462~c5_720x720.jpeg'],
    playToken:
        'eyJHZXRQbGF5SW5mb1Rva2VuIjoiQWN0aW9uPUdldFBsYXlJbmZvXHUwMDI2VmVyc2lvbj0yMDE5LTAzLTE1XHUwMDI2WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTZcdTAwMjZYLUFtei1DcmVkZW50aWFsPUFLTFRNek0xTUdJMFlUZzVOMlkwTkRjNFptRXlPVFl4TXpJeFpqWmpNV05qTnpnJTJGMjAyMDA2MjglMkZjbi1ub3J0aC0xJTJGdm9kJTJGYXdzNF9yZXF1ZXN0XHUwMDI2WC1BbXotRGF0ZT0yMDIwMDYyOFQxNTE1MzBaXHUwMDI2WC1BbXotRXhwaXJlcz0zbTBzXHUwMDI2WC1BbXotTm90U2lnbkJvZHk9XHUwMDI2WC1BbXotU2lnbmF0dXJlPWUyOGM2M2JjZTVmZDc1NmM2Y2QxOWJjMmViZTI0Mjk4NTBmODc2NjliNDk3ZTg0NjYzOWFlNzNlZGRmMzZlNGNcdTAwMjZYLUFtei1TaWduZWRIZWFkZXJzPVx1MDAyNlgtQW16LVNpZ25lZFF1ZXJpZXM9QWN0aW9uJTNCVmVyc2lvbiUzQlgtQW16LUFsZ29yaXRobSUzQlgtQW16LUNyZWRlbnRpYWwlM0JYLUFtei1EYXRlJTNCWC1BbXotRXhwaXJlcyUzQlgtQW16LU5vdFNpZ25Cb2R5JTNCWC1BbXotU2lnbmVkSGVhZGVycyUzQlgtQW16LVNpZ25lZFF1ZXJpZXMlM0Jjb2RlY190eXBlJTNCZm9ybWF0X3R5cGUlM0J2aWRlb19pZFx1MDAyNmNvZGVjX3R5cGU9NVx1MDAyNmZvcm1hdF90eXBlPWhsc1x1MDAyNnZpZGVvX2lkPXYwOTk0Mjc3MDAwMGJwaWl2NTM5cTBiOWQ2ZHFwc3VnIiwiVmVyc2lvbiI6InYxIn0=',
    keyToken: 'HMAC-SHA1%3A1.0%3A1593357510%3AAKLTMzM1MGI0YTg5N2Y0NDc4ZmEyOTYxMzIxZjZjMWNjNzg%3AGIpA60%2B9EDlcP1MXCTeI%2BEpzmGg%3D',
    audioURLWithCookie: false,
    private: false,
}
```

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

License

---

**MIT**

**Free Software**
