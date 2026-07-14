# SAYRAY: TURNO DE NOCHE

**Convenience Store · Horror Survival · 3D Browser Game**

---

## 📖 Descripción

Sayray: Turno de Noche es un juego de terror en primera persona ambientado en una tienda de conveniencia durante el turno de madrugada (12:00 AM - 6:00 AM). El jugador debe mantener la tienda operativa mientras fenómenos anómalos comienzan a ocurrir: maniquíes que flotan, luces que se vuelven rojas, objetos que se mueven solos.

Inspirado en experiencias como *The Convenience Store* y *Anomaly Detective*.

---

## 🎮 Mecánicas del Juego

### Objetivo
Sobrevive hasta las 6:00 AM manteniendo la tienda en orden y reportando anomalías.

### Controles
| Tecla | Acción |
|-------|--------|
| W/A/S/D | Moverse |
| Mouse | Mirar alrededor |
| E | Interactuar (abrir puertas, encender luces, reportar anomalías, etc.) |

### Tareas del Turno
- **💡 Encender las luces** — Interactúa con el interruptor en la pared izquierda
- **📞 Contestar el teléfono** — El jefe llama 2 segundos después de encender las luces
- **🧹 Limpiar el baño** — El baño necesita limpieza periódica
- **💳 Operar la caja registradora** — Encender y abrir/cerrar la caja

### Anomalías
| Anomalía | Descripción | Cómo reportar |
|----------|-------------|---------------|
| Maniquí Flotante | Un maniquí levita en el centro de la tienda | Acércate y presiona E |
| Luces Rojas | El techo se ilumina de rojo | Interactúa con el interruptor de luces |
| Bolso Movido | Un bolso aparece en una posición extraña | Acércate y presiona E |
| Caja Extra | Una caja misteriosa aparece en el piso | Acércate y presiona E |

Las anomalías aparecen cada 10 minutos in-game (20 segundos reales) después de los primeros 20 minutos. Si no se reportan a tiempo, desaparecen después de 30 minutos in-game y cuentan como "perdidas".

### Puntaje
- +100 por cada anomalía reportada
- +50 por cada tarea completada (luces, teléfono, baño, caja)

---

## 🛠️ Tecnologías

### Frontend (Juego)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2.5 | UI framework |
| Vite | 8.0.10 | Build tool / dev server |
| Three.js | 0.169.0 | Motor 3D |
| @react-three/fiber | 9.6.0 | React renderer para Three.js |
| @react-three/drei | 10.7.7 | Utilidades Three.js |
| @react-three/rapier | 2.2.0 | Motor de física |
| @react-three/postprocessing | 3.0.4 | Efectos post-procesamiento |

### Efectos Visuales
- **SMAA** — Anti-aliasing subpixel morfológico
- **SSAO** — Oclusión ambiental de espacio de pantalla
- **Bloom** — Resplandor en luces brillantes
- **Chromatic Aberration** — Aberración cromática para atmósfera
- **ToneMapping (ACES)** — Mapeo de tonos cinematográfico
- **Vignette** — Oscurecimiento de bordes
- **Noise** — Granulado analógico
- **Environment Map** — Reflejos de entorno nocturno
- **Soft Shadows (PCF)** — Sombras suaves con mapas de 2048×2048

### Backend (Opcional - 2 versiones)

| Opción | Tecnología | Base de Datos |
|--------|-----------|---------------|
| A | Django 6.0 + DRF | MySQL |
| B | Express 5 + Sequelize | PostgreSQL |

> Actualmente el juego funciona completamente en el cliente sin necesidad de backend.

---

## 📁 Estructura del Proyecto

