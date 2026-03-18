function tryParseJson(value) {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function fieldValue(frame, name) {
  if (!frame || !Array.isArray(frame.fields)) {
    return undefined;
  }

  var field = frame.fields.find(function (item) {
    return item && item.name === name;
  });

  return field && Array.isArray(field.values) ? tryParseJson(field.values[0]) : undefined;
}

function extractTopology(input) {
  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    for (var i = 0; i < input.length; i += 1) {
      var nested = extractTopology(input[i]);
      if (nested) {
        return nested;
      }
    }

    return null;
  }

  if (Array.isArray(input.nodes)) {
    return input;
  }

  if (Array.isArray(input.fields)) {
    var nodes = fieldValue(input, 'nodes');
    var links = fieldValue(input, 'links');
    var categories = fieldValue(input, 'categories');

    if (Array.isArray(nodes)) {
      return {
        nodes: nodes,
        links: Array.isArray(links) ? links : [],
        categories: Array.isArray(categories) ? categories : [],
      };
    }

    if (input.fields[0] && Array.isArray(input.fields[0].values) && input.fields[0].values.length > 0) {
      return extractTopology(tryParseJson(input.fields[0].values[0]));
    }
  }

  if (input.data) {
    return extractTopology(input.data);
  }

  return null;
}

var topology = extractTopology(frames);

if (!topology || !Array.isArray(topology.nodes)) {
  return frames;
}

return [
  {
    name: 'SFC Topology',
    fields: [
      { name: 'nodes', type: 'other', config: {}, values: [topology.nodes] },
      { name: 'links', type: 'other', config: {}, values: [Array.isArray(topology.links) ? topology.links : []] },
      { name: 'categories', type: 'other', config: {}, values: [Array.isArray(topology.categories) ? topology.categories : []] },
    ],
    length: 1,
  },
];