var Vegas = {};

// Model
Vegas.Model = (function() {
  function VegasModel(url, attributes) {
    if (url) {
      this.url = url;
      this.attributes = attributes || {} ;
    } else {
      throw "Model must have an url";
    }
  };

  VegasModel.prototype.destroy = function() {
    delete localStorage[this.url + "<" + this.get("id") + ">"];
    return this;
  };

  VegasModel.prototype.fetch = function() {
    if (this.get("id")) {
      this.set(localStorage.getObject(this.url + "<" + this.get("id") + ">"));
      return this;
    } else {
      throw "Impossible to fetch model with no id";
    }
  };

  VegasModel.prototype.get = function(attr) {
    return this.attributes[attr];
  };

  VegasModel.prototype.getObject = function(key) {
    var value = localStorage.getItem(key);
    return value && JSON.parse(value);
  };

  VegasModel.prototype.isNew = function() {
    return this.get("id") === undefined || this.id === null
  };

  VegasModel.prototype.save = function(attributes) {
    if (this.isNew()) this.set("id", generateId.call(this));
    localStorage.setObject(this.url + "<" + this.get("id") + ">", this.attributes);
    return true;
  };

  VegasModel.prototype.set = function() {
    if (arguments.length === 1 && arguments[0] instanceof Object) {
      attributes = arguments[0];
      for (var key in attributes) {
        this.attributes[key] = attributes[key];
      }
    } else if (arguments.length === 2 && typeof arguments[0] === "string") {
      var key   = arguments[0];
      var value = arguments[1];
      this.attributes[key] = value;
    } else {
      throw "Impossible to set attributes: invalid arguments"
    }
    return this;
  };

  VegasModel.prototype.setObject = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Private
  function generateId() {
    var count = localStorage.getItem(this.url + "Count");
    if (!count || isNaN(parseFloat(count)) || !isFinite(count) ) {
      localStorage.setItem(this.url + "Count", 0);
    }

    var i = parseInt(localStorage.getItem(this.url + "Count"));
    localStorage.setItem(this.url + "Count", i+1);

    return localStorage.getItem(this.url + "Count");
  }

  return VegasModel;
})();

// Collection
Vegas.Collection = (function() {
  function VegasCollection(options) {
    if (options && options.url) {
      this.url = options.url;
      this.models = [];

      // pre-populates Collection with array of models
      // received in arguments (optional)
      if (options.models && options.models.length > 0) {
        var _models = options.models;
        var _len = _models.length;
        for (var i = 0; i < _len; i++) {
          var _model = _models[i];

          // Before pushing it to this Collection's array of models,
          // converts model object into Vegas.Model instance
          if (!(_model instanceof Vegas.Model)) {
            if (_model instanceof Object) {
              _model = new Vegas.Model(this.url, _model);
            } else {
              throw "Cannot instantiate model in collection: invalid model";
            }
          }
          this.models.push(_model);
        }
      }
      return this;
    } else {
      throw "Collection must have an url";
    }
  };

  VegasCollection.prototype.fetch = function(options) {
    if (options && options.reset) this.models = [];
    for (var key in localStorage) {
      var criteria = new RegExp(this.url + "<\\d+>")
      if (key.match(criteria)) {
        var attributes = localStorage.getObject(key);
        var model = new Vegas.Model(this.url, attributes);
        this.models.push(model);
      };
    }
    return this;
  };

  return VegasCollection;
})();
