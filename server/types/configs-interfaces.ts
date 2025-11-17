export interface ISocketConfigurations {
  pingTimeout: number;
  pingInterval: number;
  connectTimeout: number;
  maxHttpBufferSize: number;
  allowUpgrades: boolean;
  transports: ("websocket" | "polling")[];
}
