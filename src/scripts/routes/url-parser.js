function extractPathnameSegments(path) {
  const urlParts = path.split('?');
  const pathOnly = urlParts[0];
  const queryString = urlParts[1];

  const splitUrl = pathOnly.split('/');

  const queryParams = {};
  if (queryString) {
    const params = new URLSearchParams(queryString);
    for (const [key, value] of params.entries()) {
      queryParams[key] = value;
    }
  }

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
    query: queryParams,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';
  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }
  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }
  return pathname || '/';
}

function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

function parseActiveUrlWithCombiner() {
  const activePath = getActivePathname();
  const segments = extractPathnameSegments(activePath);
  return segments;
}

export {
  getActiveRoute,
  getActivePathname,
  parseActiveUrlWithCombiner,
};
