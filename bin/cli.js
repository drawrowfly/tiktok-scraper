#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */

const yargs = require('yargs');
const { tmpdir } = require('os');
const TikTokScraper = require('../build');
const CONST = require('../build/constant');

const startScraper = async argv => {
    try {
        argv.type = argv._[0];
        argv.cli = true;
        argv.input = argv.id;
        argv.store_history = argv.store;
        argv.randomUa = true;
        if (argv.filename) {
            argv.fileName = argv.filename;
        }

        if (argv.session) {
            argv.sessionList = [argv.session];
        }

        if (argv.historypath) {
            argv.historyPath = argv.historypath;
        }
        if (argv.file) {
            argv.input = argv.file;
        }
        if (argv.type.indexOf('-') > -1) {
            argv.type = argv.type.replace('-', '');
        }

        argv.hdVideo = argv.hd;

        if (argv.async) {
            argv.asyncBulk = argv.async;
        }

        try {
            const scraper = await TikTokScraper[argv.type](argv.input, argv);

            if (scraper.zip) {
                console.log(argv.zip ? `ZIP path: ${scraper.zip}` : `Folder Path: ${scraper.zip}`);
            }
            if (scraper.json) {
                console.log(`JSON path: ${scraper.json}`);
            }
            if (scraper.csv) {
                console.log(`CSV path: ${scraper.csv}`);
            }
            if (scraper.message) {
                console.log(scraper.message);
            }
            if (scraper.webhook) {
                console.log('HTTP REQUEST: ');
                console.table(scraper.webhook);
            }
            if (scraper.table) {
                console.table(scraper.table);
            }
            if (argv.cli && argv.type === 'getUserProfileInfo') {
                console.log(scraper);
            }
        } catch (error) {
            console.error(error.message ? error.message : error);
        }
    } catch (error) {
        console.log(error);
    }
};

