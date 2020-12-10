[Go back to the Main Documentation](https://github.com/drawrowfly/tiktok-scraper/blob/master/README.md)

## Manage Download History

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
