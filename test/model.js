describe("Model", function() {

  describe("constructor", function() {

    context("when no params are given", function() {
      var model = new Vegas.Model();

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

});
