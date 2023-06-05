// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const _ = require("lodash");
const objectPath = require("object-path");
const categoriesData = require("./../../../data/categories.data");
const errors = require("./../../errors");
const iso6393to6391 = require("iso-639-3/to-1.json");

function transformGetCollectionRequest(request, extractQueryFunctions) {
  const queries = [];
  const { id } = request.params;

  if (!id && Array.isArray(extractQueryFunctions)) {
    extractQueryFunctions.forEach((extractFunction) => extractFunction(queries, request));
  }

  return queries ? queries.join("&") : null;
}

function extractOdhPageSize(queriesArray, request) {
  const { page } = request.query;
  const pageSize = (page && page.size) || 10;
  if (pageSize) queriesArray.push(`pagesize=${pageSize}`);
}

function extractOdhPageNumber(queriesArray, request) {
  const { page } = request.query;
  const pageNumber = (page && page.number) || 1;
  if (pageNumber) queriesArray.push(`pagenumber=${pageNumber}`);
}

function extractEventSort(queriesArray, request) {
  const { sort, random } = request.query;
  let rawSort = [];

  if (random) {
    // Return to not apply default sorting
    // No need to throw error. Requests for both random and sort are already treated as syntactical errors
    return;
  }

  if (sort) {
    rawSort = sort.split(",").map((field) => {
      if (/^-?startDate$/.test(field)) {
        return field.replace("startDate", "DateBegin");
      } else if (/^-?endDate$/.test(field)) {
        return field.replace("endDate", "DateEnd");
      } else {
        errors.DestinationDataError.throwBadQueryError(
          `Sort query does not support the selected field: 'sort=${sort}'.`
        );
      }
    });
  }

  // queriesArray.push(`rawsort=${_.isEmpty(rawSort) ? "-DateBegin" : rawSort.join(",")}`);
  if (_.isEmpty(rawSort)) {
    queriesArray.push(`sort=desc`);
  } else {
    queriesArray.push(`rawsort=${rawSort.join(",")}`);
  }
}

function extractRandom(queriesArray, request) {
  const { random } = request.query;

  if (!random) {
    return;
  }

  const seed = Number(random);
  queriesArray.push(`seed=${seed}`);
}

function combineOrFilters(filters) {
  if (!Array.isArray(filters) || _.isEmpty(filters)) {
    return "";
  }
  if (filters.length === 1) {
    return filters[0];
  } else {
    return `or(${filters.filter((item) => !!item).join(",")})`;
  }
}

function combineAndFilters(filters) {
  if (!Array.isArray(filters) || _.isEmpty(filters)) {
    return "";
  }
  if (filters.length === 1) {
    return filters[0];
  } else {
    return `and(${filters.filter((item) => !!item).join(",")})`;
  }
}

function extractEventFilterCategoriesAll(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(Topics.[].TopicRID,"${id}")`);
  rawFilters.push(combineAndFilters(idFilters));
}

function extractEventFilterCategoriesAny(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(Topics.[].TopicRID,"${id}")`);
  rawFilters.push(combineOrFilters(idFilters));
}

function extractActivityFilterCategoriesAll(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(ODHTags.[].Id,"${id.toLowerCase()}")`);
  rawFilters.push(combineAndFilters(idFilters));
}

function extractActivityFilterCategoriesAny(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(ODHTags.[].Id,"${id}")`);
  rawFilters.push(combineOrFilters(idFilters));
}

function extractDateFilter(filterString, dateString, odhFieldName, operand, rawFilters) {
  if (isNaN(Date.parse(dateString))) {
    errors.DestinationDataError.throwBadQueryError(`Invalid date value: '${filterString}=${dateString}'`);
  }

  rawFilters.push(`${operand}(${odhFieldName},"${dateString}")`);
}

function extractLanguageFilter(filterString, languageTags, rawFilters) {
  if (typeof languageTags !== "string") {
    errors.DestinationDataError.throwBadQueryError(`Bad language filter`);
  }

  let hasLanguageFilters = languageTags.split(",").map((tag) => iso6393to6391[tag]);

  if (hasLanguageFilters.some((tag) => !tag)) {
    errors.DestinationDataError.throwBadQueryError(`Bad values in language filter: '${filterString}=${languageTags}'`);
  }

  hasLanguageFilters = hasLanguageFilters.map((tag) => `in(HasLanguage.[],"${tag}")`);
  rawFilters.push(combineOrFilters(hasLanguageFilters));
}

