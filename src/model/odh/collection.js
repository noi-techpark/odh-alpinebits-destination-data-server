// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

class Collection {
    constructor(odhResponse) {
        if (odhResponse) {
            Object.assign(this, odhResponse);
        }
    }

    getItems(_class) {
        if(Array.isArray(this.Items)) {
            return this.Items.map(item => _class ? new _class(item) : item);
        } else {
            return [];
        }
    }
}

module.exports = {
    Collection
}