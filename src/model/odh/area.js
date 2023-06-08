// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Item } = require("./item");

class Area extends Item {
  constructor(odhArea) {
    super(odhArea);
  }
}

module.exports = {
  Area,
};