function extractLocationFilter(filterString, area, dedicatedFilters) {
  const [longitude, latitude, radius] = typeof area === "string" ? area.split(",") : [];

  if (isNaN(longitude) || isNaN(latitude) || isNaN(radius)) {
    errors.DestinationDataError.throwBadQueryError(
      `Bad area value (longitude, latitude, distance in meters): '${filterString}=${area}'`
    );
  }

  dedicatedFilters.push(`longitude=${longitude}&latitude=${latitude}&radius=${radius}`);
}

function extractEventOrganizerFilter(organizerId, rawFilters) {
  if (typeof organizerId !== "string" || organizerId.includes(",")) {
    errors.DestinationDataError.throwBadQueryError(`Bad query parameters: 'filter[organizers][eq]=${organizerId}'`);
  }

  rawFilters.push(`eq(OrgRID,"${organizerId}")`);
}

function extractEventFilter(queriesArray, request) {
  const { filter } = request.query;
  const rawFilters = [];
  const dedicatedFilters = [];
  const supportedFilters = [
    "lang",
    "categories",
    "lastUpdate",
    "startDate",
    "endDate",
    "organizers",
    "venues",
    "categories.all",
    "categories.any",
    "lastUpdate.gt",
    "lastUpdate.lt",
    "startDate.gt",
    "startDate.lt",
    "endDate.gt",
    "endDate.lt",
    "organizers.eq",
    "venues.near",
  ];

  if (filter) {
    Object.entries(filter).forEach(([filterName, value]) => {
      if (!supportedFilters.includes(filterName)) {
        errors.DestinationDataError.throwBadQueryError(`Filter not supported: 'filter[${filterName}]'`);
      }

      if (typeof value === "string") {
        return; // simple filter
      }

      if (Object.keys(value).every((operand) => !supportedFilters.includes(`${filterName}.${operand}`))) {
        errors.DestinationDataError.throwBadQueryError(`Filter not supported: 'filter[${filterName}]'`);
      }
    });

    if (objectPath.has(filter, "lang")) {
      const languageTags = objectPath.get(filter, "lang", "");
      extractLanguageFilter("filter[lang]", languageTags, rawFilters);
    }

    if (objectPath.has(filter, "categories.all")) {
      extractEventFilterCategoriesAll(objectPath.get(filter, "categories.all", ""), rawFilters);
    }

    if (objectPath.has(filter, "categories.any")) {
      extractEventFilterCategoriesAny(objectPath.get(filter, "categories.any", ""), rawFilters);
    }

    if (objectPath.has(filter, "lastUpdate.gt")) {
      const dateValue = objectPath.get(filter, "lastUpdate.gt", "");
      extractDateFilter("filter[lastUpdate][gt]", dateValue, "LastChange", "gt", rawFilters);
    }

    if (objectPath.has(filter, "lastUpdate.lt")) {
      const dateValue = objectPath.get(filter, "lastUpdate.lt", "");
      extractDateFilter("filter[lastUpdate][lt]", dateValue, "LastChange", "lt", rawFilters);
    }

    if (objectPath.has(filter, "startDate.gt")) {
      const dateValue = objectPath.get(filter, "startDate.gt", "");
      extractDateFilter("filter[startDate][gt]", dateValue, "DateBegin", "gt", rawFilters);
    }

    if (objectPath.has(filter, "startDate.lt")) {
      const dateValue = objectPath.get(filter, "startDate.lt", "");
      extractDateFilter("filter[startDate][lt]", dateValue, "DateBegin", "lt", rawFilters);
    }

    if (objectPath.has(filter, "endDate.gt")) {
      const dateValue = objectPath.get(filter, "endDate.gt", "");
      extractDateFilter("filter[endDate][gt]", dateValue, "DateEnd", "gt", rawFilters);
    }

    if (objectPath.has(filter, "endDate.lt")) {
      const dateValue = objectPath.get(filter, "endDate.lt", "");
      extractDateFilter("filter[endDate][lt]", dateValue, "DateEnd", "lt", rawFilters);
    }

    if (objectPath.has(filter, "venues.near")) {
      const areaValue = objectPath.get(filter, "venues.near", "");
      extractLocationFilter("filter[venues][near]", areaValue, dedicatedFilters);
    }

    if (objectPath.has(filter, "organizers.eq")) {
      const organizerId = objectPath.get(filter, "organizers.eq", "");
      extractEventOrganizerFilter(organizerId, rawFilters);
    }
  }

  if (!_.isEmpty(rawFilters)) {
    queriesArray.push(`rawfilter=${combineAndFilters(rawFilters)}`);
  }

  if (!_.isEmpty(dedicatedFilters)) {
    queriesArray.push(...dedicatedFilters);
  }
}

