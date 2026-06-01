import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/server.js";

async function withServer(callback) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const body = await response.json();
  return { response, body };
}

test("API supports the documented happy path", async () => {
  await withServer(async (baseUrl) => {
    const health = await request(`${baseUrl}/api/health`);
    assert.equal(health.response.status, 200);
    assert.equal(health.body.status, "ok");

    const created = await request(`${baseUrl}/api/game/create`, {
      method: "POST",
      body: { hostName: "Host" }
    });
    assert.equal(created.response.status, 201);

    const joined = await request(`${baseUrl}/api/game/${created.body.id}/join`, {
      method: "POST",
      body: { username: "Spieler 2" }
    });
    assert.equal(joined.response.status, 201);
    assert.equal(joined.body.game.players.length, 2);

    const started = await request(`${baseUrl}/api/game/${created.body.id}/start`, {
      method: "POST"
    });
    assert.equal(started.response.status, 200);
    assert.equal(started.body.status, "RUNNING");

    const hand = await request(`${baseUrl}/api/game/${created.body.id}/hand/${started.body.current_turn_player}`);
    assert.equal(hand.response.status, 200);
    assert.equal(hand.body.hand.length, 5);

    const played = await request(`${baseUrl}/api/game/${created.body.id}/play`, {
      method: "POST",
      body: {
        playerId: started.body.current_turn_player,
        cardId: hand.body.hand[0].id
      }
    });
    assert.equal(played.response.status, 200);
    assert.equal(played.body.discard_count, 1);
  });
});

test("admin endpoints are disabled without an admin token", async () => {
  await withServer(async (baseUrl) => {
    const updateRules = await request(`${baseUrl}/api/rules/update`, {
      method: "POST",
      body: { rules: [] }
    });

    assert.equal(updateRules.response.status, 403);
    assert.match(updateRules.body.error, /ADMIN_TOKEN/);
  });
});

test("security headers are present", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
  });
});

test("same-origin API posts are allowed while foreign origins are blocked", async () => {
  await withServer(async (baseUrl) => {
    const sameOrigin = await fetch(`${baseUrl}/api/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl
      },
      body: JSON.stringify({ hostName: "Host" })
    });
    assert.equal(sameOrigin.status, 201);

    const foreignOrigin = await fetch(`${baseUrl}/api/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil.example"
      },
      body: JSON.stringify({ hostName: "Host" })
    });
    assert.equal(foreignOrigin.status, 403);
  });
});
