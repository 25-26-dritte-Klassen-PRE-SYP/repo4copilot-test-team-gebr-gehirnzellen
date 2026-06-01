import { randomUUID } from "node:crypto";

const suits = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const rankScores = new Map(ranks.map((rank, index) => [rank, index + 2]));

export const defaultRules = [
  {
    id: "standard-core",
    variant: "standard",
    category: "Spielablauf",
    version: 1,
    rule_text: "Spieler treten einer Lobby bei. Der Host startet ab zwei Spielern."
  },
  {
    id: "standard-turns",
    variant: "standard",
    category: "Zuege",
    version: 1,
    rule_text: "Nur der aktuelle Spieler darf eine Karte spielen oder passen."
  },
  {
    id: "standard-score",
    variant: "standard",
    category: "Punkte",
    version: 1,
    rule_text: "Gespielte Karten geben Punkte entsprechend ihres Kartenwerts."
  }
];

export class GameService {
  constructor({ now = () => new Date().toISOString() } = {}) {
    this.now = now;
    this.games = new Map();
    this.savedGames = new Map();
    this.rules = [...defaultRules];
  }

  createGame({ hostName = "Spielleiter", variant = "standard", minPlayers = 2, maxPlayers = 6 } = {}) {
    const gameId = randomUUID();
    const host = this.#createPlayer(gameId, hostName, "HOST");
    const game = {
      id: gameId,
      host_id: host.id,
      variant,
      status: "CREATED",
      created_at: this.now(),
      started_at: null,
      ended_at: null,
      min_players: minPlayers,
      max_players: maxPlayers,
      current_turn_player: null,
      winner_id: null,
      players: [host],
      deck: this.#createDeck(gameId),
      discardPile: [],
      round: 0,
      turnHistory: []
    };

    this.games.set(gameId, game);
    return this.#publicGame(game);
  }

  joinGame(gameId, { username }) {
    const game = this.#requireGame(gameId);
    this.#assert(game.status === "CREATED", 409, "Spieler koennen nur vor dem Start beitreten.");
    this.#assert(username && username.trim().length > 0, 400, "username ist erforderlich.");
    this.#assert(game.players.length < game.max_players, 403, "Die maximale Spielerzahl ist erreicht.");

    const player = this.#createPlayer(game.id, username.trim(), "PLAYER");
    game.players.push(player);
    return { player, game: this.#publicGame(game) };
  }

  startGame(gameId) {
    const game = this.#requireGame(gameId);
    this.#assert(game.status === "CREATED", 409, "Nur Spiele im Status CREATED koennen gestartet werden.");
    this.#assert(game.players.length >= game.min_players, 403, "Nicht genug Spieler zum Starten.");

    this.shuffleGame(gameId);
    this.dealCards(gameId);
    game.status = "RUNNING";
    game.started_at = this.now();
    game.current_turn_player = game.players[0].id;
    game.round = 1;
    return this.#publicGame(game);
  }

  shuffleGame(gameId) {
    const game = this.#requireGame(gameId);
    game.deck = this.#shuffle(game.deck);
    return { cardsRemaining: game.deck.length };
  }

  dealCards(gameId, cardsPerPlayer = 5) {
    const game = this.#requireGame(gameId);
    this.#assert(game.deck.length >= game.players.length * cardsPerPlayer, 409, "Nicht genug Karten im Deck.");

    for (const player of game.players) {
      player.hand = [];
      for (let i = 0; i < cardsPerPlayer; i += 1) {
        const card = game.deck.pop();
        card.owner_player_id = player.id;
        player.hand.push(card);
      }
    }

    return this.#publicGame(game);
  }

  playCard(gameId, { playerId, cardId }) {
    const game = this.#requireGame(gameId);
    this.#assert(game.status === "RUNNING", 409, "Das Spiel laeuft nicht.");
    this.#assert(game.current_turn_player === playerId, 400, "Nur der aktuelle Spieler darf spielen.");

    const player = this.#requirePlayer(game, playerId);
    const cardIndex = player.hand.findIndex((card) => card.id === cardId);
    this.#assert(cardIndex >= 0, 400, "Die Karte liegt nicht auf der Hand des Spielers.");

    const [card] = player.hand.splice(cardIndex, 1);
    card.owner_player_id = null;
    game.discardPile.push(card);
    player.score += rankScores.get(card.rank) ?? 0;
    game.turnHistory.push({
      type: "PLAY_CARD",
      playerId,
      card,
      timestamp: this.now()
    });

    if (game.players.every((entry) => entry.hand.length === 0)) {
      this.#finishGame(game);
    } else {
      this.#advanceTurn(game);
    }

    return this.#publicGame(game);
  }

  passTurn(gameId, { playerId }) {
    const game = this.#requireGame(gameId);
    this.#assert(game.status === "RUNNING", 409, "Das Spiel laeuft nicht.");
    this.#assert(game.current_turn_player === playerId, 400, "Nur der aktuelle Spieler darf passen.");

    game.turnHistory.push({
      type: "PASS",
      playerId,
      timestamp: this.now()
    });
    this.#advanceTurn(game);
    return this.#publicGame(game);
  }

  endGame(gameId) {
    const game = this.#requireGame(gameId);
    this.#finishGame(game);
    return this.#publicGame(game);
  }

  getGame(gameId) {
    return this.#publicGame(this.#requireGame(gameId));
  }

  getDeck(gameId) {
    const game = this.#requireGame(gameId);
    return { cardsRemaining: game.deck.length, discardPile: game.discardPile };
  }

  getHand(gameId, playerId) {
    const game = this.#requireGame(gameId);
    const player = this.#requirePlayer(game, playerId);
    return { playerId, hand: player.hand };
  }

  getScores(gameId) {
    const game = this.#requireGame(gameId);
    return {
      gameId,
      scores: game.players.map((player) => ({
        playerId: player.id,
        username: player.username,
        score: player.score
      }))
    };
  }

  getTurns(gameId) {
    const game = this.#requireGame(gameId);
    return { gameId, turns: game.turnHistory };
  }

  getRules(variant) {
    return variant ? this.rules.filter((rule) => rule.variant === variant) : this.rules;
  }

  updateRules(rules) {
    this.#assert(Array.isArray(rules), 400, "rules muss ein Array sein.");
    this.rules = rules.map((rule) => ({
      id: rule.id ?? randomUUID(),
      variant: rule.variant ?? "standard",
      category: rule.category ?? "Allgemein",
      version: Number(rule.version ?? 1),
      rule_text: String(rule.rule_text ?? "")
    }));
    return this.rules;
  }

  getVariants() {
    return [...new Set(this.rules.map((rule) => rule.variant))].map((variant) => ({ id: variant, name: variant }));
  }

  saveGame(gameId, { savedBy, description = "" } = {}) {
    const game = this.#requireGame(gameId);
    const save = {
      id: randomUUID(),
      game_id: gameId,
      snapshot: structuredClone(game),
      saved_by: savedBy ?? game.host_id,
      saved_at: this.now(),
      description
    };
    this.savedGames.set(save.id, save);
    return save;
  }

  loadGame(gameId) {
    const save = [...this.savedGames.values()].reverse().find((entry) => entry.game_id === gameId);
    this.#assert(Boolean(save), 404, "Kein gespeicherter Spielstand gefunden.");
    this.games.set(gameId, structuredClone(save.snapshot));
    return this.#publicGame(this.games.get(gameId));
  }

  listSavedGames() {
    return [...this.savedGames.values()].map(({ snapshot, ...save }) => ({
      ...save,
      status: snapshot.status,
      players: snapshot.players.length
    }));
  }

  deleteSavedGame(saveId) {
    this.#assert(this.savedGames.delete(saveId), 404, "Spielstand nicht gefunden.");
    return { deleted: true };
  }

  #createPlayer(gameId, username, role) {
    return {
      id: randomUUID(),
      game_id: gameId,
      user_id: randomUUID(),
      username,
      role,
      hand: [],
      score: 0,
      status: "ACTIVE",
      joined_at: this.now(),
      turn_order: 0
    };
  }

