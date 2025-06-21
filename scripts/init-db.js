import { initializeDatabase } from "../lib/db.js"

async function main() {
  try {
    console.log("Initializing database...")
    await initializeDatabase()
    console.log("Database initialized successfully!")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    process.exit(1)
  }
}

main()
