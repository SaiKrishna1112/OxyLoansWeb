const { createProxyMiddleware } = require("http-proxy-middleware");

/** Forward /oxyloans → local Spring Boot (config.js ENV=local). Long timeout for slow admin queries. */
module.exports = function (app) {
  app.use(
    "/oxyloans",
    createProxyMiddleware({
      target: "http://localhost:8181",
      changeOrigin: true,
      proxyTimeout: 300000,
      timeout: 300000,
    })
  );
};
