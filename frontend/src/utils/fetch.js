exports.getQueryParamsUrl = function getQueryParamsUrl(url, params) {
    const paramKeys= Object.keys(params);
    if (!params || paramKeys.length === 0) {
        return url;
    }
    else {
      const queryParams = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      return url + '?' + queryParams;
    }
};
