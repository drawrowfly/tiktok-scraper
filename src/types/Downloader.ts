import { PostCollector } from '.';

export interface DownloaderConstructor {
    progress: boolean;
    proxy: string;
    test: boolean;
    noWaterMark: boolean;
    userAgent: string;
    filepath: string;
}

export interface ZipValues {
    collector: PostCollector[];
    filepath: string;
    fileName: string;
    asyncDownload: number;
}
