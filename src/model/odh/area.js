// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Item } = require("./item");

class Area extends Item {
  constructor(odhArea) {
    super(odhArea);
  }
}

module.exports = {
  Area,
};
