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
    constructor({ progress, proxy, noWaterMark, userAgent, filepath, bulk }: DownloaderConstructor);
    private get getProxy();
    addBar(len: number): any[];
    toBuffer(item: PostCollector): Promise<Buffer>;
    downloadPosts({ zip, folder, collector, fileName, asyncDownload }: DownloadParams): Promise<unknown>;
    downloadSingleVideo(post: PostCollector): Promise<void>;
}
