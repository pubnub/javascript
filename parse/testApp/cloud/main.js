var errorsTest = require('cloud/tests/errorsTest');

Parse.Cloud.define("testErrors", function (request, response) {
    errorsTest.run(response.success, response.error);
});
