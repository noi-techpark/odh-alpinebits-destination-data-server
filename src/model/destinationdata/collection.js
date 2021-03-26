
class DestinationDataCollection {
    constructor(base) {
        base = base || {};

        this.jsonapi = base.jsonapi || { version: '1.0' };

        this.meta = base.meta || {
            count: null,
            pages: null
        };

        this.links = base.links || {
            self: null
        };

        this.data = base.data || [];

        this.included = base.included || null;
    }

    toJSON() {
        const copy = Object.assign({}, this);

        if(!this.included) delete this.included;
        
        return copy;
    }

    setPagination(totalResults, totalPages, currentPage) {
        this.meta.count = totalResults;
        this.meta.pages = totalPages;

        // TODO: implementation incomplete
        this.links.first = this.links.self + '';
        this.links.last = this.links.self + '';
        this.links.prev = this.links.self + '';
        this.links.next = this.links.self + '';
    }
}

module.exports = {
    DestinationDataCollection
}