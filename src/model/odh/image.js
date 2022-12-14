
class Image {
    constructor(odhImage) {
        if (odhImage) {
            Object.assign(this, odhImage)
        }
    }
}

module.exports = {
    Image
}