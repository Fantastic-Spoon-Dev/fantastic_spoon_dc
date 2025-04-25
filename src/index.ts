import { Client } from "seyfert";
 
import type { ParseClient } from "seyfert";

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> { }
}

const client = new Client();
 
// This will start the connection with the Discord gateway and load commands, events, components, and language (i18n)
client.start()
  .then(() => client.uploadCommands({ cachePath: './commands.json' }));