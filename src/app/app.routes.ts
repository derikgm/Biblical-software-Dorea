import { Routes } from "@angular/router";
import { MainPage } from "./pages/main-page/main-page";
import { NotesPage } from "./pages/notes-page/notes-page";
import { SettingsPage } from "./pages/settings-page/settings-page";

export const routes: Routes = [
    {
        path:'',
        component: MainPage
    },
    {
        path:'notes',
        component: NotesPage
    },
    {
        path:'settings',
        component: SettingsPage,
    },
    {
        path:"**",
        redirectTo: ""
    }
];