  #createDeck(gameId) {
    return suits.flatMap((suit) =>
      ranks.map((rank) => ({
        id: `${suit}-${rank}`,
        game_id: gameId,
        suit,
        rank,
        owner_player_id: null
      }))
    );
  }

  #shuffle(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
  }

  #advanceTurn(game) {
    const activePlayers = game.players.filter((player) => player.hand.length > 0);
    if (activePlayers.length === 0) {
      this.#finishGame(game);
      return;
    }

    const currentIndex = game.players.findIndex((player) => player.id === game.current_turn_player);
    for (let offset = 1; offset <= game.players.length; offset += 1) {
      const candidate = game.players[(currentIndex + offset) % game.players.length];
      if (candidate.hand.length > 0) {
        game.current_turn_player = candidate.id;
        return;
      }
    }
  }

  #finishGame(game) {
    game.status = "FINISHED";
    game.ended_at = this.now();
    game.current_turn_player = null;
    const [winner] = [...game.players].sort((a, b) => b.score - a.score);
    game.winner_id = winner?.id ?? null;
  }

  #requireGame(gameId) {
    const game = this.games.get(gameId);
    this.#assert(Boolean(game), 404, "Spiel nicht gefunden.");
    return game;
  }

  #requirePlayer(game, playerId) {
    const player = game.players.find((entry) => entry.id === playerId);
    this.#assert(Boolean(player), 404, "Spieler nicht gefunden.");
    return player;
  }

  #publicGame(game) {
    return {
      id: game.id,
      host_id: game.host_id,
      variant: game.variant,
      status: game.status,
      created_at: game.created_at,
      started_at: game.started_at,
      ended_at: game.ended_at,
      min_players: game.min_players,
      max_players: game.max_players,
      current_turn_player: game.current_turn_player,
      winner_id: game.winner_id,
      round: game.round,
      deck_remaining: game.deck.length,
      discard_count: game.discardPile.length,
      players: game.players.map((player, index) => ({
        id: player.id,
        username: player.username,
        role: player.role,
        score: player.score,
        status: player.status,
        hand_count: player.hand.length,
        joined_at: player.joined_at,
        turn_order: index
      }))
    };
  }

  #assert(condition, statusCode, message) {
    if (condition) {
      return;
    }
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }
}
