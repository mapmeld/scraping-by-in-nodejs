var assert = require('assert');
var worldLeaders = require('../index.js');

describe("calling worldLeaders.all() ", function() {
  it("has one head of state and head of government for each country", function (done) {
    worldLeaders.all(function(anyErrors, leaders) {
      assert.equal(anyErrors, null);
      // go through the list of countries and find any obvious missing people
      for (var i = 0; i < leaders.length; i++) {
        if (!leaders[i].heads_of_government || !leaders[i].heads_of_government.length) {
          console.log(leaders[i]);
        }
        assert.notEqual(leaders[i].heads_of_state, null);
        assert.notEqual(leaders[i].heads_of_state.length, 0);
        assert.notEqual(leaders[i].heads_of_government, null);
        assert.notEqual(leaders[i].heads_of_government.length, 0);
      }
      done();
    });
    this.timeout(4000);
  });
});

describe("calling worldLeaders.for country() ", function() {
  it("returns the US president as head of government and head of state", function (done) {
    worldLeaders.fromCountry('United States', function(anyErrors, usLeaders) {
      assert.equal(anyErrors, null);
      assert.equal(usLeaders.heads_of_state.length, 1);
      assert.equal(usLeaders.heads_of_state[0].title.name, "President");
      assert.deepEqual(usLeaders.heads_of_state, usLeaders.heads_of_government);
      done();
    });
    this.timeout(4000);
  });
  
  it("returns an error when requesting a fake country", function (done) {
    worldLeaders.fromCountry('Narnia', function(anyErrors, narniaLeaders) {
      assert.equal(anyErrors, "country not found");
      assert.equal(narniaLeaders, null);
      done();
    });
    this.timeout(4000);
  });
});