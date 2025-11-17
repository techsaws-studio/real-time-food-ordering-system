import { IJWTPayload } from "./utils-interfaces.js";

import { IUser, ITableSession } from "./models-interfaces.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      session?: ITableSession;
      tokenPayload?: IJWTPayload;
    }
  }
}

export {};
