type Timestamped = { created_at: string };

export const newestFirst = (a: Timestamped, b: Timestamped) => b.created_at.localeCompare(a.created_at);
