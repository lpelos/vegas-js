var Vegas = (function() {

  var Vegas = {};

  // Model
  Vegas.Model = (function() {
    function VegasModel(properties) {
      if (properties && properties instanceof Object) {

        // setting Model url: localHost access key
        if (properties.url && typeof properties.url == "string") {
          this.url = properties.url;
          delete properties.url;
        }

        this.attributes = properties;
      }

      if (!this.attributes) this.attributes = {};
      if (!this.url) this.url = "";

      return this;
    };

    // Instance Methods
    VegasModel.prototype.destroy = function() {
      if (!this.url) throw "Cannot destroy model with no url";
      if (this.isNew()) throw "Cannot destroy model with no id";
      delete localStorage[this.url + "<" + this.get("id") + ">"];
      return this;
    };

    VegasModel.prototype.fetch = function() {
      if (!this.url) throw "Cannot fetch model with no url";

      if (this.get("id")) {
        var attributes = __getObject(this.url + "<" + this.get("id") + ">");
        if (attributes) {
          this.set(attributes);
          return this;
        } else {
          return attributes;
        }
      } else {
        throw "Impossible to fetch model with no id";
      }
    };

    VegasModel.prototype.get = function(attr) {
      return this.attributes[attr];
    };

    VegasModel.prototype.isNew = function() {
      return this.get("id") === undefined;
    };

    VegasModel.prototype.save = function() {
      if (!this.url) throw "Cannot save model with no url";

      if (this.isNew()) this.set("id", __generateId.call(this));
      __setObject(this.url + "<" + this.get("id") + ">", this.attributes);
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

    // Class methods
    VegasModel.extend = function(properties) {
      if (properties) {
        if (!(properties instanceof Object))
          throw "Cannot extend VegasModel: invalid arguments. Argument should be an object";

        // isolating initializer, if given
        var initializer = properties.initialize || null;
        var customProperties = properties;
      }

      // Custom VegasModel class
      var CustomModel = (function(_super, initializer) {
        __inherit(VegasModel, _super);

        function VegasModel() {
          VegasModel.__super__.constructor.apply(this, arguments);
          if (initializer) initializer.apply(this, arguments);
        }

        return VegasModel;

      })(VegasModel, initializer);

      // applying saved customProperties, if any
      for (var key in customProperties) {
        CustomModel.prototype[key] = customProperties[key];
      }

      return CustomModel;
    };

    // private methods
    function __generateId() {
      var count = localStorage.getItem(this.url + "Count");
      if (!count || isNaN(parseFloat(count)) || !isFinite(count) ) {
        localStorage.setItem(this.url + "Count", 0);
      }

      var i = parseInt(localStorage.getItem(this.url + "Count"));
      localStorage.setItem(this.url + "Count", i+1);

      return localStorage.getItem(this.url + "Count");
    };

    function __getObject(key) {
      var value = localStorage.getItem(key);
      return value && JSON.parse(value);
    };

    function __inherit(child, parent) {
      for (var key in parent) {
        if (parent.hasOwnProperty(key)) child[key] = parent[key];
      }

      function ctor() { this.constructor = child;}
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };

    function __setObject(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    };

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
              _model = new Vegas.Model(_model);
              _model.url = this.url;
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
          var attributes = Vegas.Model.__getObject(key);
          var model = new Vegas.Model(attributes);
          this.models.push(model);
        };
      }
      return this;
    };

    return VegasCollection;
  })();

  return Vegas
})();

