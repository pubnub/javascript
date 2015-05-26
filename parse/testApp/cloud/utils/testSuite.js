var Test = require("cloud/utils/test");

function TestSuite(name) {
    this.name = name;
    this.beforeFunc = function () {};
    this.afterFunc = function () {};
    this.beforeEachFunc = function () {};
    this.afterEachFunc = function () {};
    this.tests = [];
    this.onlyFlag = false;
    this.config = null;
}

TestSuite.prototype.before = function (func) {
    this.beforeFunc = func;
};

TestSuite.prototype.beforeEach = function (func) {
    this.beforeEachFunc = func;
};

TestSuite.prototype.afterEach = function (func) {
    this.afterEachFunc = func;
};

TestSuite.prototype.it = function (name, func) {
    if (this.onlyFlag) return;

    this.tests.push(new Test(this.name + " " + name + ".", func));
};

TestSuite.prototype.xit = function () {};

TestSuite.prototype.only = function (name, func) {
    this.tests = [];
    this.onlyFlag = true;
    this.tests.push(new Test(this.name + " " + name + ".", func));
};

TestSuite.prototype.run = function (success, error) {
    var results = [],
        _this = this,
        i = 0,
        currentTest;

    Parse.Config.get().then(function (config) {
        _this.config = config;
        _this.beforeFunc();

        function runNextTest() {
            currentTest = _this.tests[i];

            if (currentTest instanceof Test) {
                _this.beforeEachFunc();
                currentTest.run(function (result) {
                    results.push(result);
                    _this.afterEachFunc();
                    i++;
                    runNextTest();
                })
            } else {
                _this.afterFunc();
                success({
                    name: _this.name,
                    payload: results
                });
            }
        }

        runNextTest();
    });
};

module.exports = TestSuite;
