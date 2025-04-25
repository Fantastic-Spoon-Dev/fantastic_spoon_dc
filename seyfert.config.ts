import { config } from "seyfert";
 
export default config.bot({
    token: process.env.DC_TOKEN ?? "",
    locations: {
        base: "src", // replace with "src" if using bun
        commands: "commands"
    },
    intents: ["Guilds"],
    // This configuration is optional, in case you want to receive interactions via HTTP
    // This allows you to use both the gateway and the HTTP webhook
    publicKey: process.env.PUBLIC_KEY ?? "", // replace with your public key
    port: 3275, // replace with your application's port 
});