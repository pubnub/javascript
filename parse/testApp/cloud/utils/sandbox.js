/**
 * Sinon.js && Parse.com compatible sandbox and stub implementation
 * @type {{create: function}}
 */
var sandbox = {
    create: function () {
        return new Sandbox();
    }
};

function Sandbox() {
    this.stubs = {};
}

/**
 * Stub method, compatible with Parse.com environment
 *
 * @param object
 * @param method
 * @param func
 * @param key
 */
Sandbox.prototype.stub = function stub(object, method, func, key) {
    if (typeof method !== 'string') {
        throw Error("#stub() 'method' argument should be a string");
    }

    if (!(method in object || typeof object[method] !== 'function')) {
        throw Error('Stubbing element is not a function');
    }

    if (!key) {
        key = uuid();
    }

    this.stubs[key] = new Stub(object, method, object[method]);

    object[method] = func;
};

Sandbox.prototype.restore = function restore() {
    var keys = Object.keys(this.stubs),
        length = keys.length,
        i;

    for (i = 0; i < length; i++) {
        this.stubs[keys[i]].restore();
    }
};

Sandbox.prototype.invokeOriginal = function (key, args) {
    return this.stubs[key].invokeOriginal(args);
};

function Stub(object, method, func) {
    this.object = object;
    this.method = method;
    this.func = func;
}

Stub.prototype.restore = function () {
    return this.object[this.method] = this.func;
};

Stub.prototype.invokeOriginal = function (args) {
    return this.func.apply(this.object, args)
};

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

module.exports = sandbox;
