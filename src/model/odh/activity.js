// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Item } = require("./item");

class Activity extends Item {
  constructor(odhActivity) {
    super(odhActivity);
  }
}

module.exports = {
  Activity,
};
