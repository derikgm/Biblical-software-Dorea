import {Mark, } from "./bible-interface";

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
    linked_marks: Mark[]
}

export enum NoteFSOptions {
    CreateNewNote,
    CreateNewFolder,
}