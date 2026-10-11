import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { BibleServices } from '../../services/bible-services';
import { LanguageServices } from '../../services/language-services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowTopRightOnSquare,
  heroClipboard,
  heroClipboardDocument,
  heroClipboardDocumentList,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { coolDoubleQuotesR, coolSingleQuotesR } from '@ng-icons/coolicons';
import { IndexedVerse } from '../../interfaces/bible-interface';
import { RouterLink } from '@angular/router';
import { SidebarSettingsServices } from '../../services/sidebar_settings-services';

@Component({
  selector: 'search-result-component',
  imports: [NgIcon, RouterLink],
  providers: [
    provideIcons({
      copy: heroClipboard,
      goto: heroArrowTopRightOnSquare,
      copyAll: heroClipboardDocument,
      copySelected: heroClipboardDocumentList,
      close: heroXMark,
      quoteAll: coolDoubleQuotesR,
      quote: coolSingleQuotesR,
    }),
  ],
  template: `
    <div
      class="w-full h-full sticky bg-black/15 top-0 left-0 z-50 flex justify-center 
  items-center dark:text-white"
    >
      <div class="w-5/6 h-5/6 bg-white rounded border shadow flex flex-col">
        <div class="dark-bg light-bg w-full border-b rounded-t flex">
          <div class="w-full px-2">
            @for (word of bible_services.string_to_search(); track $index) {
              "{{ word }}"
            }
          </div>

          <button
            type="button"
            (click)="close_search_results()"
            class="w-6 flex rounded-r-sm items-center justify-center cursor-pointer
        hover:bg-red-500 hover:text-white"
          >
            <ng-icon name="close" class="text-xl " />
          </button>
        </div>

        <!-- Options -->
        <div class="bg-gray-50 dark:bg-gray-900 border-b">
          <div class="px-2 flex items-center">
            <div class="flex space-x-2 py-1">
              <button
                type="button"
                #copy_selected
                class="border-2 flex p-0.5 rounded cursor-pointer"
                (click)="copy_selected_verses()"
              >
                <ng-icon name="copySelected" class="text-xl" />
              </button>

              <button
                type="button"
                #quote_selected
                class="border-2 flex p-0.5 rounded cursor-pointer"
                (click)="copy_selected_quotes()"
              >
                <ng-icon name="quote" class="text-xl" />
              </button>

              <button
                type="button"
                (click)="copy_verse(-1)"
                class="border-2 flex p-0.5 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-500 
                dark:border-gray-400 dark:hover:bg-gray-300 dark:hover:text-blue-600"
              >
                <ng-icon name="copyAll" class="text-xl" />
              </button>

              <button
                type="button"
                (click)="copy_quote(-1)"
                class="border-2 flex p-0.5 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-500 
                dark:border-gray-400 dark:hover:bg-gray-300 dark:hover:text-blue-600"
              >
                <ng-icon name="quoteAll" class="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <!-- Verses -->
        <div class="w-full h-full px-2 dark:bg-gray-800 overflow-auto select-none">
          @for (verse of bible_services.verses_searched(); track $index) {
            <div class="border-b-2 mb-1 flex flex-col py-0.5">
              <div class="flex flex-row">
                <input type="checkbox" class="cursor-pointer" (click)="select($index)" #check_box />

                <p class="font-bold w-full pl-2">
                  <span>{{ verse.verse_string }} </span>
                </p>

                <div class="flex items-center space-x-1">
                  <button
                    type="button"
                    (click)="copy_verse($index)"
                    class="border-2 flex p-0.5 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-500 
                dark:border-gray-400 dark:hover:bg-gray-300 dark:hover:text-blue-600"
                  >
                    <ng-icon name="copy" class="text-xl" />
                  </button>

                  <button
                    type="button"
                    (click)="copy_quote($index)"
                    class="border-2 flex p-0.5 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-500 
                dark:border-gray-400 dark:hover:bg-gray-300 dark:hover:text-blue-600"
                  >
                    <ng-icon name="quote" class="text-xl" />
                  </button>

                  <a
                    [routerLink]="['/']"
                    (click)="move_to(verse)"
                    class="border-2 flex p-0.5 rounded hover:bg-blue-50 hover:text-blue-500 
                dark:border-gray-400 dark:hover:bg-gray-300 dark:hover:text-blue-600 cursor-pointer"
                  >
                    <ng-icon name="goto" class="text-xl" />
                  </a>
                </div>
              </div>

              <p
                [innerHTML]="
                  getTextoResaltado(
                    bible_services
                      .bible()
                      ?.books?.at(verse.book_number - 1)
                      ?.chapters?.at(verse.chapter_number - 1)
                      ?.verses?.at(verse.verse_number - 1)?.text
                  )
                "
              ></p>
            </div>
          }
        </div>

        <div class="w-full flex flex-row-reverse light-bg dark-bg border-t rounded-b py-0.5">
          <button
            class="bg-blue-500 text-white px-2 rounded dark:bg-blue-800"
            (click)="close_search_results()"
          >
            {{ lang.data()?.close }}
          </button>
        </div>
      </div>
    </div>

    <style>
      :host {
        @apply w-full h-full z-50 sticky top-0 left-0 flex;
      }
      .disabled {
        @apply text-gray-300 cursor-default dark:border-gray-800 dark:text-gray-500;
      }

      .enabled {
        @apply border-2 flex p-0.5 rounded hover:bg-blue-50 hover:text-blue-500 cursor-pointer
      dark:border-gray-400 dark:hover:bg-gray-300 dark:hover:text-blue-600;
      }
    </style>
  `,
})
export class SearchResultComponent implements AfterViewInit {
  @ViewChild('copy_selected') copy_selected!: ElementRef<HTMLButtonElement>;
  @ViewChild('quote_selected') quote_selected!: ElementRef<HTMLButtonElement>;
  @ViewChildren('check_box') check_boxes!: QueryList<ElementRef<HTMLInputElement>>;

