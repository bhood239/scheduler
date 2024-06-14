const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:8000",
    viewportHeight: 1280,
    viewportWidth: 720,
  },
});
