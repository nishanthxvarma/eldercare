# Deployment Guide

ElderCare Connect can be deployed securely using self-hosted Docker containers, or via modern PaaS providers like Vercel and Render.

---

## 1. Environment Variable Templates

### Frontend (`apps/web/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```
*Note: In production, change `localhost` to your backend's public URL.*

### Backend (`apps/api/.env.example`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eldercare?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

---

## 2. GitHub Preparation (Manual Steps)

To package your local codebase into GitHub, execute the following commands in your terminal:

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "feat: Final V1 Implementation"

# 4. Use GitHub CLI to create the remote repository and push
gh repo create eldercare --public --source=. --remote=origin --push
```

---

## 3. Deployment via Cloud Providers (PaaS)

### MongoDB Atlas (Database)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (or restrict to Render's static IPs if applicable).
3. Under **Database Access**, create a user and copy the connection string.
4. Replace `<username>` and `<password>` in the connection string and save it for the backend environment variables.

### Render (Backend)
1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository (`eldercare`).
3. Set the configuration:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Expand **Advanced** and add all environment variables from `apps/api/.env.example`.
5. Deploy the service and copy the generated public URL (e.g., `https://eldercare-api.onrender.com`).

### Vercel (Frontend)
1. Go to [Vercel](https://vercel.com) and **Add New Project**.
2. Import your GitHub repository (`eldercare`).
3. Set the configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the environment variables:
   - `VITE_API_URL`: `<YOUR_RENDER_URL>/api/v1`
   - `VITE_SOCKET_URL`: `<YOUR_RENDER_URL>`
5. Deploy the application.

---

## 4. Self-Hosted Deployment (Docker)

If you prefer to host the application on your own VPS (DigitalOcean, AWS EC2, etc.), you can use Docker.

1. Ensure Docker and Docker Compose are installed on your server.
2. Clone the repository to your server.
3. Create the `.env` files in `apps/api` and `apps/web`.
4. Run the following command from the root of the project:

```bash
docker-compose up -d --build
```

The application will be exposed on port `80` (Frontend) and `5000` (Backend API). You can then use Nginx or Caddy to proxy these ports to a domain with SSL.