function extractActivityFilter(queriesArray, request) {
  const { filter } = request.query;
  const rawFilters = [];
  const dedicatedFilters = [];
  const supportedFilters = [
    "lang",
    "categories",
    "lastUpdate",
    "geometries",
    "categories.all",
    "categories.any",
    "lastUpdate.gt",
    "lastUpdate.lt",
    "geometries.near",
  ];

  if (filter) {
    Object.entries(filter).forEach(([filterName, value]) => {
      if (!supportedFilters.includes(filterName)) {
        errors.DestinationDataError.throwBadQueryError(`Filter not supported: 'filter[${filterName}]'`);
      }

      if (typeof value === "string") {
        return; // simple filter
      }

      if (Object.keys(value).every((operand) => !supportedFilters.includes(`${filterName}.${operand}`))) {
        errors.DestinationDataError.throwBadQueryError(`Filter not supported: 'filter[${filterName}][${operand}]'`);
      }
    });

    if (objectPath.has(filter, "lang")) {
      const languageTags = objectPath.get(filter, "lang", "");
      extractLanguageFilter("filter[lang]", languageTags, rawFilters);
    }

    if (objectPath.has(filter, "categories.all")) {
      extractActivityFilterCategoriesAll(objectPath.get(filter, "categories.all", ""), rawFilters);
    }

    if (objectPath.has(filter, "categories.any")) {
      extractActivityFilterCategoriesAny(objectPath.get(filter, "categories.any", ""), rawFilters);
    }

    if (objectPath.has(filter, "lastUpdate.gt")) {
      const dateValue = objectPath.get(filter, "lastUpdate.gt", "");
      extractDateFilter("filter[lastUpdate][gt]", dateValue, "LastChange", "gt", rawFilters);
    }

    if (objectPath.has(filter, "lastUpdate.lt")) {
      const dateValue = objectPath.get(filter, "lastUpdate.lt", "");
      extractDateFilter("filter[lastUpdate][lt]", dateValue, "LastChange", "lt", rawFilters);
    }

    if (objectPath.has(filter, "geometries.near")) {
      const areaValue = objectPath.get(filter, "geometries.near", "");
      extractLocationFilter("filter[geometries][near]", areaValue, dedicatedFilters);
    }
  }

  if (!_.isEmpty(rawFilters)) {
    queriesArray.push(`rawfilter=${combineAndFilters(rawFilters)}`);
  }

  if (!_.isEmpty(dedicatedFilters)) {
    queriesArray.push(...dedicatedFilters);
  }
}

function extractSearch(queriesArray, request) {
  const { search } = request.query;
  const searchFilters = [];

  if (search) {
    if (typeof search === "string" || Object.keys(search).some((searchField) => searchField !== "name")) {
      errors.DestinationDataError.throwBadQueryError(
        `The 'search' query only supports searches over the 'name' field.`
      );
    }

    if (objectPath.has(search, "name")) {
      const searchTerm = objectPath.get(search, "name", "");
      searchFilters.push(`searchfilter=${searchTerm}`);
    }
  }

  if (!_.isEmpty(searchFilters)) {
    queriesArray.push(...searchFilters);
  }
}

transformGetEventsRequest = (request) =>
  transformGetCollectionRequest(request, [
    extractOdhPageNumber,
    extractOdhPageSize,
    extractEventSort,
    extractRandom,
    extractEventFilter,
    extractSearch,
  ]);

transformGetLiftsRequest = (request) =>
  transformGetCollectionRequest(request, [
    extractOdhPageNumber,
    extractOdhPageSize,
    extractRandom,
    extractActivityFilter,
    extractSearch,
  ]);

transformGetSkiSlopesRequest = (request) =>
  transformGetCollectionRequest(request, [
    extractOdhPageNumber,
    extractOdhPageSize,
    extractRandom,
    extractActivityFilter,
    extractSearch,
  ]);

transformGetSnowparksRequest = (request) =>
  transformGetCollectionRequest(request, [
    extractOdhPageNumber,
    extractOdhPageSize,
    extractRandom,
    extractActivityFilter,
    extractSearch,
  ]);

module.exports = {
  transformGetEventsRequest,
  transformGetLiftsRequest,
  transformGetSkiSlopesRequest,
  transformGetSnowparksRequest,
};
