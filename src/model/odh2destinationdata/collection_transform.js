const { Collection: OdhCollection } = require('../odh/collection');
const { Event: OdhEvent } = require('../odh/event');
const { Collection: DestinationDataCollection } = require('../destinationdata/collection');
const { transformToEvent } = require('./event_transform');
const { transformToLift, transformToSkiSlope, transformToSnowpark } = require('./activity_transform');

function transformCollectionMeta(odhCollection) {
    const { TotalResults, TotalPages } = odhCollection;
    return { count: TotalResults, pages: TotalPages}
}

function transformCollectionLinks(odhCollection, request) {
    const { TotalPages, CurrentPage } = odhCollection;
    const first = 1;
    const current = CurrentPage;
    const next = current < TotalPages ? current + 1 : TotalPages;
    const prev = current > 1 ? current - 1 : 1;
    const last = TotalPages ? TotalPages : 1;
    
    const { selfUrl } = request
    const links = {};
    const regexPageQuery = /page\[number\]=[0-9]+/;
    const pageQuery = "page[number]=";
    
    if (regexPageQuery.test(selfUrl)) {
        links.first = selfUrl.replace(regexPageQuery, pageQuery + first);
        links.last = selfUrl.replace(regexPageQuery, pageQuery + last);
        links.next = selfUrl.replace(regexPageQuery, pageQuery + next);
        links.prev = selfUrl.replace(regexPageQuery, pageQuery + prev);
        links.self = selfUrl.replace(regexPageQuery, pageQuery + current);
    } else {
        const regexQueries = /page|include|fields|filter|sort|search|random/;
        const separator = regexQueries.test(selfUrl) ? "&" : "?";

        links.self = selfUrl + separator + pageQuery + current;
        links.first = selfUrl + separator + pageQuery + first;
        links.next = selfUrl + separator + pageQuery + next;
        links.prev = selfUrl + separator + pageQuery + prev;
        links.last = selfUrl + separator + pageQuery + last;
    }

    return links;
}

function transformToEventCollection(odhItems, request) {
    const odhCollection =  new OdhCollection(odhItems);
    const collection = new DestinationDataCollection();

    collection._include = request.include
    collection._fields = request.fields

    collection.meta = transformCollectionMeta(odhCollection);
    collection.links = transformCollectionLinks(odhCollection, request);

    odhCollection.getItems(OdhEvent).forEach(item => collection.data.push(transformToEvent(item, request)));
    
    return collection;
}

function transformToLiftCollection(odhItems, request) {
    const odhCollection =  new OdhCollection(odhItems);
    const collection = new DestinationDataCollection();

    collection._include = request.include
    collection._fields = request.fields

    collection.meta = transformCollectionMeta(odhCollection);
    collection.links = transformCollectionLinks(odhCollection, request);

    odhCollection.getItems(OdhEvent).forEach(item => collection.data.push(transformToLift(item, request)));
    
    return collection;
}

function transformToSkiSlopesCollection(odhItems, request) {
    const odhCollection =  new OdhCollection(odhItems);
    const collection = new DestinationDataCollection();

    collection._include = request.include
    collection._fields = request.fields

    collection.meta = transformCollectionMeta(odhCollection);
    collection.links = transformCollectionLinks(odhCollection, request);

    odhCollection.getItems(OdhEvent).forEach(item => collection.data.push(transformToSkiSlope(item, request)));
    
    return collection;
}

function transformToSnowparksCollection(odhItems, request) {
    const odhCollection =  new OdhCollection(odhItems);
    const collection = new DestinationDataCollection();

    collection._include = request.include
    collection._fields = request.fields

    collection.meta = transformCollectionMeta(odhCollection);
    collection.links = transformCollectionLinks(odhCollection, request);

    odhCollection.getItems(OdhEvent).forEach(item => collection.data.push(transformToSnowpark(item, request)));
    
    return collection;
}

module.exports = {
    transformToEventCollection,
    transformToLiftCollection,
    transformToSkiSlopesCollection,
    transformToSnowparksCollection,
}