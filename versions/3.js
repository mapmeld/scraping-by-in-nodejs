// versions/3.js

var request = require('request');
var cheerio = require('cheerio');

function scrapeData (callback) {
  request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government", function (anyError, server_response, body) {
    if (anyError) {
      callback(anyError, null);
    } else {
      $ = cheerio.load(body);

      var leaders = $("table.wikitable td");
      var leaderData = [];
      for (var i = 0; i < leaders.length; i++) {
        leaderData.push( $(leaders[i]).text() );
      }
      callback(null, leaderData);
    }
  });
}

// here's the code which starts the scraper and decides what to do with the returned data
// it looks similar to what we had before, but we've separated the scraping and DOM manipulation from how we handle the data and errors
scrapeData(function (anyError, leaders) {
  if (anyError) {
    throw anyError;
  } else {
    console.log(leaders);
  }
});
