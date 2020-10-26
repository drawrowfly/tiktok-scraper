import { PostCollector } from '.';

export interface DownloaderConstructor {
    progress: boolean;
    proxy: string[] | string;
    noWaterMark: boolean;
    userAgent: string;
    filepath: string;
    bulk: boolean;
    tt_webid_v2: string;
}

export interface DownloadParams {
    zip: boolean;
    folder: string;
    collector: PostCollector[];
    fileName: string;
    asyncDownload: number;
}
