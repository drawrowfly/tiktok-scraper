/// <reference types="node" />
import { MultipleBar } from '../helpers';
import { DownloaderConstructor, PostCollector, DownloadParams } from '../types';
export declare class Downloader {
    progress: boolean;
    mbars: MultipleBar;
    progressBar: any[];
    private proxy;
    noWaterMark: boolean;
    userAgent: string;
    filepath: string;
    bulk: boolean;
    tt_webid_v2: string;
    constructor({ progress, proxy, noWaterMark, userAgent, filepath, bulk, tt_webid_v2 }: DownloaderConstructor);
    private get getProxy();
    addBar(type: boolean, len: number): any[];
    toBuffer(item: PostCollector): Promise<Buffer>;
    downloadPosts({ zip, folder, collector, fileName, asyncDownload }: DownloadParams): Promise<unknown>;
    downloadSingleVideo(post: PostCollector): Promise<void>;
}
