[Go back to the Main Documentation](https://github.com/drawrowfly/tiktok-scraper/blob/master/README.md)

## Batch Scrape And Download Example

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

**ASYNC_TASKS** - how many tasks(each line in the file is a task) should be started at the time. I have tested with 40 and it worked really well, if you have slow connection then do not set more then 5

Command below will download single videos without the watermark and will make attempt to download all the videos from the users, hashtags and music feeds specified in the example file above and will save user, hashtag, music metadata to the JSON and CSV files.

```sh
tiktok-scraper from-file FILE ASYNC_TASKS -d -f all
```

**Example 2 with the proxy**

It is always better to use proxies for any task especially when downloading in batches. You can set 1 proxy or you can point scraper to the file with the proxy list and scraper will use random proxy from that list per request.

**FILE** - name of the file

**ASYNC_TASKS** - how many tasks(each line in the file is a task) should be started at the time.

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
