const iso6391to6393 = {};

for (const [iso6393tag, iso6391tag] of Object.entries(require("iso-639-3/to-1.json"))) {
  iso6391to6393[iso6391tag] = iso6393tag;
}

module.exports = {
  iso6391to6393,
};
