// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Item } = require("./item");

class SkiArea extends Item {
    constructor(skiArea) {
        super(skiArea);
    }
}

module.exports = {
    SkiArea
}