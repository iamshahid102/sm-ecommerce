module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  // sanitize-html 2.18 ships ESM-only htmlparser2 dependencies. Babel must
  // transform those packages before Jest's CommonJS runtime loads them.
  transformIgnorePatterns: [
    "node_modules/(?!(sanitize-html|htmlparser2|domhandler|domutils|dom-serializer|domelementtype|entities)/)",
  ],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
  coverageDirectory: "coverage",
};
