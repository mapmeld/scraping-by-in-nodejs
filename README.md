# How To:
## Scraping By in NodeJS

This tutorial is for newbies or near-newbies to NodeJS, who have written some jQuery before.

By the end of the tutorial, you will publish a site-scraping module on npmjs.com - then you and other developers can get data out of that site by installing your module.

This repo contains the code for my own scraper module, which returns a list of world leaders from Wikipedia. You're welcome to look at the code or use it IRL.

### Thinking about what web servers are

If you're coming into this with 100% client-side experience, you might have questions about "server-side JavaScript". Most of my client-side
work was creating visualizations and maps on web pages, so at first I wondered, how would I load the Google Maps API into Node? How would I respond to events like click and drag?
How would people see my pages?

A web server program is a hub designed for three things: figuring out what the user wants, finding that information, and responding to the user. It can be written in many languages, and JavaScript is just
being repurposed to write this kind of program.

Let's look at a pseudocode example:

```javascript
// the server waits until an event, like someone requesting a page on the website
// this happens anytime someone follows a link or types in a URL
// if two users arrive it will call this function twice, and handle them separately

// pseudocode
server.onRequest = function (url) {
  if (url == "/") {
    // homepage - respond with static HTML page
    send(homepage.html);
  } else if (url == "/profile/:username") {
    // look up this user in the database
    database.findUser(username, function (userData) {
      // when the database finds this user and reports back, we can continue responding
      // the template will be written in a format like HAML, JADE, ERB, etc
      // the browser will see just HTML and not know it was made from a template
      send(profile.template, { user: userData });
    });
    // don't return anything from this function - wait for the callback function to be called with data
  }
};
```

In this code, we don't know what the website looks like, and we didn't write any code for the browser. The browser just receives HTML without knowing what happened inside the server.

To repeat from before: the server was designed around three things: figuring out what the user wants, finding that information, and responding to the user.

### Thinking about NodeJS, servers, and modules

NodeJS servers are similar to that pseudocode example, especially if you use a framework like ExpressJS. But before you write a server, it's easier to write a module. A module can be a set of data
and functions which you can import into other NodeJS programs. Using Browserify and WebPack, you can
also use many modules as client-side / browser libraries. There are also NodeJS command line tools and
small hardware devices.

In this example, scraping a [list of world leaders from Wikipedia] (https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government), there is a good use case to separate your app and the leader module. You could probably turn it into an interesting API, where people can request the full table, an individual country, or historical data.

If you don't do a lot of calls to other websites and servers, you might think about making a step-by-step, synchronous program like this:

```javascript
// pseudocode!
server.onRequest = function(url) {
  leaders = getLeaders();
  send(leaders);
};
```

This won't work because getting the leaders includes scraping a Wikipedia page and waiting for a response at a later time. This means you would want to write an asynchronous program with a callback:

```javascript
// pseudocode!
server.onRequest = function(url) {
  getLeaders(function (leaders) {
    send(leaders);
  });
};
```

The getLeaders function does not return anything. Instead it starts a chain of requests and processing, and you give it a function to call when it's done.

### Create your project with git init and npm init

First, install NodeJS and git on your computer.

Run this code in the command prompt:

```bash
mkdir world-leaders
cd world-leaders
git init
npm init
```

npm init will ask you some questions. You can type something or press Enter to accept a suggestion / leave it blank.

For "git repository" you can leave it blank, or create a repo on GitHub. Paste in the HTTP URL.

