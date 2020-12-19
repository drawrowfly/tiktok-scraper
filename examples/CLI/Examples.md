[Go back to the Main Documentation](https://github.com/drawrowfly/tiktok-scraper/blob/master/README.md)

## Terminal Examples

#### NOTE: in order to download user/music/trending/hashtag feed you need to set sessiok cookie value. Read more about it in the main Readme file: How to get/set session value

**Example 1:**
Scrape 300 video posts from the user {USERNAME}. Save post metadata to the CSV(-t csv) file

```sh
tiktok-scraper user USERNAME -n 300 -t csv --session sid_tt=asdasd13123123123adasda

Output:
CSV path: /bla/blah/USERNAME_1552945544582.csv
```

**Example 2:**
Scrape 100 posts from the hashtag {HASHTAG_NAME}, download(-d) and save them to the ZIP(-z) archive, save post metadata to the JSON and CSV files (-t all)

```sh
tiktok-scraper hashtag HASHTAG_NAME -n 100 -d -z -t all  --session sid_tt=asdasd13123123123adasda

Output:
ZIP path: /bla/blah/HASHTAG_NAME_1552945659138.zip
JSON path: /bla/blah/HASHTAG_NAME_1552945659138.json
CSV path: /bla/blah/HASHTAG_NAME_1552945659138.csv
```

**Example 3:**
Scrape 50 posts from the trends section, download(-d) them to a ZIP(-z) and save metadata to the CSV(-t csv) file

```sh
tiktok-scraper trend -n 50 -d -z -t csv --session sid_tt=asdasd13123123123adasda


Output:
ZIP path: /bla/blah/trend_1552945659138.zip
CSV path: /bla/blah/tend_1552945659138.csv
```

**Example 4:**
Scrape 100 posts from a particular music ID (numeric ID from TikTok URL), download(-d) and save posts to the ZIP(-z) and metadata to the CSV(-t csv) files

```sh
tiktok-scraper music MUSICID -n 100 -d -z -t csv --session sid_tt=asdasd13123123123adasda

Output:
ZIP path: /bla/blah/music_1552945659138.zip
CSV path: /bla/blah/music_1552945659138.csv
```

**Example 5:**
Download(-d) 20 latest video post from the user {USERNAME} and save the progress to avoid downloading the same videos in the future(-s)

-   **NOTE** Progress can only be saved if **download** flag is on
-   When executing same command next time scraper will only download newly posted videos

```sh
tiktok-scraper user USERNAME -n 20 -d -s --session sid_tt=asdasd13123123123adasda


Output:
Folder Path: /User/Bob/Downloads/USERNAME
```

**Example 6:**
Download(-d) 20 latest video post without the watermark(-w) from the trending feed

```sh
tiktok-scraper trend -n 20 -d -w --session sid_tt=asdasd13123123123adasda


Output:
Folder Path: /User/Bob/Downloads/trending
```

**Example 7:**
Save only single video metadata in to the csv file(-t json), without the watermark in HD(--hd) quality

```sh
tiktok-scraper video https://www.tiktok.com/@tiktok/video/6807491984882765062 --hd -t json

Output:
Video file location: /Users/USER/Downloads/6807491984882765062.mp4
```

**Example 8:**
Download(-d) single video without the watermark

```sh
tiktok-scraper video https://www.tiktok.com/@tiktok/video/6807491984882765062 -d

Output:
Video file location: /Users/USER/Downloads/6807491984882765062.mp4
```

**Example 9:**
Download(-d) single video without the watermark in HD(--hd) quality

```sh
tiktok-scraper video https://www.tiktok.com/@tiktok/video/6807491984882765062 --hd

Output:
Video file location: /Users/USER/Downloads/6807491984882765062.mp4
```

**Example 10:**
View previous download history

```sh
tiktok-scraper history
```

**Example 11:**
Download(-d) 100 latest video post from the user {USERNAME}, save posts to the folder(without zip) and do not download metadata

```sh
tiktok-scraper user USERNAME -n 100 -d --session sid_tt=asdasd13123123123adasda


Output:
Folder Path: /Blah/Blah/USERNAME
```

**Example 12:**
Download(-d) 50 latest video post from the user {USERNAME}, save posts to the custom folder(without zip) path and save post metadata to the CSV file

```sh
tiktok-scraper user USERNAME -n 50 -d --filepath /User/Bob/Downloads -t csv --session sid_tt=asdasd13123123123adasda


Output:
Folder Path: /User/Bob/Downloads/USERNAME
CSV path: /User/Bob/Downloads/USERNAME_1587898252464.csv
```

**Example 13:**
Download(-d) 20 latest video post without the watermark(-w) in HD(--hd) quality from the user {USERNAME}

```sh
tiktok-scraper user USERNAME -n 20 -d -w --hd --session sid_tt=asdasd13123123123adasda


Output:
Folder Path: /User/Bob/Downloads/USERNAME
```
