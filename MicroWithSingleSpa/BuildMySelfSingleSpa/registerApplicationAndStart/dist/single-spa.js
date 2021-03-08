(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var NOT_LOADED = 'NOT_LOADED';
  var LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE';
  var LOAD_ERR = 'LOAD_ERR';
  var SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';
  var NOT_BOOTSTRAPED = 'NOT_BOOTSTRAPED';
  var BOOTSTRAPING = 'BOOTSTRAPING';
  var NOT_MOUNTED = 'NOT_MOUNTED';
  var MOUNTING = 'MOUNTING';
  var MOUNTED = 'MOUNTED';
  var UNMOUNTING = 'UNMOUNTING';

  var started = false;
  var start = function start() {
    started = true;
    reroute();
  };

  var flattenFnArray = function flattenFnArray(fns) {
    fns = Array.isArray(fns) ? fns : [fns];
    return function () {
      return fns.reduce(function (p, fn) {
        return p.then(fn);
      }, Promise.resolve());
    };
  };
  var toLoadPromise = function toLoadPromise(app) {
    app.status = LOADING_SOURCE_CODE;
    var loadPromise = app.loadApp();
    return loadPromise.then(function (module) {
      app.bootstrap = flattenFnArray(module.bootstrap);
      app.mount = flattenFnArray(module.mount);
      app.unmount = flattenFnArray(module.unmount);
      app.status = NOT_BOOTSTRAPED;
      return app;
    }).catch(function (e) {
      app.status = LOAD_ERR;
    });
  };

  var toUnMountPromise = function toUnMountPromise(app) {
    return new Promise(function (resolve) {
      app.status = UNMOUNTING;
      app.unmount().then(function () {
        app.status = NOT_LOADED;
        resolve();
      });
    });
  };

  var toMountPromise = function toMountPromise(app) {
    return new Promise(function (resolve) {
      app.status = MOUNTING;
      app.mount().then(function () {
        app.status = MOUNTED;
        resolve();
      });
    });
  };

  var toBootstrapPromise = function toBootstrapPromise(app) {
    return new Promise(function (resolve) {
      app.status = BOOTSTRAPING;
      app.bootstrap().then(function () {
        app.status = NOT_MOUNTED;
        resolve();
      });
    });
  };

  var reroute = function reroute() {
    var _getAppChanges = getAppChanges(),
        appsToLoad = _getAppChanges.appsToLoad,
        appsToUnMount = _getAppChanges.appsToUnMount,
        appsToMount = _getAppChanges.appsToMount;

    if (started) {
      console.log(appsToLoad, appsToUnMount, appsToMount);
      performAppChanges();
    } else {
      loadApps();
    }

    function loadApps() {
      var loadPromises = appsToLoad.map(toLoadPromise);
      Promise.all(loadPromises).then(function () {// callAllEventListeners();
      });
    }

    function performAppChanges() {
      var ummountPromises = appsToUnMount.map(toUnMountPromise);
      appsToLoad.map(function (app) {
        toLoadPromise(app).then(function (app) {
          toBootstrapPromise(app).then(function () {
            Promise.all(ummountPromises).then(function () {
              toMountPromise(app);
            });
          });
        });
      });
    }
  };

  var apps = [];

  function shouldBeActive(app) {
    return app.activeWhen(location);
  }

  var getAppChanges = function getAppChanges() {
    var appsToLoad = [],
        appsToMount = [],
        appsToUnMount = [];
    apps.forEach(function (app) {
      var appShouldBeActive = app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);

      switch (app.status) {
        case NOT_LOADED:
        case LOADING_SOURCE_CODE:
          appShouldBeActive && appsToLoad.push(app);
          break;

        case NOT_BOOTSTRAPED:
        case BOOTSTRAPING:
        case NOT_MOUNTED:
          appShouldBeActive && appsToMount.push(app);
          break;

        case MOUNTED:
          !appShouldBeActive && appsToUnMount.push(app);
          break;
      }
    });
    return {
      appsToLoad: appsToLoad,
      appsToMount: appsToMount,
      appsToUnMount: appsToUnMount
    };
  };
  var registerApplication = function registerApplication(appName, loadApp, activeWhen, customProp) {
    if (_typeof(appName) === 'object') {
      apps.push(_objectSpread2(_objectSpread2({}, appName), {}, {
        status: NOT_LOADED
      }));
    } else {
      apps.push({
        appName: appName,
        loadApp: loadApp,
        activeWhen: activeWhen,
        customProp: customProp,
        status: NOT_LOADED
      });
    }

    reroute();
  };

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
