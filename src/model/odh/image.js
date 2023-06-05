// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

class Image {
    constructor(odhImage) {
        if (odhImage) {
            Object.assign(this, odhImage)
        }
    }
}

module.exports = {
    Image
}