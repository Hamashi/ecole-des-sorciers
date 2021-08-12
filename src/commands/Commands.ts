import {
    Discord,
    CommandMessage,
    Command,
    Description,
    On,
  } from "@typeit/discord";
  
  @Discord("!")
  @Description("Generic commands")
  export abstract class Commands {

    @Command("ping")
    ping(command: CommandMessage): void {
      command.reply("pong!");
    }

    @On("ready")
    initialize(): void {
      console.log("Bot logged in.");
    }
  
  }