export function setUrlParam(key, val) {
  const url = toInternalUrl(document.URL);
  if (val !== undefined) {
    url.searchParams.set(key, val);
  } else {
    url.searchParams.delete(key);
  }
  const externalUrlStr = toExternalUrlStr(url);
  window.location.hash = externalUrlStr.includes('#') ? externalUrlStr.split('#')[1] : '';
}

export function toInternalUrl(externalUrlStr) {
  return new URL(externalUrlStr.replace('#','?'));
}

export function toExternalUrlStr(internalUrl) {
  internalUrl.searchParams.sort();
  return internalUrl.href.replace('?','#');
}

export function getUrlParamsMap() {
  const url = toInternalUrl(document.URL);
  const keyVals = new Map();
  url.searchParams.forEach(function(value, key) {
    keyVals.set(key, value);
  });
  return keyVals;
}