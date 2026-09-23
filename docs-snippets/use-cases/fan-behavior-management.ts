import PubNub from '../../lib/types';

// Restricting what a fan may do is a server-side operation, so this client is
// configured with the keyset's secret key and runs on your own infrastructure.
const server = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  secretKey: 'demo',
  userId: 'moderation-service',
});

// The fan's own client never holds the secret key. It only applies tokens.
const fanClient = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'fan-42',
});

// snippet.fanBehaviorStateStore
import fs from 'node:fs';

// A real token service tracks issued tokens and each fan's status in a database.
// This tutorial persists the same information in a JSON file next to the script,
// so `grant`, `mute`, `unmute`, and `ban` share state across separate `node server.js`
// invocations without needing a database just to run the tutorial.
const stateFilePath = new URL('./fan-state.json', import.meta.url);

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveState(state = {}) {
  fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
}
// snippet.end

// snippet.fanBehaviorGrantChatAccess
async function grantChatAccess(userId = '') {
  const state = loadState();
  const entry = state[userId] ?? { status: 'active', tokens: [] };

  if (entry.status === 'banned') {
    console.log(`${userId} is banned, so no token was issued`);
    return;
  }

  const canWrite = entry.status !== 'muted';

  try {
    const token = await server.grantToken({
      ttl: 60,
      authorizedUserId: userId,
      resources: {
        channels: {
          'game.chat': { read: true, write: canWrite },
        },
      },
    });

    entry.status = entry.status ?? 'active';
    entry.tokens = [...entry.tokens, { token, write: canWrite }];
    state[userId] = entry;
    saveState(state);

    console.log(`token that allows ${canWrite ? 'reading and writing' : 'reading'} chat:`, token);
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? error.status : undefined;
    console.error(`Granting chat access failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
  }
}
// snippet.end

// snippet.fanBehaviorMuteFan
async function muteFan(userId = '') {
  const state = loadState();
  const entry = state[userId] ?? { status: 'active', tokens: [] };

  if (entry.status === 'banned') {
    console.log(`${userId} is already banned, so there is nothing left to mute`);
    return;
  }

  const writableTokens = entry.tokens.filter((issued = { token: '', write: false }) => issued.write);
  const stillValid = [];

  for (const issued of writableTokens) {
    try {
      await server.revokeToken(issued.token);
      console.log('revoked an outstanding writable token');
    } catch (error) {
      const status = error instanceof Error && 'status' in error ? error.status : undefined;
      console.error(`Revoking a writable token failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      // Keep tracking a token you couldn't revoke, so the next mute or ban retries it.
      stillValid.push(issued);
    }
  }

  // Record the mute before issuing anything new, so a later grant can't hand out write access.
  entry.status = 'muted';
  entry.tokens = [...entry.tokens.filter((issued = { token: '', write: false }) => !issued.write), ...stillValid];
  state[userId] = entry;
  saveState(state);

  if (stillValid.length > 0) {
    console.error(`${stillValid.length} writable token(s) are still valid. Run mute again to retry revoking them.`);
  }

  try {
    const token = await server.grantToken({
      ttl: 15,
      authorizedUserId: userId,
      resources: {
        channels: {
          'game.chat': { read: true },
        },
      },
    });

    entry.tokens = [...entry.tokens, { token, write: false }];
    state[userId] = entry;
    saveState(state);

    console.log('token that allows reading chat but not writing to it:', token);
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? error.status : undefined;
    console.error(`Muting the fan failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
  }
}
// snippet.end

// snippet.fanBehaviorUnmuteFan
async function unmuteFan(userId = '') {
  const state = loadState();
  const entry = state[userId] ?? { status: 'active', tokens: [] };

  // This is the one command that clears a ban as well as a mute. Calling it is always
  // a deliberate decision by whoever operates server.js, never a side effect of anything
  // else in this tutorial.
  try {
    const token = await server.grantToken({
      ttl: 60,
      authorizedUserId: userId,
      resources: {
        channels: {
          'game.chat': { read: true, write: true },
        },
      },
    });

    entry.status = 'active';
    entry.tokens = [...entry.tokens, { token, write: true }];
    state[userId] = entry;
    saveState(state);

    console.log('token that allows reading and writing chat again:', token);
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? error.status : undefined;
    console.error(`Unmuting the fan failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
  }
}
// snippet.end

// snippet.fanBehaviorBanFan
async function banFan(userId = '') {
  const state = loadState();
  const entry = state[userId] ?? { status: 'active', tokens: [] };

  const stillValid = [];

  for (const issued of entry.tokens) {
    try {
      await server.revokeToken(issued.token);
      console.log('revoked an outstanding token');
    } catch (error) {
      const status = error instanceof Error && 'status' in error ? error.status : undefined;
      console.error(`Revoking a token failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
      // Keep tracking a token you couldn't revoke, so the next ban retries it.
      stillValid.push(issued);
    }
  }

  entry.status = 'banned';
  entry.tokens = stillValid;
  state[userId] = entry;
  saveState(state);

  if (stillValid.length > 0) {
    console.error(`${userId} is banned, but ${stillValid.length} token(s) are still valid. Run ban again to retry revoking them.`);
  } else {
    console.log(`${userId} is banned. Every outstanding token, read-only and writable, is now revoked.`);
  }
}
// snippet.end

// snippet.fanBehaviorServerDispatch
const [, , command, userIdArgument] = process.argv;
const targetUserId = userIdArgument ?? 'fan-42';

if (command === 'grant') {
  await grantChatAccess(targetUserId);
} else if (command === 'mute') {
  await muteFan(targetUserId);
} else if (command === 'unmute') {
  await unmuteFan(targetUserId);
} else if (command === 'ban') {
  await banFan(targetUserId);
} else {
  console.log('usage: node server.js <grant|mute|unmute|ban> [userId]');
}
// snippet.end

// snippet.fanBehaviorHandleAccessDenied
fanClient.addListener({
  status: (event) => {
    if (event.category === 'PNConnectedCategory') {
      console.log('connected to game.chat');
    } else if (event.category === 'PNAccessDeniedCategory') {
      console.log('this fan may no longer write to', event.affectedChannels);
    }
  },
});
// snippet.end

// snippet.fanBehaviorApplyToken
const suppliedToken = process.argv[2];

if (!suppliedToken) {
  console.error('usage: node fan.js <token>');
  process.exit(1);
}

fanClient.setToken(suppliedToken);
// snippet.end

// snippet.fanBehaviorSubscribeAndPublish
const subscription = fanClient.channel('game.chat').subscription();
subscription.subscribe();

try {
  const response = await fanClient.publish({
    channel: 'game.chat',
    message: { text: 'Come on!' },
  });
  console.log('chat message published at timetoken:', response.timetoken);
} catch (error) {
  const status = error instanceof Error && 'status' in error ? error.status : undefined;
  console.error(`Publishing to game.chat failed: ${error}${status ? ` Additional information: ${status}` : ''}`);
}
// snippet.end

// snippet.fanBehaviorInspectToken
const parsed = fanClient.parseToken('replace-with-the-token-to-inspect');

if (parsed) {
  console.log('token expires in', parsed.ttl, 'minutes');
  console.log('channel permissions:', parsed.resources?.channels);
}
// snippet.end
