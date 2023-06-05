// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Router } = require("./router");
const { AgentsRouter } = require("./agents_router");
const { CategoriesRouter } = require("./categories_router");
const { EventSeriesRouter } = require("./event_series_router");
const { EventsRouter } = require("./events_router");
const { FeaturesRouter } = require("./features_router");
const { HomeRouter } = require("./home_router");
const { LiftsRouter } = require("./lifts_router");
const { MediaObjectsRouter } = require("./media_objects_router");
const { MountainAreasRouter } = require("./mountain_areas_router");
const { SkiSlopesRouter } = require("./ski_slopes_router");
const { SnowparksRouter } = require("./snowparks_router");
const { VenuesRouter } = require("./venues_router");

function installRoutes(app) {
  const routers = [
    AgentsRouter,
    CategoriesRouter,
    EventSeriesRouter,
    EventsRouter,
    FeaturesRouter,
    HomeRouter,
    LiftsRouter,
    MediaObjectsRouter,
    MountainAreasRouter,
    SkiSlopesRouter,
    SnowparksRouter,
    VenuesRouter,
  ];

  routers.forEach((RouterClass) => new RouterClass(app));
}

module.exports = {
  Router,
  AgentsRouter,
  CategoriesRouter,
  EventSeriesRouter,
  EventsRouter,
  FeaturesRouter,
  HomeRouter,
  LiftsRouter,
  MediaObjectsRouter,
  MountainAreasRouter,
  SkiSlopesRouter,
  SnowparksRouter,
  VenuesRouter,
  installRoutes,
};
