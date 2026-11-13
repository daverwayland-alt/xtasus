# Xtasis Drink Game 🍾🔥

**Xtasis** es una aplicación web multijugador en tiempo real diseñada para ser el juego de beber definitivo en cualquier fiesta. Cuenta con una interfaz intuitiva, estética de "Premium Lounge" (Dark Glassmorphism) y un motor de cartas dinámico que garantiza que ninguna verdad o reto se repita en la misma noche.

## ✨ Características Principales

- **Multijugador en Tiempo Real:** Crea una sala privada de 4 letras y deja que tus amigos se unan desde sus teléfonos al instante.
- **Motor Generativo de Cartas (Anti-Repetición):** Más de 450 verdades y retos divididos exactamente en 3 niveles de intensidad ("Pre-Copa", "Seducción", "Xtasis"). El servidor recuerda el historial exacto de la partida para asegurar que nunca se repita una carta.
- **Inyección Dinámica de Jugadores:** Las cartas detectan a los jugadores en la sala y los incluyen mágicamente en el contexto del reto (Ej: "Dale un beso a [Jugador 2]").
- **Estética Premium:** Animaciones 3D responsivas usando `framer-motion`, luces de neón reactivas y soporte total en dispositivos móviles.

---

## 🛠️ Tecnologías (Stack para Devs)

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism CSS en `globals.css`
- **Animaciones:** `framer-motion` y `canvas-confetti`
- **Estado Global:** En el entorno de desarrollo, utiliza un in-memory store alojado en `globalThis` (en `src/lib/store.js`) que funciona sobre las Next.js API Routes mediante **Long Polling** de 1.5s, permitiendo un flujo en tiempo real rápido y sin la sobrecarga inicial de montar WebSockets o Redis.

---

## 🚀 Guía de Desarrollo Local (Dev)

Para correr el proyecto en tu máquina local y probarlo junto a tus amigos en la misma red Wi-Fi:

1. **Clona o navega al repositorio:**
   \`\`\`bash
   cd xtasis-drink-app
   \`\`\`

2. **Instala las dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Inicia el servidor de desarrollo:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Juega:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador pc.
   Si quieres que tus amigos se unan desde su teléfono, deben estar conectados a tu red WiFi e ingresar a la IP local de tu computadora (Ej: `http://192.168.X.X:3000`).

---

## 🌍 Guía de Despliegue (Producción)

### Importante sobre el Estado en Memoria (In-Memory Store)
El proyecto actualmente usa la memoria RAM del servidor de Next.js (`globalThis`) para guardar las partidas. Debido a esto, **NO se recomienda desplegar en entornos Serverless puros como Vercel o Netlify** para una producción masiva, ya que cada "función" o recarga en frío limpiará la memoria y desconectará la sala. 

A continuación, las mejores plataformas (Node.js Servers) para desplegar e invitar a todo el mundo:

### Opción 1: Railway (Recomendado 🌟)
Railway despliega un contenedor de Node.js permanente que no reiniciará la memoria entre request.
1. Haz push de este proyecto a GitHub.
2. Crea una cuenta en [Railway.app](https://railway.app/).
3. Haz click en "New Project" -> "Deploy from GitHub repo".
4. Selecciona tu repositorio. Railway automáticamente detectará Next.js y configurará el entorno.
5. Una vez compilado, puedes generar un dominio público gratuito en los "Settings" de Railway.

### Opción 2: Render.com
Render también ofrece Web Services de Node que mantienen el ciclo de vida del servidor vivo.
1. Crea una cuenta en [Render.com](https://render.com/).
2. Crea un nuevo "Web Service" y conéctalo a tu GitHub.
3. El comando de build será: `npm run build`
4. El comando de inicio (Start Command) será: `npm run start`
5. Al darle a *Deploy*, te dará un link funcional constante para todos tus clientes.

### (Opcional) Migración a Base de Datos
Si alguna vez decides escalarlo en Vercel o para miles de usuarios simultáneos, se recomienda reemplazar los métodos dentro de `src/lib/store.js` con llamadas a una base de datos real (Redis como Upstash o MongoDB), esto mantendrá exactamente la misma lógica de "No Repetición" de las cartas en un cluster ultra escalable.

---
*Hecho para las mejores noches.* 🥂
