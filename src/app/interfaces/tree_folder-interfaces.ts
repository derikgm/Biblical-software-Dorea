export interface Folder {
    folder_name: string;
    open?:boolean;
    folders?: Folder[],
    files?: string[],
}