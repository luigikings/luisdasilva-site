/** Bilingual lines the visitor "knocks" with before being let into the interview */
export type DoorDialog = {
  id: string
  es: string
  en: string
}

export const doorDialogs: DoorDialog[] = [
  {
    id: 'follow-1',
    es: '¡Hola! ¿Hay alguien ahí?',
    en: 'Hello! Is anyone there?',
  },
  {
    id: 'follow-2',
    es: 'Hace frío aquí fuera, ¿me dejas entrar?',
    en: "It's cold out here, may I come in?",
  },
  {
    id: 'follow-3',
    es: 'Llamo tres veces: esa es la señal, ¿verdad?',
    en: "I'll knock three times: that's the signal, right?",
  },
]