import { PostCollector } from '.';

export interface DownloaderConstructor {
    progress: boolean;
    proxy: string[] | string;
    test: boolean;
    noWaterMark: boolean;
    userAgent: string;
    filepath: string;
    bulk: boolean;
}

export interface ZipValues {
    collector: PostCollector[];
    filepath: string;
    fileName: string;
    asyncDownload: number;
}