yargs
    .usage('Usage: $0 <command> [options]')
    .example(`$0 user USERNAME -d -n 100 --session sid_tt=dae32131231`)
    .example(`$0 trend -d -n 100 --session sid_tt=dae32131231`)
    .example(`$0 hashtag HASHTAG_NAME -d -n 100 --session sid_tt=dae32131231`)
    .example(`$0 music MUSIC_ID -d -n 50 --session sid_tt=dae32131231`)
    .example(`$0 video https://www.tiktok.com/@tiktok/video/6807491984882765062 -d`)
    .example(`$0 history`)
    .example(`$0 history -r user:bob`)
    .example(`$0 history -r all`)
    .example(`$0 from-file BATCH_FILE ASYNC_TASKS -d`)
    .command('user [id]', 'Scrape videos from the User Feed. Enter only the username', {}, argv => {
        startScraper(argv);
    })
    .command('hashtag [id]', 'Scrape videos from the Hashtag Feed. Enter hashtag without the #', {}, argv => {
        startScraper(argv);
    })
    .command('trend', 'Scrape posts from the Trend Feed', {}, argv => {
        startScraper(argv);
    })
    .command('music [id]', 'Scrape videos from the Music Feed. Enter only the music id', {}, argv => {
        startScraper(argv);
    })
    .command('video [id]', 'Extract metadata from a single video without the watermark. To download use -d flag', {}, argv => {
        startScraper(argv);
    })
    .command('history', 'View previous download history', {}, argv => {
        startScraper(argv);
    })
    .command('from-file [file] [async]', 'Scrape users, hashtags, music, videos mentioned in a file. One value per one line', {}, argv => {
        startScraper(argv);
    })
    .command('userprofile [id]', 'Show user metadata', {}, argv => {
        startScraper(argv);
    })
    .options({
        help: {
            alias: 'h',
            describe: 'help',
        },
        session: {
            default: '',
            describe: 'Set session cookie value. Sometimes session can be helpful when scraping data from any method',
        },
        'session-file': {
            default: '',
            describe: 'Set path to the file with list of active sessions. One session per line!',
        },
        timeout: {
            default: 0,
            describe: 'Set timeout between requests. Timeout is in Milliseconds: 1000 mls = 1 s',
        },
        number: {
            alias: 'n',
            default: 0,
            describe: 'Number of posts to scrape. If you will set 0 then all posts will be scraped',
        },
        since: {
            default: 0,
            describe: 'Scrape posts that are published after specified date (timestamp). The default value is 0 - scrape all posts',
        },
        proxy: {
            alias: 'p',
            default: '',
            describe: 'Set single proxy',
        },
        'proxy-file': {
            default: '',
            describe: 'Use proxies from a file. Scraper will use random proxies from the file per each request. 1 line 1 proxy.',
        },
        download: {
            alias: 'd',
            boolean: true,
            default: false,
            describe: 'Download video posts to the folder with the name input [id]',
        },
        useTestEndpoints: {
            boolean: true,
            default: false,
            describe: 'Use Tiktok test endpoints. When your requests are blocked by captcha you can try to use Tiktok test endpoints.',
        },
        asyncDownload: {
            alias: 'a',
            default: 5,
            describe: 'Number of concurrent downloads',
        },
        hd: {
            boolean: true,
            default: false,
            describe:
                'Download video in HD. Video size will be x5-x10 times larger and this will affect scraper execution speed. This option only works in combination with -w flag',
        },
        zip: {
            alias: 'z',
            boolean: true,
            default: false,
            describe: 'ZIP all downloaded video posts',
        },
        filepath: {
            default: process.env.SCRAPING_FROM_DOCKER ? '' : process.cwd(),
            describe: 'File path to save all output files.',
        },
        filetype: {
            alias: ['t'],
            default: '',
            choices: ['csv', 'json', 'all', ''],
            describe:
                "Type of the output file where post information will be saved. 'all' - save information about all posts to the` 'json' and 'csv' ",
        },
        filename: {
            alias: ['f'],
            default: '',
            describe: 'Set custom filename for the output files',
        },
        noWaterMark: {
            alias: ['w'],
            boolean: true,
            default: false,
            describe:
                'Download video without the watermark. NOTE: With the recent update you only need to use this option if you are scraping Hashtag Feed. User/Trend/Music feeds will have this url by default',
        },
        store: {
            alias: ['s'],
            boolean: true,
            default: false,
            describe:
                'Scraper will save the progress in the OS TMP or Custom folder and in the future usage will only download new videos avoiding duplicates',
        },
        historypath: {
            default: process.env.SCRAPING_FROM_DOCKER ? '' : tmpdir(),
            describe: 'Set custom path where history file/files will be stored',
        },
        remove: {
            alias: ['r'],
            default: '',
            describe: 'Delete the history record by entering "TYPE:INPUT" or "all" to clean all the history. For example: user:bob',
        },
        webHookUrl: {
            default: '',
            describe: 'Set webhook url to receive scraper result as HTTP requests. For example to your own API',
        },
        method: {
            default: 'POST',
            choices: ['GET', 'POST'],
            describe: 'Receive data to your webhook url as POST or GET request',
        },
    })
    .check(argv => {
        if (CONST.scrape.indexOf(argv._[0]) === -1) {
            throw new Error('Wrong command');
        }

        if (!argv.download) {
            if (argv.cli && !argv.zip && !argv.type) {
                throw new Error(`Pointless commands. Try again but with the correct set of commands`);
            }
        }

        if (argv.store) {
            if (!argv.download) {
                throw new Error('--store, -s flag is only working in combination with the download flag. Add -d to your command');
            }
        }

        if (argv._[0] === 'from-file') {
            const async = parseInt(argv.async, 10);
            if (!async) {
                throw new Error('You need to set number of task that should be executed at the same time');
            }
            if (!argv.t && !argv.d) {
                throw new Error('You need to specify file type(-t) where data will be saved AND/OR if posts should be downloaded (-d)');
            }
        }

        if (argv.hd && !argv.noWaterMark && argv._[0] !== 'video') {
            throw new Error(`--hd option won't work without -w option`);
        }

        if (process.env.SCRAPING_FROM_DOCKER && (argv.historypath || argv.filepath)) {
            throw new Error(`Can't set custom path when running from Docker`);
        }
        if (argv.remove) {
            if (argv.remove.indexOf(':') === -1) {
                argv.remove = `${argv.remove}:`;
            }
            const split = argv.remove.split(':');
            const type = split[0];
            const input = split[1];

            if (type !== 'all' && CONST.history.indexOf(type) === -1) {
                throw new Error(`--remove, -r list of allowed types: ${CONST.history}`);
            }
            if (!input && type !== 'trend' && type !== 'all') {
                throw new Error('--remove, -r to remove the specific history record you need to enter "TYPE:INPUT". For example: user:bob');
            }
        }

        if (argv._[0] === 'video') {
            if (!argv.download && !argv.filetype) {
                argv.filetype = 'csv';
            }
        }

        if (argv._[0] === 'userprofile') {
            argv._[0] = 'getUserProfileInfo';
        }

        return true;
    })
    .demandCommand()
    .help().argv;
