import { PostCollector, Headers } from '.';
export interface DownloaderConstructor {
    progress: boolean;
    proxy: string[] | string;
    noWaterMark: boolean;
    headers: Headers;
    filepath: string;
    bulk: boolean;
}
export interface DownloadParams {
    zip: boolean;
    folder: string;
    collector: PostCollector[];
    fileName: string;
    asyncDownload: number;
}
