# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Añadido

- Clon de **Asteroids** en canvas HTML5: bucle de juego con paso temporal escalado por `dt`, espacio toroidal de 800 × 600, nave con propulsión e inercia, asteroides de tres tamaños que se parten al ser destruidos, balas con tiempo de vida, partículas de explosión, niveles progresivos, 3 vidas con invencibilidad al reaparecer y HUD de puntaje/nivel/vidas.
- Power-up de **disparo triple**: aparece al destruir un asteroide, dura 5 s y hace que la nave dispare tres balas en abanico.
- Power-up de **escudo temporal**: dura 6 s y, mientras corre, pulveriza los asteroides que toca (los puntúa, revienta y divide) en lugar de destruir la nave. Es independiente del disparo triple, así que ambos pueden estar activos a la vez, y cada uno muestra su tiempo restante en el HUD. Los dos se pierden al morir y al cambiar de nivel.

### Cambiado

- Los power-ups **alternan de tipo** en cada aparición en lugar de sortearse al azar. El sorteo 50/50 era estadísticamente correcto pero producía rachas largas del mismo power-up, que en la práctica se percibían como un sesgo hacia uno de los dos.
- README reescrito para describir el juego realmente implementado.

[Unreleased]: https://github.com/willowsenator/02-asteroids/commits/main
