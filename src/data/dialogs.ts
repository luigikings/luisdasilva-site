export type DoorDialog = {
  id: string
  es: string
  en: string
}

export const doorDialogs: DoorDialog[] = [
  {
    id: 'patience-1',
    es: 'Hola... prometo no pisar la alfombra si me dejas pasar.',
    en: 'Hello... I promise not to step on the rug if you let me in.',
  },
  {
    id: 'patience-2',
    es: 'Traje galletas digitales. Solo pesan 4kb cada una.',
    en: 'I brought digital cookies. They only weigh 4kb each.',
  },
  {
    id: 'patience-3',
    es: 'Mis píxeles se están congelando aquí fuera...',
    en: 'My pixels are freezing out here...',
  },
  {
    id: 'patience-4',
    es: 'Tengo un chiste buenísimo pero solo si abres la puerta.',
    en: 'I’ve got a killer joke but it requires an open door.',
  },
]
