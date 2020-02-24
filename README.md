
# TikTok Scraper & Downloader

Scrape and download useful information from TikTok.

**No login or password are required.**

This is not an official API support and etc. This is just a scraper that is using TikTok Web API to scrape media.

***
<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
***

## Features
*   Scrape video posts information from username, hashtag, trends, or music-id
*   Scrape user profile information **Following, Followers, Heart, Video count, Digg and Verified or Not**
*   Download and save media to a ZIP archive
*   Create JSON/CSV files with a post information

**Note:**
*   If you need to download all video posts then set {number} to 0
*   **When scraping user profile information you can recieve a Rate Limit error, everything depends from the number of profiles that you scrape. It means that all user profile metrics will be 0 or false**

**Posts - JSON/CSV output:**
```
    id: 'POST_ID',
    text: 'POST_DESCRIPTION',
    createTime: '1577735724',
    authorId: 'AUTHOR_ID',
    authorName: 'USERNAME',
    authorFollowing: 615,
    authorFans: 63179,
    authorHeart: 744827,
    authorVideo: 12,
    authorDigg: 6718,
    authorVerified: false,
    musicId: 'MUSIC_ID',
    musicName: 'Why School Is Like This',
    musicAuthor: 'Comedy',
    musicOriginal: true,
    videoUrl: 'VIDEO_URL',
    diggCount: 728529,
    shareCount: 99053,
    playCount: 8310028,
    commentCount: 6885
```
![Demo](https://i.imgur.com/6gIbBzo.png)

**Possible errors**
*   Unknown. Report them if you will receive any

## Installation
tiktok-scraper requires [Node.js](https://nodejs.org/) v10+ to run.

**Install from NPM**
```sh
$ npm i -g tiktok-scraper
```

**Install from YARN**
```sh
$ yarn global add tiktok-scraper
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
  --timeout               If you will receive 'rate limit' error , you can try
                          to set timeout. Timeout is in mls: 1000 mls = 1 second
                                                                    [default: 0]
  --download, -d          Download and archive all scraped videos to a ZIP file
                                                      [boolean] [default: false]
  --userdata, -u          Scrape user profile information Followers, Followings
                          and etc                     [boolean] [default: false]
  --filepath              Directory to save all output files.
                [default: "/Users/jackass/Documents/lang/NodeJs/tiktok-scraper"]
  --filetype, --type, -t  Type of output file where post information will be
                          saved. 'all' - save information about all posts to a
                          'json' and 'csv'
                                [choices: "csv", "json", "all"] [default: "csv"]

Examples:
  tiktok-scraper user USERNAME -d -n 100
  tiktok-scraper hashtag HASHTAG_NAME -d -n 100
  tiktok-scraper trend -d -n 100
  tiktok-scraper music MUSICID -n 100
```

**Example 1:**
Scrape 300 video posts from user {USERNAME}. Save post info in to a CSV file (by default) 
```sh
$ tiktok-scraper user USERNAME -n 300

Output:
CSV path: /{CURRENT_PATH}/user_1552945544582.csv
```

**Example 2:**
Scrape 100 posts from hashtag {HASHTAG_NAME}, download and save them to a ZIP archive. Save post info in to a JSON and CSV files (--filetype all)
```
$ tiktok-scraper hashtag HASHTAG_NAME -n 100 -d -t all

Output:
ZIP path: /{CURRENT_PATH}/hashtag_1552945659138.zip
JSON path: /{CURRENT_PATH}/hashtag_1552945659138.json
CSV path: /{CURRENT_PATH}/hashtag_1552945659138.csv
```

**Example 3:**
Scrape 50 posts from trends section, download them to a ZIP and save info to a csv file
```
$ tiktok-scraper trend -n 50 -d -t csv


Output:
ZIP path: /{CURRENT_PATH}/trend_1552945659138.zip
CSV path: /{CURRENT_PATH}/tend_1552945659138.csv
```

**Example 4:**
Scrape 100 posts from a particular music ID (numberical ID from TikTok URL)

```
$ tiktok-scraper music MUSICID -n 100

Output:
ZIP path: /{CURRENT_PATH}/music_1552945659138.zip
CSV path: /{CURRENT_PATH}/music_1552945659138.csv
```

**Example 5:**
Scrape 50 posts from trends section **with user profile information**
```
$ tiktok-scraper trend -n 50 -u


Output:
ZIP path: /{CURRENT_PATH}/trend_1552945659138.zip
CSV path: /{CURRENT_PATH}/tend_1552945659138.csv
```

**To make it look better, when downloading posts the progress will be shown in terminal**
```
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
```
const TikTokScraper = require('tiktok-scraper');


// User feed by username
(async () => {
    try{
        let posts = await TikTokScraper.user({USERNAME},  { number: 100 });
        console.log(posts)
    } catch(error){
        console.log(error)
    }
})()

// User feed by user id
// Some TikTok user id's are larger then MAX_SAFE_INTEGER, you need to pass user id as a string
(async () => {
    try{
        let posts = await TikTokScraper.user({USER_ID}, { number: 100, by_user_id: true });
        console.log(posts)
    } catch(error){
        console.log(error)
    }
})()

// Trend
(async () => {
    try{
        let posts = await TikTokScraper.trend("", { number: 100});
        console.log(posts)
    } catch(error){
        console.log(error)
    }
})()

// Trends with the user profile information: Followers, Following, Hearts, Digg, Videos and Verified or not
(async () => {
    try{
        let posts = await TikTokScraper.trend("", { number: 100, user_data: true });
        console.log(posts)
    } catch(error){
        console.log(error)
    }
})()

// Hashtag
(async () => {
    try{
        let posts = await TikTokScraper.hashtag({HASHTAG}, { number: 100 });
        console.log(posts)
    } catch(error){
        console.log(error)
    }
})()
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
```
const TikTokScraper = require('tiktok-scraper');
let options = {
    count: 100,
    event: true, // Enable event emitter, you won't be able to use promises
};

let posts = TikTokScraper.user({USERNAME}, options);

posts.on('data', (json) => {
  //data in JSON format
})

posts.on('done', () => {
  //completed
})
posts.on('error', (error) => {
  //error message
})
```

**Functions**
```
.user(id, options) //Scrape posts from a specific user
.hashtag(id, options) //Scrape posts from hashtag section
.trend('', options) // Scrape posts from a trends section
```

**Options**
```
let options = {
    // Number of posts to scrape: {int default: 20}
    number: 50,
    
    // Set proxy, example: 127.0.0.1:8080: {string default: ''}
    proxy: '',

    // Enable or Disable event emitter. If true then you can accept data through events: {boolean default: false}
    event: false,

    // Timeout between requests. If 'rate limit' error received then this option can be useful: {int default: 0}
    timeout: 0,
    
    // Set to {true} to search by user id: {boolean default: false}
    by_user_id: false,
    
    // Download posts or not. If true ZIP archive in {filepath} will be created: {boolean default: false}
    download: false,

    // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
    asyncDownload: 5,

    // File path where all files will be saved: {string default: 'CURRENT_DIR'}
    filepath: `CURRENT_DIR`,
    
    // Scrape user profile information: {boolean default: false}
    // Is very usefull when scraping posts from a thrends
    // If you will make to many requests you can receive Rate Limit
    user_data: false,

    // Output with information can be saved to a CSV or JSON files: {string default: 'na'}
    // 'csv' to save in csv
    // 'json' to save in json
    // 'all' to save in json and csv
    // 'na' to skip this step
    filetype: `na`,
};
```

***
<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

----
License
----

**MIT**

**Free Software**
