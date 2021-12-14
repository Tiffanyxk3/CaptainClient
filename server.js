// Require the framework and instantiate it

const path = require("path");
const fastify = require('fastify')({
   logger: true
 });

// Declare a route
fastify.register(require("fastify-static"), {
   root: path.join(__dirname, "static"),
   prefix: "/" // optional: default '/'
});

// Run the server
fastify.listen(3000, function (err, address) {
  if (err) {
    console.log(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
});