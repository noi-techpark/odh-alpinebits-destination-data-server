
module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));

  let target = {
    '@type':  'EventSeries',
    id: source.id ? source.id : '',
    name: source.name ? source.name: {},
    abstract: source.abstract ? source.abstract: {},
    description: source.description ? source.description: {},
    url: source.url ? source.url: {},
    multimediaDescriptions: source.multimediaDescriptions ? source.multimediaDescriptions: [],
    frequency: source.frequency ? source.frequency: '',
  };

  return target;
}
