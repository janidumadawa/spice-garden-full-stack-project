// backend/src/server.ts
import app from "./app"


// health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "spice-garden-backend"
  });
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})
