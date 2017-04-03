# How To:
## Scraping By in NodeJS

This tutorial is for newbies or near-newbies to NodeJS, who have written some jQuery before.

By the end of the tutorial, you will publish a site-scraping module on NPM - then you and other developers can get data out of that site by installing your module.

This repo contains the code for my own scraper module, which returns a list of world leaders from Wikipedia. You're welcome to look at the code or use it in a real application.

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
      // after the database finds this user and reports back, we can continue responding
      // the browser will see just this HTML or other text
      send('hello ' + userData.name);
    });
    // don't return anything from this function - wait for the callback function to be called with data
  }
};
```

In this code, we don't know what the website looks like, and we didn't write any code for the browser. The browser just receives HTML without knowing what happened inside the server.

To repeat from before: the server was designed around three things: figuring out what the user wants, finding that information, and responding to the user.

### Thinking about NodeJS, servers, and modules

NodeJS servers, especially frameworks like ExpressJS, are similar to that pseudocode. But before you write a server, it's easier to write a module. A module is a set of data and functions which you can import into other NodeJS programs. Using tools such as Browserify or WebPack, you could also use modules as client-side / browser libraries. There are also NodeJS command line tools and small hardware devices.

In this example, scraping a <a href='https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government'>list of world leaders from Wikipedia</a>, there is a good use case to separate your app and the leader module. You could probably turn it into an interesting API, where people can request the full table, an individual country, or historical data.

Your first guess might be to make a step-by-step program like this:

```javascript
// pseudocode!
server.onRequest = function(url) {
  leaders = getLeaders();
  send(leaders);
};
```

This won't work because code is fast, and connecting to Wikipedia takes a lot of time by comparison. Your program will:

* ask Wikipedia for a list of world leaders
* wait for Wikipedia to respond
* wait to finish downloading the response
* run some code to add each leader to a list

Making the server wait here in NodeJS is blocking new requests from coming in to your server.

So you want to write an asynchronous program. This will make a request, and use a new anonymous callback function to process the data when it's done:

```javascript
// pseudocode!
server.onRequest = function(url) {
  getLeaders(function (leaders) {
    send(leaders);
  });
};
```

Before we wrote ```leaders = getLeaders()``` because the function returned data immediately and would store data in the ```leaders``` variable.  In the async version, nothing is returned and instead data is returned inside the callback function, after all of the internal work is completed.

### Create your project with git init and npm init

First, install NodeJS and git on your computer.

Run this code in the command prompt:

```bash
mkdir world-leaders
cd world-leaders
git init
npm init
```

npm init will ask you some questions. You can type answers or press Enter to accept a suggestion / leave it blank.

For "git repository" you can leave it blank, or paste a URL for your GitHub repo.

For "license" you can review [several options](http://choosealicense.com/) for open-sourcing your code, but I typically use MIT.

These settings are stored in package.json, the main source for NPM's information about your module, its use, and the other libraries that it depends on to work. You can modify this file later directly, or re-run npm init.

### Install Node modules as dependencies

You don't need to re-invent the wheel to download HTML from the web. In the command prompt, install the "request" module:

```bash
npm install request --save
```

This installs the latest version on npmjs.com for this module. Adding --save puts the module and its version into your package.json file, under "dependencies". Make sure to list any and all dependencies for your module in the package.json, so other developers can get them all at the same time.

This tutorial also uses Cheerio, which lets you use jQuery-like features. Let's install that one, too:

```bash
npm install cheerio --save
```

### GET-ing a page

I created a file named index.js to be my main script. The first thing it needs to do to scrape a webpage is to load the HTML source of a webpage as a string. Let's try that, and then use
console.log to print it out to the command line and check if it worked.

```javascript
// real JavaScript, not pseudocode anymore
// versions/1.js

// load the module that I installed
var request = require('request');

// request is a function that I can use like this:

request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government",
  function (anyError, serverResponse, body) {
  // when you're done getting the page, this gets called

  if (anyError) {
    // crash the script if there is an error
    throw anyError;
  } else {
    // console.log will output to the command line
    console.log(body);
  }
});
```

Run ```node index.js``` and see what happens.

If everything works, you should see a lot of HTML output to the command line. If you are offline and unable to connect to Wikipedia, you might see an error like this:

```bash
scraping-by-in-node-js/versions/1.js:14
    throw anyError;
    ^

