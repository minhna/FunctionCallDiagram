export type MongodbSetting = {
  connectionURI: string;
  database: string;
  collection: string;
};

export type SettingsValue = string | Object;

export type SettingsObject = {
  [key: string]: SettingsValue;
  mongodb: MongodbSetting;
};

export type ArgsObject = {
  [key: string]: string | boolean | undefined;
  "--debug"?: string;
};
