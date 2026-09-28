# 🚀 Guide de Déploiement : WINTER ARC

Ce guide détaille la mise en production de **WINTER ARC** avec l'architecture recommandée :
* **Frontend (React + Vite + Tailwind)** sur **Vercel**
* **Backend API REST (Node.js + Express)** sur **Render** (ou **Railway**)

---

## 📦 Étape 1 : Pousser le Code sur GitHub

Le projet a déjà été initialisé et commité sur la branche `main`. Pour le connecter à votre compte GitHub :

1. Créez un nouveau dépôt vide sur votre compte GitHub (par exemple nommé `winter-arc`).
2. Dans votre terminal, liez le dépôt distant et poussez le code :

```bash
cd /home/hilarie/Arc-winter
git remote add origin https://github.com/<VOTRE_PSEUDO_GITHUB>/winter-arc.git
git push -u origin main
```

---

## ⚙️ Étape 2 : Déployer le Backend sur Render (ou Railway)

### Option A : Sur Render (Recommandé & Gratuit)

1. Rendez-vous sur [dashboard.render.com](https://dashboard.render.com) et connectez-vous avec GitHub.
2. Cliquez sur **New +** > **Web Service**.
3. Sélectionnez votre dépôt GitHub `winter-arc`.
4. Renseignez les paramètres suivants :
   * **Name** : `winter-arc-backend`
   * **Region** : Choisissez la plus proche (ex: Frankfurt, Oregon)
   * **Root Directory** : `backend`
   * **Runtime** : `Node`
   * **Build Command** : `npm install && npm run build`
   * **Start Command** : `npm run start`
   * **Instance Type** : `Free`
5. Cliquez sur **Advanced** et ajoutez les variables d'environnement (**Environment Variables**) :
   * `NODE_ENV` = `production`
   * `JWT_SECRET` = `votre_cle_secrete_ultra_securisee_2026`
   * `PORT` = `10000` *(géré automatiquement par Render)*
6. Cliquez sur **Create Web Service**.
7. Une fois déployé, copiez l'URL fournie par Render (ex : `https://winter-arc-backend.onrender.com`).
   * Vérifiez son bon fonctionnement en ouvrant : `https://winter-arc-backend.onrender.com/api/health`

---

## ⚡ Étape 3 : Déployer le Frontend sur Vercel

1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **Add New...** > **Project**.
3. Importez votre dépôt `winter-arc`.
4. Dans la fenêtre de configuration du projet :
   * **Framework Preset** : `Vite`
   * **Root Directory** : Cliquez sur **Edit** et sélectionnez le dossier `frontend`
   * **Build Command** : `npm run build` *(déjà détecté)*
   * **Output Directory** : `dist` *(déjà détecté)*
5. Dépliez la section **Environment Variables** et ajoutez :
   * **Name** : `VITE_API_URL`
   * **Value** : L'URL de votre backend Render copiée à l'étape 2 (ex : `https://winter-arc-backend.onrender.com`)
6. Cliquez sur **Deploy**.
7. En moins d'une minute, votre application WINTER ARC est en ligne avec HTTPS, CDN mondial ultra-rapide et nom de domaine personnalisé gratuit (`.vercel.app`) !

---

## 🔄 Option Alternative : Déploiement Automatique par Blueprint Render

Le fichier `render.yaml` situé à la racine du dépôt permet de déployer Frontend ET Backend en 1 seul clic via **Render Blueprints** :
1. Sur Render, cliquez sur **New +** > **Blueprint**.
2. Connectez le dépôt `winter-arc`.
3. Render lira automatiquement `render.yaml` et configurera les deux services avec liaison automatique.

---

## 🧪 Checklist de Validation en Production

* [ ] Le statut de santé du backend répond : `GET /api/health` -> `{"status":"ok"}`
* [ ] Le frontend charge instantanément avec le thème violet sombre et l'audio Web Audio API.
* [ ] L'onboarding s'affiche pour un nouvel utilisateur et permet de créer son premier Arc.
* [ ] La validation d'une habitude octroie de l'XP et synchronise l'état avec la base de données.
* [ ] Le check-in du soir et le coach ARC AI répondent parfaitement.
* [ ] L'application est installable en PWA sur smartphone via "Ajouter à l'écran d'accueil".
