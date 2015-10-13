// real JavaScript, not pseudocode anymore
// versions/1.js

// load the module that I installed
var request = require('request');

// request is a function that I can use like this:

request("https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government", function (anyError, server_response, body) {
  // when you're done getting the page, this gets called

  if (anyError) {
    // let's go ahead and crash the script if there is an error
    throw anyError;
  } else {
    // console.log will output to the command line
    console.log(body);
  }
});