Error: getaddrinfo ENOTFOUND en.wikipedia.org en.wikipedia.org:443
    at errnoException (dns.js:26:10)
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:77:26)
```

This is a good time to **check that the data that you want to scrape is in the HTML source**. If data is loaded later by JavaScript, as it is on Airbnb and other house-listing sites, then you should look up the right URL to request and scrape.

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

The HTML has some interesting data: the country's name and article, the position's name and Wikipedia article, and the current name and Wikipedia article for that leader. We can see that each country gets a ```tr``` element, and the leader gets a ```td``` element, which can be two columns wide if -like in the US- the leader is head of state and head of government.

### Using jQuery to get leader names

In jQuery, if you wanted to get a list of leader ```td``` elements from that HTML, you would write a selector such as this:

```javascript
$("table.wikitable td")
```

On Wikipedia, you can open the developer tools and test this yourself.

There are several jQuery and modern-JavaScript functions you could use to iterate, but to avoid overcomplicating things, let's write a for loop:

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

Let's go back to index.js and start using the cheerio module that we installed. It's a good idea to open up <a href="https://www.npmjs.com/package/cheerio">the official documentation</a> for this module as a reference.

```javascript
// versions/2.js

// load both modules now
var request = require('request');
var cheerio = require('cheerio');

request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government",
  function (anyError, serverResponse, body) {
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

### Returning data instead of logging

If I want this scraper to become a re-usable module, I need to hide these implementation details someplace and create a single function that other users can call.

I'm going to name this function scrapeData. Because it has asynchronous code requesting a page inside of it, scrapeData also needs to be asynchronous. I will pass the data back through a callback function instead of trying to use "return". This callback function will be the new way to handle errors and world leader data.

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
      callback(anyError, leaderData);
    }
  });
}
```

Code which calls scrapeData and handles its responses would look like this:

```javascript
// we've separated the reusable scraping and DOM manipulation from the application and output
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

### Make your data awesome and structured

If you want this module to be useful to you and others, keep pushing to organize and improve the data.

A list of leader names is interesting, but we can aim for cleaner, more structured JSON data to be returned. I'd like it to organize leaders by country, and handle unusual cases such as countries with multiple heads of state.

Something like this:

```javascript
[  // array of countries
  {
    "country": "United States",
    "wiki": "https://en.wikipedia.org/wiki/United_States",
    "heads_of_state": [ // array of heads of state
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
    "heads_of_government": [ // array of heads of government (can be same as head of state)
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

Once you know what you want the response to look like, you can use Cheerio to start pulling more data from the HTML and inserting it into this structure. My final code is about 100 lines, most of it is specific to this Wikipedia page and my scraper. Here are a few snippets which show you how much Cheerio looks like jQuery:

```javascript
if (country.find("td").length > 1) {
  // head of government and heads of state <td>s exist
  heads_of_government = $(country.find("td")[1]);
} else {
  // head of government is the same as heads of state, copy object
  heads_of_government = heads_of_state;
}
...
// get the URL of a link
wikiLink = title.find("a").attr("href");
...
// remove an element
person.find("sup").remove();
```

You can view the full code here: <a href="https://github.com/mapmeld/scraping-by-in-nodejs/blob/master/versions/4.js">https://github.com/mapmeld/scraping-by-in-nodejs/blob/master/versions/4.js</a>

### Turning your script into a module

On the client-side, JavaScript programs are a collection of libraries and scripts. In NodeJS, you want to publish
all of your code as a reusable module. For example, your code uses the request and cheerio modules. As you've seen with request and cheerio, once you've installed a module you can use it like this:

```javascript
var request = require("request");
request("http://example.com", function(anyError, serverResponse, body) { ... });
```

Let's share your scrapeData function so that people can ```npm install``` your module someday.
In the script, add this line to make the module's main export your scrapeData function.

```javascript
module.exports = scrapeData;
```

Your full file is now looking like this:

```javascript
var request = require('request');
var cheerio = require('cheerio');

function scrapeData (callback) { ... }

// remove the part after the function where you called scrapeData...
// now scrapeData is called by people who use this module

