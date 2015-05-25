var tests = ['errors', 'ssl', 'pam'],
    length = tests.length,
    current,
    i;

for (i = 0; i < length; i++) {
    (function (current) {
        Parse.Cloud.define(current + "Test", function (request, response) {
            require('cloud/tests/' + current + 'Test').run(response.success, response.error);
        });
    })(tests[i]);
}