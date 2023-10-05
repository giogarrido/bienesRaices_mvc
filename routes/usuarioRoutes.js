import express from "express";

const router = express.Router();

// Routing
router.get("/", (req, res) => res.send("Hello World!"));
router.get("/about", (req, res) => res.send("About Us!"));

// Export the router

export default router;