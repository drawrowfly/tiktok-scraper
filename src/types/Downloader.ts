import { PostCollector } from '.';

export interface DownloaderConstructor {
    progress: boolean;
    proxy: string;
    test: boolean;
}

export interface ZipValues {
    collector: PostCollector[];
    filepath: string;
    fileName: string;
    asyncDownload: number;
}
