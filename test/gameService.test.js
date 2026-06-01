import assert from "node:assert/strict";
import test from "node:test";
import { GameService } from "../src/gameService.js";

test("creates, joins and starts a game", () => {
  const service = new GameService({ now: () => "2026-06-01T10:00:00.000Z" });

  const created = service.createGame({ hostName: "Host" });
  const joined = service.joinGame(created.id, { username: "Player 2" });
  const started = service.startGame(created.id);

  assert.equal(joined.game.players.length, 2);
  assert.equal(started.status, "RUNNING");
  assert.equal(started.players[0].hand_count, 5);
  assert.equal(started.players[1].hand_count, 5);
  assert.equal(started.deck_remaining, 42);
});

test("rejects invalid moves from non-current players", () => {
  const service = new GameService();
  const created = service.createGame({ hostName: "Host" });
  service.joinGame(created.id, { username: "Player 2" });
  const started = service.startGame(created.id);
  const otherPlayer = started.players.find((player) => player.id !== started.current_turn_player);
  const hand = service.getHand(created.id, otherPlayer.id);

  assert.throws(
    () => service.playCard(created.id, { playerId: otherPlayer.id, cardId: hand.hand[0].id }),
    /Nur der aktuelle Spieler darf spielen/
  );
});

test("plays a card, updates score and advances turn", () => {
  const service = new GameService();
  const created = service.createGame({ hostName: "Host" });
  service.joinGame(created.id, { username: "Player 2" });
  const started = service.startGame(created.id);
  const currentPlayerId = started.current_turn_player;
  const hand = service.getHand(created.id, currentPlayerId);
  const card = hand.hand[0];

  const nextState = service.playCard(created.id, { playerId: currentPlayerId, cardId: card.id });
  const player = nextState.players.find((entry) => entry.id === currentPlayerId);

  assert.equal(player.hand_count, 4);
  assert.ok(player.score > 0);
  assert.notEqual(nextState.current_turn_player, currentPlayerId);
});

test("saves and loads a game", () => {
  const service = new GameService();
  const created = service.createGame({ hostName: "Host" });
  service.joinGame(created.id, { username: "Player 2" });
  service.startGame(created.id);

  const save = service.saveGame(created.id, { description: "Test save" });
  const savedGames = service.listSavedGames();
  const loaded = service.loadGame(created.id);

  assert.equal(save.description, "Test save");
  assert.equal(savedGames.length, 1);
  assert.equal(loaded.id, created.id);
});