```
Anomaly-store/
├── frontend/                     # Juego (React + Vite)
│   ├── public/                   # Archivos estáticos
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Router (Login, Game, Leaderboard)
│   │   ├── pages/
│   │   │   ├── Game.jsx          # Página principal del juego (estado, canvas, HUD, game over)
│   │   │   ├── Login.jsx         # Menú principal
│   │   │   └── Leaderboard.jsx   # Ranking
│   │   ├── components/Game/
│   │   │   ├── Store.jsx         # Escena 3D de la tienda (paredes, estantes, anomalías)
│   │   │   ├── Player.jsx        # Movimiento, interacción por raycast, sonidos
│   │   │   └── Exterior.jsx      # Exterior (bosque, faroles, autobús animado)
│   │   ├── utils/
│   │   │   └── audio.js          # Síntesis de sonidos con Web Audio API
│   │   ├── css/
│   │   │   ├── global/           # Estilos globales
│   │   │   └── pages/            # Estilos por página (Game.css, Login.css, Leaderboard.css)
│   │   ├── services/
│   │   │   └── api.js            # Cliente Axios (para futuro backend)
│   │   ├── context/              # (disponible para futuros contextos)
│   │   └── hooks/                # (disponible para futuros hooks)
│   ├── dist/                     # Build de producción
│   └── package.json
│
└── backend/                      # Backend (Django + Express)
    ├── config/                   # Configuración de Django y Sequelize
    ├── apps/                     # Django apps (users, games, anomalies, scores)
    ├── routes/                   # Express routes (auth, anomalies, games)
    ├── models/                   # Sequelize models (User, Game, Anomaly, Score)
    ├── migrations/               # Sequelize migrations
    ├── manage.py                 # Django manage.py
    └── requirements.txt          # Python dependencies
```

---

## 🚀 Cómo Ejecutar

### Requisitos
- Node.js 20+
- Navegador moderno (Chrome, Firefox, Edge)

### Desarrollo

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador: `http://localhost:5173`

### Producción

```bash
cd frontend
npm run build
npm run preview
```

---

## 🧩 Arquitectura

### Flujo de la Aplicación

```
/login  ──→  Menú Principal
  │              │
  ├── /game  ──→ Pantalla de Inicio → Juego 3D → Game Over
  │                                               │
  │                                     ┌── Reintentar
  │                                     └── Volver al Menú
  │
  └── /leaderboard  ──→ Ranking
```

### State Management
El estado del juego se maneja con **React Context** (`GameContext`) que expone:
- `doorOpen`, `lightsOn`, `registerOn/Closed`, `phoneRinging/Answered`, `bathroomClean`
- `time` (minutos desde 12:00 AM)
- `activeAnomalies` (IDs de anomalías activas)
- `reportAnomaly()` (función para reportar)
- `setInteractionMsg` (mensaje de interacción contextual)

### Ciclo del Juego
1. El jugador hace clic en "COMENZAR TURNO"
2. Cada 2 segundos reales = 1 minuto in-game
3. Cada 10 minutos in-game se evalúa si aparece una anomalía (basado en probabilidad)
4. Cada 30 minutos in-game las anomalías no reportadas se pierden
5. A las 6:00 AM (360 minutos) el turno termina y se muestran los resultados

### Renderizado 3D
- **Canvas** de Three.js con cámara en primera persona
- **Physics** con Rapier para colisiones y cuerpo cinemático del jugador
- **PointerLockControls** para captura del mouse
- **Raycaster** para detección de interacciones por proximidad
- **EffectComposer** con múltiples pases de post-procesamiento

---

## 🎨 Para Mockups en Figma

El juego está listo para tomar capturas de pantalla. Las principales vistas:

1. **Menú Principal** (`/`) — Fondo oscuro con logo, reglas y botones
2. **Pantalla de Inicio** — Click para empezar, controles
3. **Interior de la Tienda** — Vista 3D con iluminación nocturna, estantes, mostrador
4. **Exterior Nocturno** — Bosque, autobús, faroles, estacionamiento
5. **HUD** — Reloj, alertas de anomalías, barra de progreso, indicadores de tareas
6. **Anomalías** — Maniquí flotante (con glow), luces rojas, bolso movido, caja extra
7. **Game Over** — Pantalla de resultados con puntaje y estadísticas

### Consejos para Screenshots
- Usar ventana de 1920×1080 para capturas limpias
- Para capturar el interior sin HUD, presionar F12 y ocultar elementos del DOM
- Las anomalías tienen un 10-20% de probabilidad cada 20 segundos; esperar unos minutos

---

## 📝 Notas de Desarrollo

### Pendiente
- 🌐 Conexión con backend para persistencia de puntajes
- 🔐 Sistema de autenticación (Login/Register)
- 🏆 Leaderboard funcional con datos reales
- 🎮 Más tipos de anomalías y eventos
- 🔊 Efectos de sonido ambientales

---

## 👥 Créditos

Desarrollado como proyecto de juego de terror narrativo en primera persona con Three.js y React.
