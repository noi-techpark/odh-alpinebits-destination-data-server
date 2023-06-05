// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Item } = require("./item");

class SkiArea extends Item {
    constructor(skiArea) {
        super(skiArea);
    }
}

module.exports = {
    SkiArea
}