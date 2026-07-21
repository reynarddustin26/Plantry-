import { beforeEach, describe, expect, it } from 'vitest';
import { _resetRateLimitStoreForTests, checkRateLimit } from './rateLimiter';

describe('checkRateLimit', () => {
  beforeEach(() => {
    _resetRateLimitStoreForTests();
  });

  it('allows the first request for a new key', () => {
    const result = checkRateLimit('user-a', 1000, 20);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it('decrements remaining across repeated requests within the window', () => {
    checkRateLimit('user-b', 1000, 5);
    checkRateLimit('user-b', 1100, 5);
    const third = checkRateLimit('user-b', 1200, 5);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(2);
  });

  it('blocks once the limit is reached within the window', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('user-c', 1000 + i, 5);
    const blocked = checkRateLimit('user-c', 1500, 5);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window elapses', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('user-d', 1000 + i, 5);
    const blocked = checkRateLimit('user-d', 1500, 5);
    expect(blocked.allowed).toBe(false);

    const oneHourLater = 1000 + 60 * 60 * 1000 + 1;
    const afterReset = checkRateLimit('user-d', oneHourLater, 5);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(4);
  });

  it('tracks separate keys independently', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('user-e', 1000 + i, 5);
    const blockedE = checkRateLimit('user-e', 1500, 5);
    const freshF = checkRateLimit('user-f', 1500, 5);
    expect(blockedE.allowed).toBe(false);
    expect(freshF.allowed).toBe(true);
  });
});
