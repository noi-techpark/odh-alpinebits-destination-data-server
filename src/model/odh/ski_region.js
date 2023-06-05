// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Item } = require("./item");

class SkiRegion extends Item {
    constructor(skiRegion) {
        super(skiRegion);
    }
}

module.exports = {
    SkiRegion
}