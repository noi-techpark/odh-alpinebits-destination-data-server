
module.exports.createPoint = function createPoint(longitude, latitude, altitude) {
    return { 
        type: 'Point',
        coordinates: [
            longitude, 
            latitude, 
            altitude
        ] 
    }    
}

module.exports.createLineString = function createLineString(points) {
    return { 
        type: 'LineString',
        coordinates: points
    }
}