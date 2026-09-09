const validRefreshTokens = new Set();

module.exports = {
  addToken: (token) => validRefreshTokens.add(token),
  removeToken: (token) => validRefreshTokens.delete(token),
  isValid: (token) => validRefreshTokens.has(token),
};