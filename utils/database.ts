import { MongoClient } from "mongodb";
import { getSettings } from "./utils";

const debug = require("debug")("run:utils-database");

const getConnection = () => {
  const settings = getSettings();

  debug("settings", settings);

  if (!settings) {
    return;
  }

  if (!settings.mongodb) {
    return;
  }

  const client = new MongoClient(settings.mongodb.connectionURI);

  const db = client.db(settings.mongodb.database);
  const collection = db.collection(settings.mongodb.collection);

  return { db, client, collection };
};

export const { db, client, collection } = getConnection() || {};
