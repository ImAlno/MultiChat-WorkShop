# MultiChat Workshop Backend

A minimal, modular FastAPI backend that integrates with Discord OAuth and stores server and conversation history in PostgreSQL.

---

## Getting Started

Follow these steps to spin up the database container and start the local server.

### 1. Start the Database and Web GUI
Ensure **Docker Desktop** is open and running on your system, then launch the database and the web explorer containers:
```bash
docker-compose up -d
```
*This starts: *
* **PostgreSQL** on port `5433`
* **pgweb** (Database Web Explorer) on port `8081`

### 2. Configure Environment Variables
Make sure you have a `.env` file in the root of the `Backend/` directory with your Discord app credentials:
```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
DISCORD_BOT_TOKEN=your_bot_token
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

### 3. Install Dependencies
Activate your virtual environment and install the required Python packages:
```powershell
# Activate venv (Windows PowerShell)
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 4. Run the Server
Launch the FastAPI development server:
```bash
python -m app.server
```
*(On startup, the server will connect to PostgreSQL and automatically create the required database tables).*

---

## Interactive URLs

Once the services are active, you can access these portals in your browser:

* **API Interactive Docs**: [http://localhost:3000/docs](http://localhost:3000/docs) (Playground for testing routes)
* **pgweb GUI (Drizzle Studio Alternative)**: [http://localhost:8081](http://localhost:8081) (Visual explorer for your PostgreSQL tables)
