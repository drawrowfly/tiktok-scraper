/// <reference types="node" />
import { MultipleBar } from '../helpers';
import { DownloaderConstructor, PostCollector, DownloadParams, Headers } from '../types';
export declare class Downloader {
    progress: boolean;
    mbars: MultipleBar;
    progressBar: any[];
    private proxy;
    noWaterMark: boolean;
    filepath: string;
    bulk: boolean;
    headers: Headers;
    constructor({ progress, proxy, noWaterMark, headers, filepath, bulk }: DownloaderConstructor);
    private get getProxy();
    addBar(type: boolean, len: number): any[];
    toBuffer(item: PostCollector): Promise<Buffer>;
    downloadPosts({ zip, folder, collector, fileName, asyncDownload }: DownloadParams): Promise<unknown>;
    downloadSingleVideo(post: PostCollector): Promise<void>;
}
