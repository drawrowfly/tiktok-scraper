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
	    - [Terminal Examples](#terminal-examples)
	    - [Manage Download History](#manage-download-history)
	    - [Scrape and Download in Batch](#batch-scrape-and-download-example)
	        - [Batch Scraping Output](#batch-scraping-output)
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
## Features

-   Download **unlimited** post metadata from the User, Hashtag, Trends, or Music-Id pages
-   Save post metadata to the JSON/CSV files
-   Download media **with and without the watermark** and save to the ZIP file
-   Download single video without the watermark from the CLI
-   Sign URL to make custom request to the TIkTok API
-   Extract metadata from the User, Hashtag and Single Video pages
-   **Save previous progress and download only new videos that weren't downloaded before**. This feature only works from the CLI and only if **download** flag is on.
-   **View and manage previously downloaded posts history in the CLI**
-   Scrape and download user,hashtag,music feeds and single videos specified in a file

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
-   [ ] CLI: Download without ZIP
-   [ ] Download audio files
-   [ ] Scrape users/hashtags
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
  --download, -d          Download and archive all scraped videos to the ZIP
                          file                        [boolean] [default: false]
  --filepath              File path to save all output files.
      [default: "/Users/karl.wint/Documents/projects/javascript/tiktok-scraper"]
  --filetype, --type, -t  Type of the output file where post information will
                          be saved. 'all' - save information about all posts to
                          the` 'json' and 'csv'
                                [choices: "csv", "json", "all"] [default: "csv"]
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
  --help                  Show help                                    [boolean]

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

#### Terminal Examples
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

**Example 6:**
Download 20 latest video post without the watermark from the trending feed

```sh
tiktok-scraper user USERNAME -n 20 -d -w


Output:
ZIP path: /{CURRENT_PATH}/trend_1552945659138.zip
CSV path: /{CURRENT_PATH}/tend_1552945659138.csv
```

**Example 7:**
Download single video without the watermark from the CLI

```sh
tiktok-scraper video https://www.tiktok.com/@tiktok/video/6807491984882765062

Output:
Video was saved in: /Users/USER/Downloads/6807491984882765062.mp4
```

**Example 8:**
View previous download history

```sh
tiktok-scraper history
```

### Manage Download History

![History](https://i.imgur.com/VnDKh72.png)

You can only view the history from the CLI and only if you have used **-s** flag in your previous scraper executions.

**-s** save download history to avoid downloading duplicate posts in the future

To view history record:

```sh
tiktok-scraper history
```

To delete single history record:

```sh
tiktok-scraper history -r TYPE:INPUT
tiktok-scraper history -r user:tiktok
tiktok-scraper history -r hashtag:summer
tiktok-scraper history -r trend
```

Set custom path where history files will be stored.

**NOTE: After setting the custom path you will have to specify it all the time so that the scraper knows the file location**

```
tiktok-scraper hashtag summer -s -d -n 10 --historypath /Blah/Blah/Blah
```

To delete all records:

```sh
tiktok-scraper history -r all
```

### Batch Scrape And Download Example

**This function works really good with fast internet and good proxies**

In order to download in batch you need to create a file(any name) with one value per line. Lines that are starting with ## are considered as comments and will be ignored.

To scrape data from the user feed, enter **username**.

To scrape from the user feed by user id, enter **id:USER_ID**.

To scrape from the hashtag feed, enter hashtag starting with **#**.

To scrape from the music feed, enter **music:MUSIC_ID**.

To download video, enter plain video url.

**File Example:**
```
## User feed by username <---- this is just a comment and hence it is not important
tiktok
charlidamelio
sam
bob

## User feed by user id
id:12312312312

## Hashtag feed
#love
#summer
#story

## Music feed
music:3242234234
music:46646
music:23423424234

## Single Videos. Each video will be downloaded without the watermark
https://www.tiktok.com/@shalisavdlaan/video/6788483055796391173
https://www.tiktok.com/@officialsaarx/video/6785180623263911174
https://www.tiktok.com/@dominos_nl/video/6786669305623842053
https://www.tiktok.com/@jessiejikki/video/6620697278451551493
https://www.tiktok.com/@.one_man_army/video/6798822211307310338
```

**Example 1 without proxy**

**FILE** - name of the file

**ASYNC_TASKS** - how many task(each line ins file is a task) should be started at the time. I have tested with 40 and it worked really well, if you have slow connection then do not set more then 5

Command below will download single videos without the watermark and will make attempt to download all the videos from the users, hashtags and musics feeds specified in the example file above and will save user, hashtag, music metadata to the JSON and CSV files. 
```sh
tiktok-scraper from-file FILE ASYNC_TASKS -d -f all
```

**Example 2 with the proxy**

It is always better to use proxies for any task especially when downloading in batches. You can set 1 proxy or you can point scraper to the file with the proxy list and scraper will use random proxy from that list per request.

**FILE** - name of the file

**ASYNC_TASKS** - how many task(each line is a task) should be started at the time. 

**PROXY** - proxy file

**Proxy File Example**
```
user:password@127.0.0.1:8080
user:password@127.0.0.1:8081
127.0.0.1:8082
socks5://127.0.0.1:8083
socks4://127.0.0.1:8084
```

Command below will download single videos without the watermark and will make attempt to download 50 videos from each user, hashtag and music feed specified in the example file above. 
```sh
tiktok-scraper from-file FILE ASYNC_TASKS --proxy-file PROXY -d -n 50
```

### Batch Scraping Output

![Demo](https://i.imgur.com/9Gt4xgL.png)

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
    // {string default: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36' }
    userAgent: '',

    // Download video without the watermark: {boolean default: false}
    // Set to true to download without the watermark
    // This option will affect the execution speed
    noWaterMark: false,
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


<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

License

---

**MIT**

**Free Software**
