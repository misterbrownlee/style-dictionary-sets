const StyleDictionary = require("style-dictionary");
const CSSSetsFormatter = require("../index").CSSSetsFormatter;
const NameKebabTransfom = require("../index").NameKebabTransfom;
const AttributeSetsTransform = require("../index").AttributeSetsTransform;
const helpers = require("./helpers");

const fs = require("fs");
const path = require("path");

StyleDictionary.registerTransform(NameKebabTransfom);
StyleDictionary.registerTransform(AttributeSetsTransform);
StyleDictionary.registerFormat(CSSSetsFormatter);

const generateConfig = (filename) => {
  return {
    source: [`tests/fixtures/${filename}.json`],
    platforms: {
      CSS: {
        buildPath: helpers.outputDir,
        transforms: [AttributeSetsTransform.name, NameKebabTransfom.name],
        files: [
          {
            destination: `${filename}.css`,
            format: CSSSetsFormatter.name,
            filter: (token) => {
              return (
                typeof token.attributes === "object" &&
                !Array.isArray(token.attributes) &&
                token.attributes !== null &&
                "sets" in token.attributes &&
                token.attributes.sets.every((element) => {
                  return ["desktop", "spectrum", "dark"].includes(element);
                })
              );
            },
            options: {
              showFileHeader: false,
              outputReferences: true,
              sets: ["desktop", "spectrum", "dark"],
            },
          },
        ],
      },
    },
  };
};

beforeEach(() => {
  helpers.clearOutput();
});

afterEach(() => {
  // helpers.clearOutput();
});

test("basic data with sets keyword in path should provide basic css", () => {
  const filename = "basic";
  const sd = StyleDictionary.extend(generateConfig(filename));
  sd.buildAllPlatforms();
  const result = fs.readFileSync(
    path.join(helpers.outputDir, `${filename}.css`),
    {
      encoding: "utf8",
    }
  );
  const expected = fs.readFileSync(`./tests/expected/${filename}.css`, {
    encoding: "utf8",
  });
  expect(result).toEqual(expected);
});

test("should handle multi nested reference css", () => {
  const filename = "multi-depth";
  const sd = StyleDictionary.extend(generateConfig(filename));
  sd.buildAllPlatforms();
  const result = fs.readFileSync(
    path.join(helpers.outputDir, `${filename}.css`),
    {
      encoding: "utf8",
    }
  );
  const expected = fs.readFileSync(`./tests/expected/${filename}.css`, {
    encoding: "utf8",
  });
  expect(result).toEqual(expected);
});

test("should work with nested sets", () => {
  const filename = "nest-sets-no-refs";
  const sd = StyleDictionary.extend(generateConfig(filename));
  sd.buildAllPlatforms();
  const result = fs.readFileSync(
    path.join(helpers.outputDir, `${filename}.css`),
    {
      encoding: "utf8",
    }
  );
  const expected = fs.readFileSync(`./tests/expected/${filename}.css`, {
    encoding: "utf8",
  });
  expect(result).toEqual(expected);
});

test("tokens without sets should still have names", () => {
  const filename = "multi-ref";
  const config = generateConfig(filename);
  config.platforms.CSS.files[0].filter = (token) => {
    return !("sets" in token.attributes);
  };
  delete config.platforms.CSS.files[0].options.sets;
  const sd = StyleDictionary.extend(config);
  sd.buildAllPlatforms();
  const result = fs.readFileSync(
    path.join(helpers.outputDir, `${filename}.css`),
    {
      encoding: "utf8",
    }
  );
  const expected = fs.readFileSync(`./tests/expected/${filename}.css`, {
    encoding: "utf8",
  });
  expect(result).toEqual(expected);
});

test("prefix option should be added to var name", () => {
  const filename = "multi-depth";
  const config = generateConfig(filename);
  config.platforms.CSS.prefix = 'aprefix';
  const sd = StyleDictionary.extend(config);
  sd.buildAllPlatforms();
  const result = fs.readFileSync(
    path.join(helpers.outputDir, `${filename}.css`),
    {
      encoding: "utf8",
    }
  );
  const expected = fs.readFileSync(`./tests/expected/${filename}-prefix.css`, {
    encoding: "utf8",
  });
  expect(result).toEqual(expected);
});

test("selector option should set rule selector", () => {
  const filename = "multi-depth";
  const config = generateConfig(filename);
  config.platforms.CSS.files[0].options.selector = '.aselector';
  const sd = StyleDictionary.extend(config);
  sd.buildAllPlatforms();
  const result = fs.readFileSync(
    path.join(helpers.outputDir, `${filename}.css`),
    {
      encoding: "utf8",
    }
  );
  const expected = fs.readFileSync(`./tests/expected/${filename}-selector.css`, {
    encoding: "utf8",
  });
  expect(result).toEqual(expected);
});
