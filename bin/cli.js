#!/usr/bin/env node

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
        if (argv.filename) {
            argv.fileName = argv.filename;
        }

        if (argv.historypath) {
            argv.historyPath = argv.historypath;
        }

        const scraper = await TikTokScraper[argv.type](argv.input, argv);

        if (scraper.zip) {
            console.log(`ZIP path: ${scraper.zip}`);
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
        if (scraper.table) {
            console.table(scraper.table);
        }
    } catch (error) {
        console.log(error);
    }
};

yargs
    .usage('Usage: $0 <command> [options]')
    .example(`$0 user USERNAME -d -n 100`)
    .example(`$0 trend -d -n 100`)
    .example(`$0 hashtag HASHTAG_NAME -d -n 100`)
    .example(`$0 music MUSIC_ID -d -n 50`)
    .example(`$0 video https://www.tiktok.com/@tiktok/video/6807491984882765062`)
    .example(`$0 history`)
    .example(`$0 history -r user:bob`)
    .example(`$0 history -r all`)
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
    .command('video [id]', 'Download single video without the watermark', {}, argv => {
        startScraper(argv);
    })
    .command('history', 'View previous download history', {}, argv => {
        startScraper(argv);
    })
    .options({
        help: {
            alias: 'h',
            describe: 'help',
        },
        number: {
            alias: 'n',
            default: 20,
            describe: 'Number of posts to scrape. If you will set 0 then all posts will be scraped',
        },
        proxy: {
            alias: 'p',
            default: '',
            describe: 'Set proxy',
        },
        download: {
            alias: 'd',
            boolean: true,
            default: false,
            describe: 'Download and archive all scraped videos to a ZIP file',
        },
        filepath: {
            default: process.env.SCRAPING_FROM_DOCKER ? '' : process.cwd(),
            describe: 'Directory to save all output files.',
        },
        filetype: {
            alias: ['type', 't'],
            default: 'csv',
            choices: ['csv', 'json', 'all'],
            describe: "Type of output file where post information will be saved. 'all' - save information about all posts to a 'json' and 'csv' ",
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
            describe: 'Download video without the watermark. This option will affect the execution speed',
        },
        store: {
            alias: ['s'],
            boolean: true,
            default: false,
            describe: 'Scraper will save the progress in the OS TMP folder and in the future usage will only download new videos avoiding duplicates',
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
    })
    .check(argv => {
        if (CONST.scrape.indexOf(argv._[0]) === -1) {
            throw new Error('Wrong command');
        }

        if (argv.store) {
            if (!argv.download) {
                throw new Error('--store, -s flag is only working in combination with the download flag. Add -d to your command');
            }
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
            if (!/^https:\/\/(www|v[a-z]{1})+\.tiktok\.com\/(\w.+|@(\w.+)\/video\/(\d+))$/.test(argv.id)) {
                throw new Error('Enter a valid TikTok video URL. For example: https://www.tiktok.com/@tiktok/video/6807491984882765062');
            }
        }

        return true;
    })
    .demandCommand()
    .help().argv;
