# Constitución — luisdasilva-site

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Stack mínimo**: mantener React+Vite+Express+Resend sin nuevas deps ni BBDD salvo aprobación.
2. **Spec manda**: nada fuera de spec se implementa; todo cambio va primero a spec/plan/tareas.
3. **Lógica separada**: lógica pura fuera del DOM/red/fecha (inyectadas como parámetro), UI solo pinta.
4. **Verificación manual+build**: cada spec cierra con flujo ES/EN→puerta→entrevista→sugerencia OK y `build` front+back en verde.
5. **Datos mínimos**: solo email vía backend validado con Zod; nunca subir `.env`/claves ni guardar PII.
6. **Bilingüe profesional**: código EN, UI ES/EN completa y acceso directo a CV/proyectos/contacto sin fricción arcade extra.
