import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { GlobalSettingsServices } from '../../services/global_settings-services';
import { invoke } from '@tauri-apps/api/core';
import { BibleServices } from '../../services/bible-services';
import { Bible } from '../../interfaces/bible-interface';
import { MarkerServices } from '../../services/marker_services';

@Component({
  selector: 'settings-page',
  imports: [],
  templateUrl: "settings-page.html",
})
export class SettingsPage implements AfterViewInit{
  @ViewChild("select_bible_element") select_bible_element!: ElementRef<HTMLSelectElement>;

  bibles_traslations_api = "https://api.getbible.net/v2/translations.json";
  available_biblies = signal<AvailableBibleList []>([]);
  bibles_per_language = signal<Map<string, ShortBible[]>>(new Map());

  http = inject(HttpClient);
  gss = inject(GlobalSettingsServices);
  bible_services = inject(BibleServices);
  marker_services = inject(MarkerServices);

  async ngAfterViewInit() {
    await invoke("get_local_bibles", {})
    .then((v) => {
      let bibles_string = v as string[];
      const avalaible_list: AvailableBibleList [] = [];

      bibles_string.forEach((b) => {
        avalaible_list.push({abbreviation: b, lang: ""});
      })

      this.available_biblies.set(avalaible_list);
    })
    .catch((e) => {
      console.log(e);
    })

    await invoke("get_available_list_of_bibles")
    .then((v) => {
      let bibles: ShortBible[] = v as unknown as ShortBible[];

      this.available_biblies.update((av_bibles) => {
        const new_list: AvailableBibleList [] = [];

        av_bibles.forEach((bible_abr) => {
          const bible = bibles.find(b => b.abbreviation == bible_abr.abbreviation)

          if(bible) new_list.push({
            abbreviation: bible.abbreviation,
            lang: bible.lang
          })
        })

        return new_list;
      })

      const bibles_map = get_bibles_per_language(bibles);
      this.bibles_per_language.set(bibles_map);
    })
    .catch((e) => {
      console.log(e);
    })

    this.select_bible_element.nativeElement.value = this.gss.settings.current_bible;
  }

  async get_avaliable_bibles(){
    this.gss.is_loading.set(true);
    this.http.get(this.bibles_traslations_api)
    .subscribe({
      next: (data) => {
        const translations: ShortBible[] = Object.values(data) as ShortBible[];

        const bibles_map = get_bibles_per_language(translations);
        this.bibles_per_language.set(bibles_map);

        if(this.available_biblies.length != 0){
          this.available_biblies.update((av_bibles) => {
            const new_list: AvailableBibleList [] = [];

            av_bibles.forEach((bible_abr) => {
              const bible = translations.find(b => b.abbreviation == bible_abr.abbreviation)

              if(bible) new_list.push({
                abbreviation: bible.abbreviation,
                lang: bible.lang
              })
            })

            return new_list;
          })
        }

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

  is_downloaded_bible(bible_abb: string){
    return this.available_biblies().find(ab => ab.abbreviation == bible_abb);
  }

  async select_bible(select_target: EventTarget | null){
    const select = select_target as HTMLSelectElement;

    if(select.value == ""){
      this.select_bible_element.nativeElement.value = this.gss.settings.current_bible;
      return;
    }

    await this.bible_services.select_bible(select.value);
    await this.marker_services.init();
  }

  async download_bible(select_target: EventTarget | null){
    const el = select_target as HTMLSelectElement;
    const value_string = el.value.toString().split("|");
    
    const short_bible = this.bibles_per_language().get(value_string[0])
    ?.find(b => {
      return b.abbreviation == value_string[1];
    })

    if(!short_bible) return;
    
    this.gss.is_loading.set(true);
    
    this.http.get<Bible>(short_bible.url).subscribe({
      next: async (bible) => {
        
        await invoke("save_bible", {bible})
        .then(() => {console.log("Guardado");})
        .catch((e) => {console.log("error");})

        this.available_biblies.update((ab) => {
          ab.push({abbreviation: bible.abbreviation, lang: bible.lang})
          return ab;
        })

        this.gss.is_loading.set(false);
      },
      
      error: (e) => {
        console.log(e);
      },
    })
    
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

export interface AvailableBibleList {
  abbreviation: string;
  lang: string,
}