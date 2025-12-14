// backend/src/app.ts
import "dotenv/config"
import express from "express"
import cors from "cors"

import userRoutes from "./routes/user.routes"
import categoryRoutes from "./routes/category.routes"
import menuItemRoutes from "./routes/menuItem.routes"
import itemOptionRoutes from "./routes/itemOption.routes"
import cartRoutes from "./routes/cart.routes"
import orderRoutes from "./routes/order.routes"
import adminRoutes from "./routes/admin.routes"
import addressRoutes from "./routes/address.routes"
// import other routes

const app = express()

// Cors configuration for production
const corsOptions = {
    origin:[
        "http://localhost:3000",//local development
        "https://spice-garden.vercel.app",//vercel url
        "https://spice-garden-full-stack-project-production.up.railway.app" // Railway URL
    ],
    credentials:true,
    optionsSuccessStatus:200,
}
app.use(cors(corsOptions))
app.use(express.json())

app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/menu-items", menuItemRoutes)
app.use("/api/item-options", itemOptionRoutes)
app.use("/api/carts", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/addresses", addressRoutes)

app.use("/api/admin", adminRoutes)
// ...other routes


// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.json({ 
    message: "Spice Garden API", 
    status: "running",
    docs: "/api/users, /api/menu-items, etc."
  });
});

export default app;