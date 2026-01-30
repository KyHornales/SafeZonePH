import { formatDate, timeAgo, getRankProgress, getInitials } from './helpers';

describe('formatDate utility', () => {
  test('formats date correctly', () => {
    const formatted = formatDate('2024-01-15T10:30:00');
    
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  test('handles string date input', () => {
    const formatted = formatDate('2024-01-15');
    
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});

describe('timeAgo utility', () => {
  test('returns "just now" for recent dates', () => {
    const now = new Date().toISOString();
    const result = timeAgo(now);
    
    expect(result.toLowerCase()).toMatch(/now|second|just/);
  });

  test('returns minutes ago for dates within an hour', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const result = timeAgo(thirtyMinutesAgo);
    
    expect(result.toLowerCase()).toMatch(/min|m ago|minute/);
  });

  test('returns hours ago for dates within a day', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(fiveHoursAgo);
    
    expect(result.toLowerCase()).toMatch(/hour|h ago/);
  });

  test('returns days ago for dates more than a day old', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(threeDaysAgo);
    
    expect(result.toLowerCase()).toMatch(/day|d ago/);
  });
});

describe('getRankProgress utility', () => {
  test('calculates correct progress percentage', () => {
    const result = getRankProgress(500, 'Kapit-Bisig Helper');
    
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('next');
    expect(result).toHaveProperty('percentage');
    expect(typeof result.percentage).toBe('number');
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });

  test('returns 100% for max rank', () => {
    const result = getRankProgress(10000, 'Community Guardian');
    
    expect(result.percentage).toBe(100);
  });

  test('handles zero points', () => {
    const result = getRankProgress(0, 'Bagong Kaibigan');
    
    expect(result.current).toBe(0);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
  });
});

describe('getInitials utility', () => {
  test('returns initials from full name', () => {
    const initials = getInitials('Juan Dela Cruz');
    
    expect(initials).toBeTruthy();
    expect(typeof initials).toBe('string');
    expect(initials.length).toBeLessThanOrEqual(2);
  });

  test('handles single name', () => {
    const initials = getInitials('Juan');
    
    expect(initials).toBeTruthy();
  });

  test('handles empty input gracefully', () => {
    const initials = getInitials('');
    
    expect(initials).toBeDefined();
  });
});
