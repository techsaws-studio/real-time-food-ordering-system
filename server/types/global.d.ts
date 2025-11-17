import { Connection } from "mongoose";

declare global {
  var mongooseConnection: Connection | undefined;
}

export {};
