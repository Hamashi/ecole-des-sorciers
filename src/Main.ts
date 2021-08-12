import { Client } from "@typeit/discord";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });

export class Main {
  private static _client: Client;

  static get Client(): Client {
    return this._client;
  }

  static start(): void {
    this._client = new Client();

    this._client.login(
        process.env.TOKEN,
      `${__dirname}/commands/*.ts`,
    );
  }
}

Main.start();