module.exports = scrapeData;
```

You can test your module in the Node REPL:

On your command line, type ```node```, enter, and then enter these lines:

```javascript
getLeaders = require('./index.js');
> [Function: scrapeData]
getLeaders(function(err, data) { console.log(JSON.stringify(data)) })
```

If everything went OK, you should first get an "undefined" response, from your getLeaders call not returning anything synchronously, then when the request finishes your data will come out.

### Publishing your node module

Go to npmjs.com and create an account. Confirm your e-mail.

Open package.json again to make sure you have a good name and version number for your module.

Then, on the command line, run ```npm publish```. You will be asked to log in.

If everything goes well, you should have a module listed at npmjs.com/package/MODULENAME and it should be possible
for others to download it by running ```npm install MODULENAME``` or including it as a dependency in
*their* package.json file.

When you want to update the module, re-open package.json, increase your version number, and re-run ```npm publish```. You cannot re-publish a module without changing the version number, because that would be confusing.

### Modules with multiple functions

In that example, we have one ```scrapeData``` function and, as with ```request```, we make the module
contain just one function.

What if you want your one module to be a little smarter, and have multiple functions and options?
Suppose I want to return leaders for a specific country, too, or look up the country where a specific
leader is from.

You can add a new function and reorganize module.exports so you share both functions:

```javascript
function scrapeData() { ... }

function fromCountry() { ... }

module.exports = {
  all: scrapeData,
  fromCountry: fromCountry
};
```

You can also include JSON data in your exports. This isn't done so often, but it's helpful if your module comes with an interesting dataset.

```javascript
module.exports = {
  all: scrapeData,
  fromCountry: fromCountry,
  credit: "CC-BY-SA Wikipedia.org"
};
```

If someone is writing a script, and they have your module installed, they can still use ```require("MODULENAME")```,
but they need to call the specific function.

```javascript
var leaders = require('world-leaders');

// change from leaders() to leaders.all()
leaders.all(function (err, allLeaders) {
  console.log(allLeaders);
  console.log("from " + leaders.credit);
});
```

To avoid repeating your scraper code, you can have fromCountry use the same scrapeData function.
**Don't overload Wikipedia with requests** - save your scraped data somewhere.

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

You should write tests to make sure that your module returns consistent responses, even as you continue changing the code. In fact, many people believe you should
write tests first (test-driven development!). But this is a tutorial so you'll learn the testing part now.

Install the mocha test module and command line tools:

```bash
npm install mocha -g
npm install mocha --save-dev
```

In your package.json file, look for a "scripts" property and add a test script:

```javascript
{
  "name": "world-leaders",
   ...
   ...
  "scripts": {
    "test": "mocha"
  },
  ...
}
```

Now when you run ```npm test``` on the command line, you should get the error

```bash
Error: cannot resolve path (or pattern) 'test'
    at Object.lookupFiles (/usr/local/lib/node_modules/mocha/lib/utils.js:591:32)
```

Run ```mkdir test``` and create test.js inside of it. Here's what a simple test might look like:

```javascript
// use Node's built-in assert library
var assert = require('assert');

// import your own module from the parent directory
var worldLeaders = require('../index.js');

// use describe(function() { .. }) blocks to organize your tests
// on the top level, we describe a feature ("list all world leaders")
// on the next level, we describe an expectation of how it'll work ("separate head of state and head of government")
describe("list all world leaders:", function() {
  it("has leaders for 203 countries", function (done) {
    // run your module's code
    worldLeaders.all(function(anyErrors, leaders) {
      // use assert.equal and other assert functions to check that responses match expectations
      assert.equal(anyErrors, null);
      assert.equal(leaders.length, 203);
      
      // when you test async, functions, call the done() function afterward
      done();
    });
    
    // usually this test fails if it takes 2 seconds or longer to call done()
    // scraping takes some time, so let's give 4 seconds (4000 milliseconds)
    this.timeout(4000);
  });
});
```

This test isn't testing your code so much, because if it fails it is likely Wiki editors who added or removed
a country. The same thing could happen if you test that a leader's name is in the response.
Here are some better tests which look at the structure of your data and behavior of your code:

* each country has a head of state and a head of government
* the list includes the United States
* the United States has a President as both head of state and head of government, and they are equivalent
* the United Kingdom's head of state is different from the head of government, who is the Prime Minister
* there are between 190 and 210 countries

Here's how I would test the first three:

```javascript
var assert = require('assert');
var worldLeaders = require('../index.js');

