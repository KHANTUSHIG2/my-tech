interface RateLimitState {
  attempts: number;
  until: number; // lockout expiry epoch ms (0 = not locked)
}

function read(key: string): RateLimitState {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return { attempts: 0, until: 0 };
  }
}

export function createRateLimiter(
  storageKey: string,
  maxAttempts: number,
  lockoutMs: number,
) {
  return {
    isLocked(): boolean {
      return read(storageKey).until > Date.now();
    },

    remainingMs(): number {
      return Math.max(0, read(storageKey).until - Date.now());
    },

    attemptsLeft(): number {
      const { attempts } = read(storageKey);
      return Math.max(0, maxAttempts - (attempts || 0));
    },

    recordFailure(): void {
      const state = read(storageKey);
      const attempts = (state.attempts || 0) + 1;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          attempts,
          until: attempts >= maxAttempts ? Date.now() + lockoutMs : 0,
        }),
      );
    },

    recordSuccess(): void {
      localStorage.removeItem(storageKey);
    },
  };
}

// Auth modal: 5 attempts → 10 min lockout
export const authLimiter = createRateLimiter(
  "techstore_auth_lockout",
  5,
  10 * 60 * 1000,
);
