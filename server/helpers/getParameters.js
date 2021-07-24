var getParameters = (url) => {
  var parameters = {};

  // extract parameters from query
  var indexOfParams = url.indexOf('?') + 1;
  var params = url.slice(indexOfParams);
  params = params.split('&');

  for (var i = 0; i < params.length; i++) {
    if (params[i].indexOf('product_id=') !== -1) {
      var product_id = Number(params[i].slice(11));
      parameters.product_id = product_id;
    } else if (params[i].indexOf('page=') !== -1) {
      var page = Number(params[i].slice(5));
    } else if (params[i].indexOf('count=') !== -1) {
      var count = Number(params[i].slice(6));
    } else if (params[i].indexOf('question_id=') !== -1) {
      var question_id = Number(params[i].slice(12));
      parameters.question_id = question_id;
    }
  }

  // set default values for page and count if not defined in query
  var page = page === undefined ? 1 : page;
  var count = count === undefined ? 5 : count;
  var startNumber = (page - 1) * count;

  parameters.page = page;
  parameters.count = count;
  parameters.startNumber = startNumber;

  return parameters;
}

module.exports = getParameters;