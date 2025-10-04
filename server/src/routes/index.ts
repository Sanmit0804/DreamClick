import { Router } from "express";
import userRoutes from "./user.route.js";

const router = Router();

// API Routes v1
const apiRoutes = Router();

apiRoutes.use("/users", userRoutes);

// Versioned health check -- for web level
apiRoutes.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        version: "v1",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: "connected"
        }
    });
});

// Mount API routes with versioning
router.use("/v1", apiRoutes);

// Root health check -- for infrastructure
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

export default router;