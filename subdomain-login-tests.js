// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by subdomain-login.js.
import { name as packageName } from "meteor/juliusarden:subdomain-login";

// Write your tests here!
// Here is an example.
Tinytest.add('subdomain-login - example', function (test) {
  test.equal(packageName, "subdomain-login");
});
