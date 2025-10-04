export type DoorDialog = {
  id: string
  es: string
  en: string
}

export const doorDialogs: DoorDialog[] = [
  {
    id: 'follow-1',
    es: '¡Holaaa! ¿Hay alguien ahí dentro?',
    en: 'Hellooo! Is anyone in there?',
  },
  {
    id: 'follow-2',
    es: 'Me estoy congelando aquí afuera, ¡por favor!',
    en: 'I am freezing out here, pretty please!',
  },
  {
    id: 'follow-3',
    es: 'Si golpeo tres veces es la señal secreta, ¿cierto?',
    en: 'If I knock three times that is the secret signal, right?',
  },
]