For "license" you can review [several options](http://choosealicense.com/) for open-sourcing your code, but I typically use MIT.

Running npm init creates package.json, the main source of information about your module, its use, and the libraries that it needs to work. You can modify this file later directly, or re-run npm init.

### Install Node modules as dependencies

You don't need to re-invent the wheel to load an HTML page into your script. In the command prompt:

```bash
npm install request --save
```

This asks npmjs.com if it has a module named "request", and installs the latest version. Adding --save puts the module and its version into your package.json file, under "dependencies".

This tutorial also uses Cheerio, an awesome module which lets you use jQuery-like features. Let's install that one, too:

```bash
npm install cheerio --save
```

### GET-ing a page

I'm creating a file called index.js to be the main part of my script. The first thing it needs to do to scrape a webpage is to load the HTML source of the page as a string. Let's try that, and then use
console.log to print it out to the command line, to see if it worked.

```javascript
// real JavaScript, not pseudocode anymore
// versions/1.js

// load the module that I installed
var request = require('request');

// request is a function that I can use like this:

request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government",
  function (anyError, server_response, body) {
  // when you're done getting the page, this gets called

  if (anyError) {
    // let's go ahead and crash the script if there is an error
    throw anyError;
  } else {
    // console.log will output to the command line
    console.log(body);
  }
});
```

Run ```node index.js``` and see what happens.

If everything works, you should see a bunch of HTML output to the command line. If you are offline and unable to connect to Wikipedia HTTPS, you see an error like this:

```bash
scraping-by-in-node-js/versions/1.js:14
    throw anyError;
    ^

Error: getaddrinfo ENOTFOUND en.wikipedia.org en.wikipedia.org:443
    at errnoException (dns.js:26:10)
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:77:26)
```

This is a good time to **check that your data is in the HTML source of the page**. If it is loaded later by JavaScript, like Airbnb and other house-listing sites, then you should look up the right URL to request and scrape.

Here's part of the HTML source for the head of state and government:

```html
<table class="wikitable">
...
<tr>
  <th style="font-weight:normal; text-align:left;">
    <a href="/wiki/United_Kingdom" title="United Kingdom">United Kingdom</a>
  </th>
  <td>
    <a href="/wiki/Monarchy_of_the_United_Kingdom" title="Monarchy of the United Kingdom">Queen</a>&#160;–
    <a href="/wiki/Elizabeth_II" title="Elizabeth II">Elizabeth II</a>
    <sup id="cite_ref-ERII_3-15" class="reference">
      <a href="#cite_note-ERII-3">
        <span>[</span>n 3<span>]</span>
      </a>
    </sup>
  </td>
  <td style="background-color:LightYellow;">
    <a href="/wiki/Prime_Minister_of_the_United_Kingdom" title="Prime Minister of the United Kingdom">Prime Minister</a>&#160;–
    <a href="/wiki/David_Cameron" title="David Cameron">David Cameron</a>
  </td>
</tr>
<tr>
  <th style="font-weight:normal; text-align:left;">
    <a href="/wiki/United_States" title="United States">United States</a>
  </th>
  <td colspan="2" style="background-color:LightYellow;">
    <div align="center">
      <a href="/wiki/President_of_the_United_States" title="President of the United States">President</a>&#160;–
      <a href="/wiki/Barack_Obama" title="Barack Obama">Barack Obama</a>
    </div>
  </td>
</tr>
...
</table>
```

The HTML has some interesting data: the country's name and article, the position's name and Wikipedia article, and the current name and Wikipedia article for that leader. We can see that each country gets a tr element, and the leader gets a td element, which can be two columns wide if -like in the US- the leader is head of state and head of government.

### Using jQuery to get leader names

In jQuery, if you wanted to get a list of leader td elements out of that HTML, you would do this:

```javascript
$("table.wikitable td")
```

Go to Wikipedia, open the browser, and start testing this yourself.

There are several jQuery functions you could use to iterate, but to avoid losing anyone, let's write a for loop for now:

```javascript
var leaders = $("table.wikitable td");
for (var i = 0; i < leaders.length; i++) {
  console.log( $(leaders[i]).text() );
}
```

Although some of the leaders' names have additional text, it's mostly good:

```
President – Park Geun-hye[n 1]
Prime Minister – Hwang Kyo-ahn
```

### Translating jQuery to Cheerio to get leader names

Let's go back to index.js and start using the cheerio module that we installed. It's a good idea to open up [the official documentation on npmjs](https://www.npmjs.com/package/cheerio) for this module.

```javascript
// versions/2.js

// load both modules now
var request = require('request');
var cheerio = require('cheerio');

request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government",
  function (anyError, server_response, body) {
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
```

Cool! It should work the same in NodeJS as in the browser!

### Returning JSON data instead of logging

If this scraper is ever going to become a module, I need a function that returns a JSON object on command, instead of just dumping out text.

I'm going to call this function scrapeData. Because it has the asynchronous code from requesting a page inside of it, I will pass data back through a callback function instead of trying to use "return". This callback function will be the new way to handle errors and returned data.

```javascript
// versions/3.js

var request = require('request');
var cheerio = require('cheerio');

function scrapeData (callback) {
  request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government",
    function (anyError, server_response, body) {
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
```

When I run ```node index.js```, I now get a JSON array of leader names:

```
...
'Prime Minister – Ralph Gonsalves',
'O le Ao o le Malo – Tufuga Efi',
'Prime Minister – Tuilaepa Aiono Sailele Malielegaoi',
'\nCaptain Regent – Lorella Stefanelli[n 8]\n',
...
```

### Make your data awesome

If you want this module to be useful to you and others, keep pushing to organize and improve the data.
This list of leader names is interesting, but if I were getting JSON data in my app, I'd like it to be cleaner, and I'd like it to be organized by country. I'd also like it to handle unusual cases, like countries with multiple heads of state / heads of government.

Something like this:

```javascript
[
  {
    "country": "United States",
    "wiki": "https://en.wikipedia.org/wiki/United_States",
    "heads_of_state": [
      {
        "title": {
          "name": "President",
          "wiki": "https://en.wikipedia.org/wiki/President_of_the_United_States"
        },
        "person": {
          "name": "Barack Obama",
          "wiki": "https://en.wikipedia.org/wiki/Barack_Obama"
        }
      }
    ],
    "heads_of_government": [
      {
        "title": {
          "name": "President",
          "wiki": "https://en.wikipedia.org/wiki/President_of_the_United_States"
        },
        "person": {
          "name": "Barack Obama",
          "wiki": "https://en.wikipedia.org/wiki/Barack_Obama"
        }
      }
    ]
  }
]
```

I'm going to jump ahead... my final code is about 100 lines, but most of it is specific to my scraper. Here are a few snippets which show you how much Cheerio looks like jQuery:

```javascript
if (country.find("td").length > 1) {
  // head of government is different from heads of state
  heads_of_government = $(country.find("td")[1]);
} else {
  // head of government is the same as heads of state
  heads_of_government = heads_of_state;
}
...
wikiLink = title.find("a").attr("href");
...
person.find("sup").remove();
```

You can view the full code here: <a href="https://github.com/mapmeld/scraping-by-in-nodejs/blob/master/versions/4.js">https://github.com/mapmeld/scraping-by-in-nodejs/blob/master/versions/4.js</a>

### Turning your script into a module

The function which you made can be turned into a reusable module, similar to how you were able to do this:

```javascript
var request = require("request");
request("http://example.com", function() { ... });
```

To make this happen, remove the call to scrapeData at the end, and instead write:

```javascript
module.exports = scrapeData;
```

Your full file is now looking like this:

```javascript
var request = require('request');
var cheerio = require('cheerio');

function scrapeData (callback) { ... }

module.exports = scrapeData;
```

Now you can test it in the Node REPL. On your command line, type ```node``` and then enter this:

```javascript
leaders = require('./index.js');
> [Function: scrapeData]
leaders(function(err, data) { console.log(JSON.stringify(data)) })
```

If everything went OK, you should first get an "undefined" response, from your function not returning anything, then when the request finishes, your data should come out.

### Publishing your node module

Go to npmjs.com and create an account. Confirm your e-mail.

Then, on the command line, run ```npm publish```. You will be asked to log in.

If everything goes well, you should have a module listed at npmjs.com/package/PACKAGENAME

If you ever need to update the module, go to package.json, increase your version number, and re-run ```npm publish```. You cannot re-publish a module without changing the version number, because that would be confusing.

### Modules with multiple functions

You have a simple ```leaders()``` function, but what if you want your module to be a little smarter, returning leaders for a specific country? You can add a new function and rewrite module.exports like this:

```javascript
module.exports = {
  all: scrapeData,
  fromCountry: fromCountry
};
```

You can also include JSON data in your exports. This isn't done so much, but it's helpful if your module comes with an interesting dataset.

```javascript
module.exports = {
  all: scrapeData,
  fromCountry: fromCountry,
  credit: "CC-BY-SA Wikipedia.org"
};
```

Here's how it works when someone uses your module:

```javascript
var leaders = require('world-leaders');
leaders.all(function (err, allLeaders) {
  console.log(allLeaders);
  console.log("from " + leaders.credit);
});
```

To avoid repeating your code, you should have fromCountry use your own scrapeData function.
**Don't overload Wikipedia with requests** - save your scraped data somewhere outside your function
and it will stick around in memory. When you restart the server, it will re-scrape.

```javascript
var savedData = null;

function scrapeData(callback) {
  if (savedData) {
    // already scraped! so fast now
    return callback(null, savedData);
  }
  ...
    // whenever you finish scraping, save the response
    savedData = countryData;
    callback(null, countryData);
  ...
}

function fromCountry(countryName, callback) {
  // fromCountry doesn't need to know if it is the scraping or viewing a cached copy
  // just reuse your existing code
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
```

### Testing your node module

### Including your package in a server
