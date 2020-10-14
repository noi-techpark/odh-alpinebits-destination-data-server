const iso6393map = require('iso-639-3/to-1.json');

function parseDateString(malformedDateString) {
    const date = new Date(malformedDateString);

    if(isNaN(date.getDate())) {
        return '';
    }

    const day = date.getUTCDate() > 9 ? date.getUTCDate() : `0${date.getUTCDate()}`;
    const month = date.getUTCMonth() + 1 > 9 ? date.getUTCMonth() + 1 : `0${date.getUTCMonth()+1}`;
    return `${date.getUTCFullYear()}-${month}-${day}`;
}

function getLangInIso6391(lang) {
    if(Array.isArray(lang)) {
        return lang.map(_3letterCode => iso6393map[_3letterCode]).join(',');
    } else if(typeof lang === 'string') {
        return iso6393map[lang];
    } else {
        return '';
    }
}

function parsePointDistance(point) {
    const distanceToPoint = {
        lng: point[0],
        lat: point[1],
        rad: point[2],
    }

    return distanceToPoint
}

module.exports = {
    parseDateString,
    getLangInIso6391,
    parsePointDistance,
}