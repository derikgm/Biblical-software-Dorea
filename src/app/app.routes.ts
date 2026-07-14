import { Routes } from "@angular/router";
import { MainPage } from "./pages/main-page/main-page";
import { NotesPage } from "./pages/notes-page/notes-page";

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
        path:"**",
        redirectTo: ""
    }
];
