// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Item } = require("./item");

class Activity extends Item {
  constructor(odhActivity) {
    super(odhActivity);
  }
}

module.exports = {
  Activity,
};
