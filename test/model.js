describe("VegasModel", function() {

  describe("constructor", function() {

    context("when no params are given", function() {
      var model = new Vegas.Model;

      describe("#url", function() {
        it("exists", function() {
          expect(model).to.have.property("url");
        });

        it("is an empty string", function() {
          expect(model.url).to.be("");
        });
      });

      describe("#attributes", function () {
        it("exist", function() {
          expect(model).to.have.property("attributes");
        });

        var attributes = model.attributes;

        it("is an object", function() {
          expect(typeof attributes).to.be("object");
        });

        it("is empty", function() {
          expect(attributes).to.be.empty();
        });
      });
    });

    context("when an invalid parameters are given", function() {
      var model = new Vegas.Model("invalid argument");

      describe("#url", function() {
        it("exists", function() {
          expect(model).to.have.property("url");
        });

        it("is an empty string", function() {
          expect(model.url).to.be("");
        });
      });

      describe("#attributes", function () {
        it("exist", function() {
          expect(model).to.have.property("attributes");
        });

        var attributes = model.attributes;

        it("is an object", function() {
          expect(typeof attributes).to.be("object");
        });

        it("is empty", function() {
          expect(attributes).to.be.empty();
        });
      });
    });

    context("when valid parameters are given", function() {
      var model = new Vegas.Model({
        url: "my/url",
        name: "some name",
        address: "some address"
      });

      describe("#url", function() {
        it("is equal to given url", function() {
          expect(model.url).to.be("my/url");
        })
      });

      describe("#attributes", function() {
        var attributes = model.attributes;

        it("does not contain an url attributes", function() {
          expect(attributes).to.not.have.property("url");
        });

        it("contain all and only the other given keys", function() {
          expect(attributes).to.only.have.keys("name", "address");
        });
      });
    });
  });

  describe("#get", function() {
    var model = new Vegas.Model({ a: 1, b: 2 });

    context("with no params", function() {
      it("returns undefined", function() {
        expect(model.get()).to.be(undefined);
      });
    });

    context("with an invalid key", function() {
      it("returns undefined", function() {
        expect(model.get({a: 1}, function(){})).to.be(undefined);
      });
    });

    context("with a non existent attribute key", function() {
      it("returns undefined", function() {
        expect(model.get("c")).to.be(undefined);
      });
    });

    context("with an existent attributes", function() {
      it("returns the value of the attributes key with the given name", function() {
        expect(model.get("a")).to.be(1);
      });
    });
  });

  describe("#set", function() {
    var model = new Vegas.Model({a: 1, b: 2});

    context("with no arguments", function() {
      it("raises an exception", function() {
        expect(model.set).to.throwException();
      });
    });

    context("with 1 argument", function() {
      context("when the argument is not an object", function() {
        it("raises an exception", function() {
          expect(model.set).withArgs("invalid args").to.throwException();
        });
      });

      context("when the argument is object", function() {
        model.set({c: 3});

        it("merges the given object with in the model attributes", function() {
          expect(model.get("c")).to.be(3);
        });

        it("keeps the old attributes", function() {
          expect(model.get("a")).to.be(1);
          expect(model.get("b")).to.be(2);
        });
      });
    });

    context("with 2 arguments", function() {
      context("when first argument is not a string", function() {
        it("raises an exception", function() {
          expect(model.set).withArgs(1, "argument").to.throwException();
        });
      });

      context("when first argument is a string", function() {
        model.set("attr", 1);

        it("sets the second argument as the value of a attribute which key equals the first argument", function() {
          expect(model.get("attr")).to.be(1);
        });
      });
    });

    context("with more than 2 arguments", function() {
      it("raises an exception", function() {
        expect(model.set).withArgs("1", 2, 5).to.throwException();
      });
    });
  });

  describe("#isNew", function() {
    context("when the model has no id", function() {
      var model = new Vegas.Model;
      it("returns true", function() {
        expect(model.isNew()).to.be(true);
      });
    });

    context("when the model has an id", function() {
      var model = new Vegas.Model({"id": 1});

      it("returns false", function() {
        expect(model.isNew()).to.be(false);
      });
    });
  });

  describe.only("#fetch", function() {

    context("when model has no url", function() {
      var model = new Vegas.Model({name: "name", address: "address"});
      
      it("raises an exception", function() {
        expect(model.fetch).to.throwException();
      });
    });

    context("when model has an URL", function() {
      var model;
      beforeEach(function() {
        model = new Vegas.Model({
          url: "models",
          name: "name",
          address: "address"
        });
      })

      context("when model has no id", function() {
        it("raises an exception", function() {
          expect(model.fetch).to.throwException();
        });
      });

      context("when there's no object correspondent to the model's id inside localStorage", function() {
        beforeEach(function() {
          model.set("id", 1);
        });

        it("returns null", function() {
          expect(model.fetch()).to.be(null);
        });

        it("does not modify the model attributes", function() {
          var originalAttr = cloneObj(model.attributes);
          model.fetch();
          expect(model.attributes).to.eql(originalAttr);
        });
      });

      context("when the object correspondent to the model's id exists", function() {
        beforeEach(function() {
          model.set("id", 42);
        });

        it("returns the model", function() {
          expect(model.fetch()).to.eql(model);
        });

        it("merges the localStorage object with the models current params", function() {
          localStorage.setItem("models<42>", '{"name":"Lucas"}');
          model.fetch();

          expect(model.attributes).to.eql({
            id: 42,
            name: "Lucas",
            address: "address"
          });
        });
      });

    });

  });

function cloneObj(originalObj) {
  var obj = {};
  for (var key in originalObj) {
    obj[key] = originalObj[key];
  }
  return obj;
}

});
