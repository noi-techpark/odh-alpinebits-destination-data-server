// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const ResourceType = {
    agents: 'agents',
    categories: 'categories',
    events: 'events',
    eventSeries: 'eventSeries',
    features: 'features',
    lifts: 'lifts',
    mediaObjects: 'mediaObjects',
    mountainAreas: 'mountainAreas',
    snowparks: 'snowparks',
    skiSlopes: 'skiSlopes',
    venues: 'venues',
}

const SnowparkDifficulty = {
    beginner : 'beginner',
    intermediate : 'intermediate',
    advanced : 'advanced',
    expert : 'expert',
}

const SkiSlopeDifficulty = {
    eu: {
        novice: 'novice',
        beginner: 'beginner',
        intermediate: 'intermediate',
        expert: 'expert',
    },
    us: {
        beginner: 'beginner',
        'beginner-intermediate': 'beginner-intermediate',
        intermediate: 'intermediate',
        'intermediate-advanced': 'intermediate-advanced',
        expert: 'expert',
    }
}

const SnowType = {
    'packed-powder': 'packed-powder',
    powder: 'powder',
    'hard-pack': 'hard-pack',
    'loose-granular': 'loose-granular',
    'frozen-granular': 'frozen-granular',
    'wet-packed': 'wet-packed',
    'wet-granular': 'wet-granular',
    'wet-snow': 'wet- snow',
    'spring-conditions': 'spring-conditions',
    windblown: 'windblown',
    'corn-snow': 'corn-snow',
    icy: 'icy',
    variable: 'variable',
}

module.exports = {
    ResourceType,
    SnowparkDifficulty,
    SkiSlopeDifficulty,
    SnowType,
}