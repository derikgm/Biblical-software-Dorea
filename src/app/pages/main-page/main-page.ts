import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, EventEmitter, HostListener, 
  inject, Output, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { FontSettingsServices } from '../../services/font_settings-services';
import { MarkerComponent } from '../../components/marker-component/marker-component';
import { BibleServices } from '../../services/bible-services';
import { Chapter } from '../../interfaces/bible-interface';
import { VisibleDirective } from "../../directives/visible-directive";

@Component({
  selector: 'main-page',
  imports: [MarkerComponent, VisibleDirective],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage implements AfterViewInit{
  @ViewChild('texto') texto!: ElementRef<HTMLParagraphElement>;
  @ViewChildren('versiculo') versiculos!: QueryList<ElementRef<HTMLParagraphElement>>;
  @ViewChildren('chap_header') chap_headers!: QueryList<ElementRef<HTMLParagraphElement>>;

  rangeSelected!: Range | undefined;

  fontSettingsServices = inject(FontSettingsServices);
  bible_services = inject(BibleServices);

  // headers = map_headers;
  isMakerOpen = signal<boolean>(false);
  first_init = signal<boolean>(true)
  xPosition = signal<number>(0);
  yPosition = signal<number>(0);

  ngAfterViewInit(): void {
    setInterval(() => {
      this.texto.nativeElement.textContent = logMemoryUsage();
    }, 3000); // Cada 5 segundos

    document.addEventListener('click', ()=>{
      this.isMakerOpen.set(!document.getSelection()?.isCollapsed);
    })

    this.chap_headers.changes.subscribe(()=>{
      this.chap_headers.get(this.bible_services.current_chapter() - 1)
      ?.nativeElement.scrollIntoView(true);
    }) 
  }

  // load_another_chapter(chapter_number: number | undefined){
  //   this.bible_services.chapters_showed.update((v) => {
  //     if(!chapter_number || chapter_number == this.bible_services.current_chapter()) return v;

  //     const cap = this.bible_services.current_book()?.chapters[
  //       chapter_number < this.bible_services.current_chapter() 
  //         ? chapter_number - 2
  //         : chapter_number + 1
  //     ];

  //     let add = true;

  //     v.forEach((chapter)=>{
  //       if(chapter?.chapter == cap?.chapter){
  //         add = false;
  //         return;
  //       }
  //     })

  //     if(add)
  //       (chapter_number > this.bible_services.current_chapter())
  //         ? v.push(cap)
  //         : v.unshift(cap)

  //     return v;
  //   })

  //   this.bible_services.current_chapter.set(chapter_number ?? 1);
  // }

  trackByFn(index: number, item: Chapter |undefined): any {
    if(item)
    return item.chapter;
  }

  showMarker(event: MouseEvent){
    if(document.getSelection() && !document.getSelection()?.isCollapsed){
        this.rangeSelected = document.getSelection()?.getRangeAt(0);
        this.xPosition.set(event.x)
        this.yPosition.set(event.y)
      }
  }

  @HostListener('wheel', ['$event'])
  changeFontSize(event: WheelEvent){
    if (event.ctrlKey) {
      event.preventDefault(); // Por si acaso...
      this.fontSettingsServices.changeSize(event.deltaY > 0 ? false : true);
    }
  }

  fixSelection(){
    if(this.rangeSelected){
      const startText = this.rangeSelected.startContainer.textContent;
      const endText = this.rangeSelected.endContainer.textContent;
      let startOffset = this.rangeSelected.startOffset;
      let endOffset = this.rangeSelected.endOffset - 1;

      while(startText?.at(startOffset) !== " ")
        startOffset -= 1;

      while(endText?.at(endOffset) !== " ")
        endOffset += 1;
      
      this.rangeSelected.setStart(this.rangeSelected.startContainer, startOffset + 1);
      this.rangeSelected.setEnd(this.rangeSelected.endContainer, endOffset);
    }
    
  }

  handlerSelected(color: number){
    
    if(this.versiculos.length == 0) return
    if(this.rangeSelected === undefined) return;

    if(this.rangeSelected.endContainer !== this.rangeSelected.startContainer){
      const start_vers =this.rangeSelected.startContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;
      const end_vers =this.rangeSelected.endContainer.parentElement?.parentElement?.firstChild?.textContent ?? 0;

      for (let i = +start_vers - 1 ; i < +end_vers; i++) {

        const node = this.versiculos.get(i)?.nativeElement.lastChild?.firstChild;

        if(node){
          const rangeAux = document.createRange();

          rangeAux.setStart(node, (i == +start_vers - 1) ? this.rangeSelected.startOffset : 0);
          rangeAux.setEnd(node, (i == +end_vers - 1) ? this.rangeSelected.endOffset : (node.textContent?.length ?? 0));

          const span = document.createElement('span');
          span.classList.add(...map_marks[color]);

          rangeAux.surroundContents(span);
        }
      }
    } else {
        const span = document.createElement('span');
        span.classList.add(...map_marks[color]);
        this.rangeSelected.surroundContents(span);
        document.getSelection()?.removeAllRanges();
    }
  }
}

// En cualquier componente o servicio de Angular
function logMemoryUsage(): string {
  // Verificar si la API está disponible
  if (performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    const totalMB = memory.totalJSHeapSize / (1024 * 1024);

    return `Total asignada: ${totalMB.toFixed(2)} MB en el heap: ${usedMB.toFixed(2)}`;
  } else {
    return 'La API performance.memory no está disponible en este navegador.';
  }
}

// const juan1: string[] = [
//   "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.",
//   "Este era en el principio con Dios.",
//   "Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho.",
//   "En él estaba la vida, y la vida era la luz de los hombres.",
//   "La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella.",
//   "Hubo un hombre enviado de Dios, el cual se llamaba Juan.",
//   "Este vino por testimonio, para que diese testimonio de la luz, a fin de que todos creyesen por él.",
//   "No era él la luz, sino para que diese testimonio de la luz.",
//   "Aquella luz verdadera, que alumbra a todo hombre, venía a este mundo.",
//   "En el mundo estaba, y el mundo por él fue hecho, pero el mundo no le conoció.",
//   "A lo suyo vino, y los suyos no le recibieron.",
//   "Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios;",
//   "los cuales no son engendrados de sangre, ni de voluntad de carne, ni de voluntad de varón, sino de Dios.",
//   "Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.",
//   "Juan dio testimonio de él, y clamó diciendo: Este es de quien yo decía: El que viene después de mí, es antes de mí; porque era primero que yo.",
//   "Porque de su plenitud tomamos todos, y gracia sobre gracia.",
//   "Pues la ley por medio de Moisés fue dada, pero la gracia y la verdad vinieron por medio de Jesucristo.",
//   "A Dios nadie le vio jamás; el unigénito Hijo, que está en el seno del Padre, él le ha dado a conocer.",
//   "Este es el testimonio de Juan, cuando los judíos enviaron de Jerusalén sacerdotes y levitas para que le preguntasen: ¿Tú, quién eres?",
//   "Confesó, y no negó, sino confesó: Yo no soy el Cristo.",
//   "Y le preguntaron: ¿Qué, pues? ¿Eres tú Elías? Dijo: No soy. ¿Eres tú el profeta? Respondió: No.",
//   "Le dijeron: ¿Quién eres, pues? para que demos respuesta a los que nos enviaron. ¿Qué dices de ti mismo?",
//   "Dijo: Yo soy la voz de uno que clama en el desierto: Enderezad el camino del Señor, como dijo el profeta Isaías.",
//   "Y los que habían sido enviados eran de los fariseos.",
//   "Y le preguntaron, y le dijeron: ¿Por qué, pues, bautizas, si tú no eres el Cristo, ni Elías, ni el profeta?",
//   "Juan les respondió diciendo: Yo bautizo con agua; mas en medio de vosotros está uno a quien vosotros no conocéis.",
//   "Este es el que viene después de mí, el que es antes de mí, del cual yo no soy digno de desatar la correa de su calzado.",
//   "Estas cosas sucedieron en Betábara, al otro lado del Jordán, donde Juan estaba bautizando.",
//   "El siguiente día vio Juan a Jesús que venía a él, y dijo: He aquí el Cordero de Dios, que quita el pecado del mundo.",
//   "Este es aquel de quien yo dije: Después de mí viene un varón, el cual es antes de mí; porque era primero que yo.",
//   "Y yo no le conocía; pero para que fuese manifestado a Israel, por esto vine yo bautizando con agua.",
//   "También dio testimonio Juan, diciendo: Vi al Espíritu que descendía del cielo como paloma, y permaneció sobre él.",
//   "Y yo no le conocía; pero el que me envió a bautizar con agua, aquel me dijo: Sobre quien veas descender el Espíritu y que permanece sobre él, ese es el que bautiza con el Espíritu Santo.",
//   "Y yo le vi, y he dado testimonio de que este es el Hijo de Dios.",
//   "El siguiente día otra vez estaba Juan, y dos de sus discípulos.",
//   "Y mirando a Jesús que andaba por allí, dijo: He aquí el Cordero de Dios.",
//   "Le oyeron hablar los dos discípulos, y siguieron a Jesús.",
//   "Y volviéndose Jesús, y viendo que le seguían, les dijo: ¿Qué buscáis? Ellos le dijeron: Rabí (que traducido es, Maestro), ¿dónde moras?",
//   "Les dijo: Venid y ved. Fueron, y vieron donde moraba, y se quedaron con él aquel día; porque era como la hora décima.",
//   "Andrés, hermano de Simón Pedro, era uno de los dos que habían oído a Juan y habían seguido a Jesús.",
//   "Este halló primero a su hermano Simón, y le dijo: Hemos hallado al Mesías (que traducido es, el Cristo).",
//   "Y le trajo a Jesús. Y mirándole Jesús, dijo: Tú eres Simón, hijo de Jonás; tú serás llamado Cefas (que traducido es, Pedro).",
//   "El siguiente día quiso Jesús ir a Galilea, y halló a Felipe, y le dijo: Sígueme.",
//   "Y Felipe era de Betsaida, la ciudad de Andrés y Pedro.",
//   "Felipe halló a Natanael, y le dijo: Hemos hallado a aquel de quien escribió Moisés en la ley, así como los profetas: a Jesús, el hijo de José, de Nazaret.",
//   "Natanael le dijo: ¿De Nazaret puede salir algo de bueno? Le dijo Felipe: Ven y ve.",
//   "Vio Jesús a Natanael que se le acercaba, y dijo de él: He aquí un verdadero israelita, en quien no hay engaño.",
//   "Le dijo Natanael: ¿De dónde me conoces? Respondió Jesús y le dijo: Antes que Felipe te llamara, cuando estabas debajo de la higuera, te vi.",
//   "Respondió Natanael y le dijo: Rabí, tú eres el Hijo de Dios; tú eres el Rey de Israel.",
//   "Respondió Jesús y le dijo: ¿Porque te dije: Te vi debajo de la higuera, crees? Cosas mayores que estas verás.",
//   "Y le dijo: De cierto, de cierto os digo: De aquí adelante veréis el cielo abierto, y a los ángeles de Dios que suben y descienden sobre el Hijo del Hombre."
// ];

// const map_headers: Map<number, string> = new Map([
//   [18, "Testimonio de Juan el Bautista"],
//   [28, "El Cordero de Dios"],
//   [34, "Los primeros discípulos"],
//   [42, "Jesús llama a Felipe y a Natanael"],
// ])

const map_marks = [
  ['text-white', 'bg-red-700'],
  ['text-white', 'bg-blue-700'],
  ['text-white', 'bg-green-700'],
  ['text-white', 'bg-violet-700'],
  ['text-black', 'bg-transparent'],
]