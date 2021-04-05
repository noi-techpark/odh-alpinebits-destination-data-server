
function extractPageSize(queriesArray, request) {
    const { page } = request.query
    const pageSize = (page && page.size) || 10;
    if(pageSize) queriesArray.push(`pagesize=${pageSize}`);
}

function extractPageNumber(queriesArray, request) {
    const { page } = request.query
    const pageNumber = (page && page.number) || 1;
    if(pageNumber) queriesArray.push(`pagenumber=${pageNumber}`);
}

function transformEventQueries(request) {
    // TODO: update queries mapping/transformation to ODH

    const queries = [];
    const { id } = request.params;

    if(!id) {
        extractPageSize(queries,request);
        extractPageNumber(queries,request);
    }

    return queries ? queries.join('&') : null;
}

function transformLiftQueries(request) {
    // TODO: update queries mapping/transformation to ODH

    const queries = [];
    const { id } = request.params;

    if(!id) {
        queries.push('odhtagfilter=aufstiegsanlagen');

        extractPageSize(queries,request);
        extractPageNumber(queries,request);
    }


    return queries ? queries.join('&') : null;
}

function transformSkiSlopesQueries(request) {
    // TODO: update queries mapping/transformation to ODH

    const queries = [];
    const { id } = request.params;

    if(!id) {
        queries.push('odhtagfilter=ski alpin,ski alpin (rundkurs),rodelbahnen,loipen');

        extractPageSize(queries,request);
        extractPageNumber(queries,request);
    }


    return queries ? queries.join('&') : null;
}

function transformSnowparksQueries(request) {
    // TODO: update queries mapping/transformation to ODH

    const queries = [];
    const { id } = request.params;

    if(!id) {
        queries.push('odhtagfilter=ski alpin,ski alpin (rundkurs),rodelbahnen,loipen');

        extractPageSize(queries,request);
        extractPageNumber(queries,request);
    }


    return queries ? queries.join('&') : null;
}

module.exports = {
    transformEventQueries,
    transformLiftQueries,
    transformSkiSlopesQueries,
    transformSnowparksQueries,
}