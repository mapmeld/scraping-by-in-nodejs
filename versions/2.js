// versions/2.js

// load both modules now
var request = require('request');
var cheerio = require('cheerio');

request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government", function (anyError, server_response, body) {
  // when you're done getting the page, this gets called

  if (anyError) {
    throw anyError;
  } else {
    // body is just a string - let's turn it into a jQuery-like object
    $ = cheerio.load(body);

    // now let's run that same for loop that we used in the browser
    var leaders = $("table.wikitable td");
    for (var i = 0; i < leaders.length; i++) {
      console.log( $(leaders[i]).text() );
    }
  }
});
