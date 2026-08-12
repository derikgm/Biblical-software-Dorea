import { IndexedVerse, Verse } from "./bible-interface";

export interface Folder {
    folder_name: string;
    dir: string;
    open?:boolean;
    folders: Folder[],
    files: Note[],
}

export interface Note {
    title: string,
    extension: string,
    dir: string,
    linked_verses: IndexedVerse[]
}

export enum NoteFSOptions {
    CreateNewNote,
    CreateNewFolder,
}