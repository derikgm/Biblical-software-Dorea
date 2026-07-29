import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { GlobalSettingsServices } from '../../services/global_settings-services.ts';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'settings-page',
  imports: [],
  templateUrl: "settings-page.html",
})
export class SettingsPage implements AfterViewInit{

  bibles_traslations_api = "https://api.getbible.net/v2/translations.json";
  available_biblies = signal<string []>(['']);
  bibles_per_language = signal<Map<string, ShortBible[]>>(new Map());

  http = inject(HttpClient);
  gss = inject(GlobalSettingsServices);

  async ngAfterViewInit() {
    await invoke("get_local_bibles", {})
    .then((v) => {
      this.available_biblies.set(v as string[])
    })
    .catch((e) => {
      console.log(e);
    })

    await invoke("get_available_list_of_bibles")
    .then((v) => {
      let bibles: ShortBible[] = v as unknown as ShortBible[];

      this.available_biblies.update((av_bibles) => {
        const new_list: string[] = [];

        av_bibles.forEach((bible_abr) => {
          const bible = bibles.find(b => b.abbreviation == bible_abr)
          if(bible) new_list.push(`${bible_abr} (${bible.lang})`)
        })

        return new_list;
      })

      const bibles_map = get_bibles_per_language(bibles);
      this.bibles_per_language.set(bibles_map);
      
    })
    .catch((e) => {
      console.log(e);
    })


  }

  async get_avaliable_bibles(){
    this.gss.is_loading.set(true);
    this.http.get(this.bibles_traslations_api)
    .subscribe({
      next: (data) => {

        const translations: ShortBible[] = Object.values(data) as ShortBible[];

        const bibles_map = get_bibles_per_language(translations);
        this.bibles_per_language.set(bibles_map);

        invoke ("save_available_list_of_bibles", {bibles: translations})        

      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log("todo en orden");
      }
    })

    this.gss.is_loading.set(false);
  }
}

function get_bibles_per_language(translations: ShortBible[]){

  const bibles_per_langauge: Map<string, ShortBible[]> = new Map();

  translations.forEach((t) => {
    const short_bible: ShortBible = {
      abbreviation: t.abbreviation,
      translation: t.translation,
      url: t.url,
      lang: t.lang,
      language: t.language,
    }
    if (bibles_per_langauge.has(t.language)) {
      bibles_per_langauge.get(t.language)?.push(short_bible);
    } else {
      bibles_per_langauge.set(t.language, [short_bible]);
    }
  })

  const without_language = bibles_per_langauge.get("")!;
  bibles_per_langauge.delete("");
  bibles_per_langauge.set("Not specified", without_language)

  const tidy_map = new Map (
    Array.from(bibles_per_langauge.entries())
    .sort((a, b) => {return a[0].localeCompare(b[0])})
  ); 
  
  return tidy_map;
}

export interface ShortBible {
  abbreviation: string;
  translation: string;
  url: string;
  lang: string,
  language: string,
}

export interface TranslationHttp {
  translation: string;
  abbreviation: string;
  description: string;
  lang: string;
  language: string;
  url: string;
}