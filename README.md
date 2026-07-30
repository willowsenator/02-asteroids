# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal: lo que sale por un borde reaparece por el opuesto). Destruye asteroides para sumar puntos: los grandes se parten en dos medianos y los medianos en dos pequeños. Al limpiar la pantalla avanzas de nivel y aparecen más asteroides.

Al destruir un asteroide puede aparecer un power-up que deriva por el espacio. Los dos tipos se van alternando, así que nunca salen dos iguales seguidos. Se distinguen por color: el **cian** otorga disparo triple (tres balas en abanico durante 5 segundos) y el **verde** levanta un escudo temporal de 6 segundos que pulveriza los asteroides que toque en lugar de destruir la nave. Los dos son independientes: puedes llevar ambos activos a la vez.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D (lienzo fijo de 800 × 600)
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción                        |
| --------- | ----------------------------- |
| `←` `→`   | Rotar nave                    |
| `↑`       | Propulsar                     |
| `Espacio` | Disparar                      |
| `Espacio` | Reiniciar (en pantalla final) |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides y al perder una vida
- Niveles progresivos: cada nivel añade más asteroides
- Power-up de disparo triple: aparece al destruir asteroides, dura 5 s y se pierde al morir
- Power-up de escudo temporal: dura 6 s, destruye (y puntúa) los asteroides que toque y también se pierde al morir
- HUD con puntaje, nivel, vidas restantes y tiempo restante de cada power-up activo
