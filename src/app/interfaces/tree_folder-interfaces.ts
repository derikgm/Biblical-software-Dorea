export interface Folder {
    folder_name: string;
    dir: string;
    open?:boolean;
    folders: Folder[],
    files: Note[],
}

export interface Note {
    title: string,
    extension: string
}

export enum NoteFSOptions {
    CreateNewNote,
    CreateNewFolder,
}