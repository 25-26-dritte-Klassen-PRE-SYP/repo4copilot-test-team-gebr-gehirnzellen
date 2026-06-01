import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GameService } from "./gameService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp({ gameService = new GameService() } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"]
        }
      }
    })
  );
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use((req, res, next) => {
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
        const requestHost = req.get("host");
        let sameOrigin = false;
        try {
          sameOrigin = Boolean(origin && requestHost && new URL(origin).host === requestHost);
        } catch {
          sameOrigin = false;
        }
        if (!origin || sameOrigin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("CORS origin not allowed"));
      }
    })(req, res, next);
  });
  app.use(express.json({ limit: "32kb" }));
  app.use(express.static(path.join(__dirname, "..", "public")));

  const requireAdmin = (req, res, next) => {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      res.status(403).json({ error: "Admin-Aktionen sind ohne ADMIN_TOKEN deaktiviert." });
      return;
    }
    if (req.get("x-admin-token") !== adminToken) {
      res.status(401).json({ error: "Ungueltiger Admin-Token." });
      return;
    }
    next();
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/game/create", (req, res) => {
    res.status(201).json(gameService.createGame(req.body));
  });

  app.post("/api/game/:id/start", (req, res) => {
    res.json(gameService.startGame(req.params.id));
  });

  app.post("/api/game/:id/join", (req, res) => {
    res.status(201).json(gameService.joinGame(req.params.id, req.body));
  });

  app.get("/api/game/:id/state", (req, res) => {
    res.json(gameService.getGame(req.params.id));
  });

  app.post("/api/game/:id/end", (req, res) => {
    res.json(gameService.endGame(req.params.id));
  });

  app.delete("/api/game/:id", (req, res) => {
    res.status(501).json({ error: "Loeschen laufender Spiele ist im MVP noch nicht implementiert." });
  });

  app.post("/api/game/:id/shuffle", (req, res) => {
    res.json(gameService.shuffleGame(req.params.id));
  });

  app.post("/api/game/:id/deal", (req, res) => {
    res.json(gameService.dealCards(req.params.id, req.body?.cardsPerPlayer));
  });

  app.get("/api/game/:id/deck", (req, res) => {
    res.json(gameService.getDeck(req.params.id));
  });

  app.get("/api/game/:id/hand/:playerId", (req, res) => {
    res.json(gameService.getHand(req.params.id, req.params.playerId));
  });

  app.post("/api/game/:id/play", (req, res) => {
    res.json(gameService.playCard(req.params.id, req.body));
  });

  app.post("/api/game/:id/pass", (req, res) => {
    res.json(gameService.passTurn(req.params.id, req.body));
  });

  app.get("/api/game/:id/turns", (req, res) => {
    res.json(gameService.getTurns(req.params.id));
  });

  app.get("/api/game/:id/scores", (req, res) => {
    res.json(gameService.getScores(req.params.id));
  });

  app.get("/api/rules", (req, res) => {
    res.json(gameService.getRules());
  });

  app.get("/api/rules/:variant", (req, res) => {
    res.json(gameService.getRules(req.params.variant));
  });

  app.post("/api/rules/update", requireAdmin, (req, res) => {
    res.json(gameService.updateRules(req.body?.rules));
  });

  app.get("/api/variants", (req, res) => {
    res.json(gameService.getVariants());
  });

  app.post("/api/game/:id/save", (req, res) => {
    res.status(201).json(gameService.saveGame(req.params.id, req.body));
  });

  app.get("/api/game/:id/load", (req, res) => {
    res.json(gameService.loadGame(req.params.id));
  });

  app.get("/api/saved-games", (req, res) => {
    res.json(gameService.listSavedGames());
  });

  app.delete("/api/saved-games/:id", requireAdmin, (req, res) => {
    res.json(gameService.deleteSavedGame(req.params.id));
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    if (error.message === "CORS origin not allowed") {
      res.status(403).json({ error: "CORS origin not allowed" });
      return;
    }
    res.status(error.statusCode ?? 500).json({
      error: error.message ?? "Interner Serverfehler"
    });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => {
    console.log(`Kartenspielsystem laeuft auf http://localhost:${port}`);
  });
}
