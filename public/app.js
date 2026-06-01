const state = {
  game: null,
  selectedPlayerId: null
};

const $ = (id) => document.getElementById(id);

const elements = {
  hostName: $("hostName"),
  playerName: $("playerName"),
  createGame: $("createGame"),
  startGame: $("startGame"),
  joinGame: $("joinGame"),
  saveGame: $("saveGame"),
  passTurn: $("passTurn"),
  statusBadge: $("statusBadge"),
  gameId: $("gameId"),
  deckCount: $("deckCount"),
  currentPlayer: $("currentPlayer"),
  winner: $("winner"),
  players: $("players"),
  playerSelect: $("playerSelect"),
  hand: $("hand"),
  rules: $("rules"),
  messages: $("messages")
};

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "API-Fehler");
  }
  return data;
}

function log(message) {
  const timestamp = new Date().toLocaleTimeString("de-DE");
  elements.messages.textContent = `[${timestamp}] ${message}\n${elements.messages.textContent}`;
}

function playerName(playerId) {
  return state.game?.players.find((player) => player.id === playerId)?.username ?? "-";
}

function render() {
  const game = state.game;
  elements.statusBadge.textContent = game?.status ?? "Kein Spiel";
  elements.gameId.textContent = game?.id ?? "-";
  elements.deckCount.textContent = game?.deck_remaining ?? "-";
  elements.currentPlayer.textContent = game?.current_turn_player ? playerName(game.current_turn_player) : "-";
  elements.winner.textContent = game?.winner_id ? playerName(game.winner_id) : "-";

  elements.startGame.disabled = !game || game.status !== "CREATED" || game.players.length < game.min_players;
  elements.joinGame.disabled = !game || game.status !== "CREATED";
  elements.saveGame.disabled = !game;
  elements.passTurn.disabled = !game || game.status !== "RUNNING" || !state.selectedPlayerId;

  elements.players.innerHTML = "";
  elements.playerSelect.innerHTML = "";

  if (!game) {
    elements.hand.innerHTML = "";
    return;
  }

  for (const player of game.players) {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.username;
    option.selected = player.id === state.selectedPlayerId;
    elements.playerSelect.append(option);

    const item = document.createElement("article");
    item.className = "player";
    const details = document.createElement("div");
    const username = document.createElement("strong");
    username.textContent = player.username;
    const metadata = document.createElement("small");
    metadata.textContent = `${player.role} · ${player.hand_count} Karten`;
    details.append(username, metadata);
    const score = document.createElement("strong");
    score.textContent = `${player.score} Punkte`;
    item.append(details, score);
    elements.players.append(item);
  }

  if (!state.selectedPlayerId && game.players.length > 0) {
    state.selectedPlayerId = game.players[0].id;
    elements.playerSelect.value = state.selectedPlayerId;
  }
}

async function refreshGame() {
  if (!state.game) {
    render();
    return;
  }
  state.game = await api(`/game/${state.game.id}/state`);
  render();
  await loadHand();
}

async function loadRules() {
  const rules = await api("/rules");
  elements.rules.innerHTML = "";
  for (const rule of rules) {
    const item = document.createElement("li");
    item.textContent = rule.rule_text;
    elements.rules.append(item);
  }
}

async function loadHand() {
  elements.hand.innerHTML = "";
  if (!state.game || !state.selectedPlayerId) {
    return;
  }

  const { hand } = await api(`/game/${state.game.id}/hand/${state.selectedPlayerId}`);
  for (const card of hand) {
    const item = document.createElement("article");
    item.className = "card";
    const label = document.createElement("strong");
    label.textContent = `${card.rank} ${card.suit}`;
    item.append(label);

    const button = document.createElement("button");
    button.textContent = "Spielen";
    button.disabled = state.game.status !== "RUNNING" || state.game.current_turn_player !== state.selectedPlayerId;
    button.addEventListener("click", async () => {
      try {
        state.game = await api(`/game/${state.game.id}/play`, {
          method: "POST",
          body: { playerId: state.selectedPlayerId, cardId: card.id }
        });
        log(`${playerName(state.selectedPlayerId)} spielt ${card.rank} ${card.suit}.`);
        render();
        await loadHand();
      } catch (error) {
        log(error.message);
      }
    });

    item.append(button);
    elements.hand.append(item);
  }
}

elements.createGame.addEventListener("click", async () => {
  try {
    state.game = await api("/game/create", {
      method: "POST",
      body: { hostName: elements.hostName.value }
    });
    state.selectedPlayerId = state.game.host_id;
    log("Spiel erstellt.");
    render();
    await loadHand();
  } catch (error) {
    log(error.message);
  }
});

elements.joinGame.addEventListener("click", async () => {
  try {
    const result = await api(`/game/${state.game.id}/join`, {
      method: "POST",
      body: { username: elements.playerName.value }
    });
    state.game = result.game;
    state.selectedPlayerId = result.player.id;
    log(`${result.player.username} ist beigetreten.`);
    render();
    await loadHand();
  } catch (error) {
    log(error.message);
  }
});

elements.startGame.addEventListener("click", async () => {
  try {
    state.game = await api(`/game/${state.game.id}/start`, { method: "POST" });
    state.selectedPlayerId = state.game.current_turn_player;
    log("Spiel gestartet.");
    render();
    await loadHand();
  } catch (error) {
    log(error.message);
  }
});

elements.saveGame.addEventListener("click", async () => {
  try {
    await api(`/game/${state.game.id}/save`, {
      method: "POST",
      body: { description: "Manueller Spielstand aus dem Frontend" }
    });
    log("Spielstand gespeichert.");
  } catch (error) {
    log(error.message);
  }
});

elements.passTurn.addEventListener("click", async () => {
  try {
    state.game = await api(`/game/${state.game.id}/pass`, {
      method: "POST",
      body: { playerId: state.selectedPlayerId }
    });
    state.selectedPlayerId = state.game.current_turn_player ?? state.selectedPlayerId;
    log("Zug gepasst.");
    render();
    await loadHand();
  } catch (error) {
    log(error.message);
  }
});

elements.playerSelect.addEventListener("change", async () => {
  state.selectedPlayerId = elements.playerSelect.value;
  render();
  await loadHand();
});

loadRules().catch((error) => log(error.message));
render();
