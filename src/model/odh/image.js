// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

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