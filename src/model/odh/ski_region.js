// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Item } = require("./item");

class SkiRegion extends Item {
    constructor(skiRegion) {
        super(skiRegion);
    }
}

module.exports = {
    SkiRegion
}