describe("calling worldLeaders.all() ", function() {
  it("has one head of state and head of government for each country", function (done) {
    worldLeaders.all(function(anyErrors, leaders) {
      assert.equal(anyErrors, null);
      // go through the list of countries and find any obvious missing people
      for (var i = 0; i < leaders.length; i++) {
        // requirements for each country
        assert.notEqual(leaders[i].heads_of_state, null);
        assert.notEqual(leaders[i].heads_of_state.length, 0);
        assert.notEqual(leaders[i].heads_of_government, null);
        assert.notEqual(leaders[i].heads_of_government.length, 0);
      }
      done();
    });
    // keep the timeout
    this.timeout(4000);
  });
});

describe("calling worldLeaders.for country() ", function() {
  it("returns the US president as head of government and head of state", function (done) {
    worldLeaders.fromCountry('United States', function(anyErrors, usLeaders) {
      assert.equal(anyErrors, null);
      assert.equal(usLeaders.heads_of_state.length, 1);
      assert.equal(usLeaders.heads_of_state[0].title.name, "President");
      asset.deepEqual(usLeaders.heads_of_state, usLeaders.heads_of_government);
      done();
    });
    // change the timeout time here, too
    this.timeout(4000);
  });
});
```

When I ran ```npm test```, on the thing that I discovered was that I was getting "President President" as the title instead of
just "President". Not good!

```bash
1) calling worldLeaders.for country()  returns the US president as head of government and head of state:

      Uncaught AssertionError: 'President President' == 'President'
      + expected - actual

      -President President
      +President

      at test/test.js:30:14
```

This message tells me the test that failed, including what came out of the program, and what I expected.

After I wrote some code to fix this particular error, I can re-run ```npm test```

```bash
  calling worldLeaders.all()
    ✓ has one head of state and head of government for each country (2864ms)

  calling worldLeaders.for country()
    ✓ returns the US president as head of government and head of state (2024ms)

  2 passing (5s)
  ```
  
You should test your errors, too. My code sends back a "country not found" error if someone asks for a non-existent country. Here's
how you can test one:

```javascript
it("returns an error when requesting a fake country", function (done) {
  worldLeaders.fromCountry('Narnia', function(anyErrors, narniaLeaders) {
    assert.equal(anyErrors, "country not found");
    assert.equal(narniaLeaders, null);
    done();
  });
  this.timeout(4000);
});
```

### Including your package in a server

There are several different web frameworks and servers in the NodeJS world, and they can all use your module. I'm going
to create a simple example using the Express framework.	

Create another project folder where you are creating the server. Install only Express and your own package for now:

```bash
cd ..
mkdir my-first-server
cd my-first-server
npm install express MYPACKAGE
```

Your Express server will set up a website on http://localhost:8080/ When someone goes to that page, we should show them a JSON list of all world leaders,
and if someone goes to http://localhoat:8080/country/Albania they should see a list of Albanian leaders. Let's write app.js for that purpose:

```javascript
// load express and your own module
var express = require("express");
var worldLeaders = require("world-leaders");

// this is how we initialize an Express app
var app = express();

app.get("/", function (req, res) {
  // this is the homepage, where we return all world leaders
  // req is the initial request from the browser. We don't call it "request" because it'd be confused with the "request" module
  // res is the response. When you're finished getting callbacks and other data, use a response method to talk back to the browser
  
  worldLeaders.all(function (anyError, leaders) {
    if (anyError) {
      // don't throw errors anymore - you could crash the server! instead let the user know that they got an error
      res.json({ error: anyError });
    } else {
      // here we are sending back JSON data, so it's best to use res.json method
      res.json(leaders);
    }
  });
});

app.get("/country/:requestedCountry", function (req, res) {
  // this is the API page for any country
  // requestedCountry is available on req.params
  // if it were a URL like ?requestedState=NY , you would check req.query.requestedState
  // if it were a POST request, you'd need the body-parser module and req.body
  
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
```

Now run your server with ```node app.js``` and wait for confirmation that it's running.

That's all it takes. If you request http://localhost:8080 and http://localhost:8080/country/Albania they should work. If you try http://localhost:8080/country/Narnia
or another incorrect country name, look what comes back:

```javascript
{"error": "country not found"}
```

That's an error thrown by the world-leaders module! By writing a good module, you've made it really easy to deliver data to this server, without having to create new
errors or responses.
