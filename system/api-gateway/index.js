const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();

const config = require("./src/config");

function printRequest(path, req) {
  console.log(`Request to ${path}${req.url === "/" ? "" : req.url}`);
}

// app.use("/", (_, res) => {
//   console.log("Request to /");
//   return res.send("API Gateway");
// });

// Route requests to the auth service
app.use("/api/users", (req, res) => {
  printRequest("/api/users", req);
  proxy.web(req, res, { target: config.userServiceUrl });
});

// Route requests to the product service
app.use("/api/products", (req, res) => {
  printRequest("/api/products", req);
  proxy.web(req, res, { target: config.productServiceUrl });
});

// Route requests to the order service
app.use("/api/orders", (req, res) => {
  printRequest("/api/orders", req);
  proxy.web(req, res, { target: config.orderServiceUrl });
});

// Start the server
app.listen(config.port, () => {
  console.log(`API Gateway on port ${config.port}`);
});

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});