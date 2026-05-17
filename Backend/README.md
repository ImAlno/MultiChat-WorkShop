# MultiChat Workshop Backend

A minimal, modular FastAPI backend that integrates with Discord OAuth and stores server and conversation history in PostgreSQL.

---

## Getting Started

You can run this backend in two different ways depending on your workflow:

---

### Option 1: Full Docker Ecosystem (One Command 🚀)
This is the simplest way to run everything. It builds your backend code as a container and starts the Database, pgweb GUI, and Backend API in a unified Docker network.

1. **Configure Environment Variables**: Make sure your `.env` file in the root of the `Backend/` directory contains your Discord app credentials.
2. **Launch all services**:
   ```bash
   docker-compose up -d --build
   ```
   *This builds your local codebase and boots up:*
   * **FastAPI Backend** on port `3000`
   * **pgweb GUI** on port `8081`
   * **PostgreSQL** internally (fully mapped and accessible)

---

### Option 2: Hybrid Local Development (Highly Recommended for Debugging 🛠️)
Use this option if you want to run the database in Docker, but run the Python server locally in your terminal or IDE for quick code edits and live-reloads.

1. **Configure Environment Variables**: Ensure your `.env` contains your Discord app credentials.
2. **Launch the Database & GUI**:
   ```bash
   docker-compose up -d db pgweb
   ```
3. **Activate Environment and Install Dependencies**:
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. **Run the Server locally**:
   ```bash
   python -m app.server
   ```


---

## Interactive URLs

Once the services are active, you can access these portals in your browser:

* **API Interactive Docs**: [http://localhost:3000/docs](http://localhost:3000/docs) (Playground for testing routes)
* **pgweb GUI (Drizzle Studio Alternative)**: [http://localhost:8081](http://localhost:8081) (Visual explorer for your PostgreSQL tables)
