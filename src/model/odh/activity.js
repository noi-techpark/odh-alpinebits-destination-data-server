const { Item } = require("./item");

class Activity extends Item {
    constructor(odhActivity) {
        super(odhActivity);
    }
}

module.exports = {
    Activity
}