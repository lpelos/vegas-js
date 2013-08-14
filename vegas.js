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
      } else {
        this.attributes = {};
        this.url = "";
      }
    };

    // Instance Methods
    VegasModel.prototype.destroy = function() {
      if (!this.url) throw "Cannot destroy model with no url";

      delete localStorage[this.url + "<" + this.get("id") + ">"];
      return this;
    };

    VegasModel.prototype.extend = extendVegasModel;

    VegasModel.prototype.fetch = function() {
      if (!this.url) throw "Cannot fetch model with no url";

      if (this.get("id")) {
        this.set(this.getObject(this.url + "<" + this.get("id") + ">"));
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
      if (!this.url) throw "Cannot save model with no url";

      if (this.isNew()) this.set("id", generateId.call(this));
      this.setObject(this.url + "<" + this.get("id") + ">", this.attributes);
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

    // Class methods
    VegasModel.extend = extendVegasModel;

    // Private
    function extendVegasModel(customProperties) {
      if (customProperties) {
        if (!(customProperties instanceof Object))
          throw "Cannot extend VegasModel: invalid arguments";

        // isolating url from customProperties, if given
        var url = customProperties.url || null;
        delete customProperties.url;

        // isolating initializer, if given
        var initializer = customProperties.initialize || null;

        // isolating methods from customProperties, if any
        var methods = {};
        for (var key in customProperties) {
          var property = customProperties[key];

          if (typeof property == "function") {
            methods[key] = property;
            delete property;
          }
        }
      }

      // Custom VegasModel constructor
      VegasModel = function() {
        ParentModel.call(this, customProperties);
        if (initializer) initializer.call(this, arguments);
      };

      // Inherit from ParentModel
      var ParentModel = this;
      for (var key in ParentModel) {
        if (ParentModel.hasOwnProperty(key))
          VegasModel[key] = ParentModel[key];
      }
      var ctor = function() { this.constructor = VegasModel; }
      ctor.prototype = ParentModel.prototype;
      VegasModel.prototype = new ctor;
      VegasModel.prototype.constructor = VegasModel;
      VegasModel.prototype.__super__ = ParentModel.prototype;

      // applying saved url, if exists
      if (url) VegasModel.prototype.url = url;

      // applying saved methods, if any
      for (var key in methods) {
        VegasModel.prototype[key] = methods[key];
      }

      return VegasModel;
    };

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
          var attributes = Vegas.Model.getObject(key);
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

