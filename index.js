// versions/5.js

var request = require('request');
var cheerio = require('cheerio');

var savedData = null;

function scrapeData (callback) {
  request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government", function (anyError, server_response, body) {
    if (anyError) {
      callback(anyError, null);
    } else {
      $ = cheerio.load(body);

      var countryData = [];
      var countries = $("table.wikitable tr");

      for (var i = 0; i < countries.length; i++) {
        var country = $(countries[i]);

        var myData = {
          // let's get the country name and wiki link first
          country: country.find("th a").text().trim(),
          wiki: "https://en.wikipedia.org" + country.find("th a").attr("href"),

          // sometimes countries have multiple rows, so start leader list here, and overwrite if continuing the previous country
          // (eg Vietnam, someone is head of state and head of government, then a 2nd row with more heads of state and more heads of government)
          heads_of_state: [],
          heads_of_government: []
        };

        // handle difficult rows
        if (!myData.country.length) {
          // part of the last country - take out of the country list and continue editing
          myData = countryData.pop();
        }
        if (country.find("th").length > 1) {
          // disputed and not ready for module
          continue;
        }

        // separate out the head of state and head of government from this country-row
        var heads_of_state = $(country.find("td")[0]);
        var heads_of_government;
        if (country.find("td").length > 1) {
          // head of government is different from heads of state
          heads_of_government = $(country.find("td")[1]);
        } else {
          // head of government is the same as heads of state
          heads_of_government = heads_of_state;
        }

        // the process to find the title and name of the leaders is the same for both columns
        // so I will write a function and run it on each column
        var listLeaders = function (leader_td) {
          // on this article, separating the cell into multiple lines with a <br/> means multiple people are there
          var leaders = leader_td.html().split(/\<[\s+]?br[\s+]?[\/]?[\s+]?>/);

          // some browsers don't support the Array.map function, but this is happening in NodeJS
          // there's a lot more freedom and advanced JavaScript features you can use here
          return leaders.map(function (leader_html) {
            // split on a hyphen
            var title = cheerio.load("<div>" + leader_html.split("&#x2013;")[0] + "</div>")("div");

            // get rid of the links to the references page
            title.find("sup").remove();
            
            // avoid duplicates
            var madeTitle = title.text().trim();
            var splitTitle = madeTitle.split(/\s+/);
            if (splitTitle.length % 2 === 0) {
              // could be a copy?
              var offset = splitTitle.length / 2;
              var copiedTitle = true;
              for (var i = 0; i < offset; i++) {
                if (splitTitle[i] !== splitTitle[i + offset]) {
                  copiedTitle = false;
                  break;
                }
              }
              if (copiedTitle) {
                madeTitle = splitTitle.slice(0, offset).join(" ");
              }
            }

            var person = cheerio.load("<div>" + leader_html.split("&#x2013;")[1] + "</div>")("div");
            person.find("sup").remove();

            return {
              // grab the text and the link for both sections
              title: {
                name: madeTitle,
                wiki: "https://en.wikipedia.org" + title.find("a").attr("href")
              },
              person: {
                name: person.text().trim(),
                wiki: "https://en.wikipedia.org" + person.find("a").attr("href")
              }
            }
          });
        };

        // add leaders from this rows to blank or pre-existing list of leaders
        myData.heads_of_state = myData.heads_of_state.concat( listLeaders(heads_of_state) );
        myData.heads_of_government = myData.heads_of_government.concat( listLeaders(heads_of_government) );

        // now add it to the output data
        countryData.push(myData);
      }

      callback(null, countryData);
    }
  });
}

function fromCountry(countryName, callback) {
  scrapeData(function (err, countries) {
    if (err) {
      return callback(err, null);
    }
    for (var c = 0; c < countries.length; c++) {
      if (countries[c].country == countryName) {
        return callback(null, countries[c]);
      }
    }
    callback("country not found", null);
  });
}

module.exports = {
  all: scrapeData,
  fromCountry: fromCountry
};
