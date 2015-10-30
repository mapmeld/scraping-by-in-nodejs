// load express and your own module
var express = require("express");
var worldLeaders = require("./");

// this is how we initialize an Express app
var app = express();

app.get("/", function (req, res) {
  // this is the homepage, where we return all world leaders
  
  worldLeaders.all(function (anyError, leaders) {
    if (anyError) {
      res.json({ error: anyError });
    } else {
      res.json(leaders);
    }
  });
});

app.get("/country/:requestedCountry", function (req, res) {
  // this is the API page for any country
  
  worldLeaders.fromCountry(req.params.requestedCountry, function (anyError, leaders) {
    if (anyError) {
      res.json({ error: anyError });
    } else {
      res.json(leaders);
    }
  });
});

// OK now the server knows what to do. Let's launch it:
app.listen("8080", function() {
  console.log("Server ready on http://localhost:8080");
});