  bible_services = inject(BibleServices);
  lang = inject(LanguageServices);
  sidebar_settings_services = inject(SidebarSettingsServices);
  sanitizer = inject(DomSanitizer);

  verses_index_selected: number[] = [];

  ngAfterViewInit(): void {
    this.copy_selected.nativeElement.classList.add('disabled');
    this.quote_selected.nativeElement.classList.add('disabled');
  }

  select(checkbox_index: number) {
    const index = this.verses_index_selected.findIndex((v) => v == checkbox_index);

    if (index == -1) this.verses_index_selected.push(checkbox_index);
    else this.verses_index_selected.splice(index, 1);

    if (this.verses_index_selected.length == 0) {
      this.copy_selected.nativeElement.classList.add('disabled');
      this.copy_selected.nativeElement.classList.remove('enabled');
      this.quote_selected.nativeElement.classList.add('disabled');
      this.quote_selected.nativeElement.classList.remove('enabled');
    } else {
      this.copy_selected.nativeElement.classList.remove('disabled');
      this.copy_selected.nativeElement.classList.add('enabled');
      this.quote_selected.nativeElement.classList.remove('disabled');
      this.quote_selected.nativeElement.classList.add('enabled');
    }
  }

  async copy_selected_verses() {
    if (this.verses_index_selected.length == 0) return;

    let text_to_clipboard = '';

    for (const v of this.verses_index_selected) {
      text_to_clipboard += this.get_quoted_verse(v);
    }

    await navigator.clipboard.writeText(text_to_clipboard);
  }

  async copy_verse(verse: number) {
    if (verse != -1) {
      await navigator.clipboard.writeText(this.get_quoted_verse(verse));
      return;
    }

    let text_to_clipboard = '';

    for (let n = 0; n < this.bible_services.verses_searched().length; n++) {
      text_to_clipboard += this.get_quoted_verse(n);
    }

    await navigator.clipboard.writeText(text_to_clipboard);
  }

  get_quoted_verse(n: number): string {
    const searched_verse = this.bible_services.verses_searched()[n];
    let quote = '';

    quote += `(${searched_verse.verse_string})\n`;
    quote +=
      this.bible_services
        .bible()
        ?.books?.at(searched_verse.book_number - 1)
        ?.chapters?.at(searched_verse.chapter_number - 1)
        ?.verses?.at(searched_verse.verse_number - 1)?.text + '\n\n';

    return quote;
  }

  async copy_selected_quotes() {
    if (this.verses_index_selected.length == 0) return;

    let text_to_clipboard = '(';

    for (const v of this.verses_index_selected) {
      text_to_clipboard += this.get_quote(v) + '; ';
    }

    await navigator.clipboard.writeText(text_to_clipboard.slice(0, -2) + ')');
  }

  async copy_quote(verse: number) {
    let text_to_clipboard = '(';

    if (verse != -1) {
      await navigator.clipboard.writeText('(' + this.get_quote(verse) + ')');
      return;
    }

    for (let n = 0; n < this.bible_services.verses_searched().length; n++) {
      text_to_clipboard += this.get_quote(n) + '; ';
    }

    await navigator.clipboard.writeText(text_to_clipboard.slice(0, -2) + ')');
  }

  get_quote(n: number) {
    return this.bible_services.verses_searched()[n].verse_string;
  }

  getTextoResaltado(texto: string | undefined): SafeHtml {
    if (!texto) return '';

    const to_reg = this.bible_services
      .string_to_search()
      .map((w) => escapeRegExp(w))
      .join('|');

    const reg_exp = new RegExp(`\\b(${to_reg})\\b`, 'gi');

    const html = escapeHtml(texto).replace(
      reg_exp,
      '<span class="text-blue-500 border-b border-b-blue-500 dark:text-blue-300 dark:border-b-blue-300">$1</span>',
    );

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  close_search_results() {
    this.bible_services.open_search_result.set(false);
  }

  move_to(verse: IndexedVerse) {
    setTimeout(() => {
      this.close_search_results();
      this.bible_services.is_jumped_from_note_page.set(false);
      this.bible_services.move_to_verse(
        verse.book_number,
        verse.chapter_number,
        verse.verse_number,
      );
      this.sidebar_settings_services.anchor_handler(0);
    }, 0);
  }
}

/** Escapa caracteres especiales de una cadena para insertarla como HTML seguro. */
function escapeHtml(texto: string): string {
  return texto.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

/** Escapa metacaracteres de RegExp para usarlos como literal en un patrón. */
function escapeRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
