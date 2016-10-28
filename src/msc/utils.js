const parseQuery = (rawQuery) => {
  const query = {
    limit: 100,
    sort: null
  };

  if (typeof rawQuery.limit !== "undefined") {
    query.limit = parseInt(rawQuery.limit) < 0 ? null : parseInt(rawQuery.limit); // limit is null if negative limit specified
  }

  if (typeof rawQuery.sort !== "undefined") {
    query.sort = [];
    const sortings = Array.isArray(rawQuery.sort) ? rawQuery.sort.slice(0) : [rawQuery.sort];
    sortings.forEach(sorting => {
      const order = sorting.startsWith('-') ? -1 : 1;
      const collection = order === -1 ? sorting.substr(1) : sorting;
      query.sort.push([collection, order]);
    });
  }

  return query;
}

module.exports = {
  parseQuery
};
