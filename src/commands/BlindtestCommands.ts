import {
  Discord,
  CommandMessage,
  Command,
  Description,
  Guard,
  On,
} from "@typeit/discord";
import { GuildMember, TextChannel, VoiceState } from "discord.js";
import { Blindtest } from "../domain/blindtest/Blindtest";
import { BoardControl } from "../domain/blindtest/BoardControl";
import { AdminOnly } from "../domain/guards/AdminOnly";
import { muteOne, unmuteOne } from "../utils/mute";

@Discord("!bt")
@Description("Commands for blindtest")
export abstract class BlindtestCommands {
  private blindtest: Blindtest;
  private boardControl: BoardControl;

  @Command("setup")
  @Guard(AdminOnly)
  //TODO : verification command.member.voice.channel and command.channel and permissions to connect valid
  setup(command: CommandMessage): void {
    this.blindtest = new Blindtest(command.member.voice.channel, command.channel as TextChannel);
  }

  @Command("createBC")
  @Guard(AdminOnly)
  createBC(command: CommandMessage): void {
    if (this.blindtest)
      this.boardControl = new BoardControl(this.blindtest, command.channel as TextChannel);
  }

  @Command("start")
  @Guard(AdminOnly)
  start(): void {
    if (this.blindtest)
      this.blindtest.start();
  }

  @Command("stop")
  @Guard(AdminOnly)
  //TODO : Guards for admin only
  stop(): void {
    if (this.blindtest)
      this.blindtest.stop();
    this.blindtest = null;
    this.boardControl = null;
  }

  @Command("wrong")
  @Guard(AdminOnly)
  wrong(): void {
    if (this.blindtest)
      this.blindtest.wrongAnswer();
  }

  @Command("right")
  @Guard(AdminOnly)
  //TODO : guard c'est bien un chiffre qui est rentré
  right(command: CommandMessage): void {
    console.log(command.content)
    if (this.blindtest)
      this.blindtest.correctAnswer(parseInt(command.content.split(" ")[1]));
  }

  @Command("pause")
  @Guard(AdminOnly)
  pause(): void {
    if (this.blindtest)
      this.blindtest.pause();
  }

  @Command("resume")
  @Guard(AdminOnly)
  resume(): void {
    if (this.blindtest)
      this.blindtest.resume();
  }

  @Command("skip")
  @Guard(AdminOnly)
  skip(): void {
    if (this.blindtest)
      this.blindtest.skip();
  }


  @On("voiceStateUpdate")
  manageMute(states: VoiceState[]) {
    if (this.blindtest) {
      const oldState = states[0];
      const newState = states[1];
      if (oldState.channelID !== this.blindtest.getVoiceChannel().id && newState.channelID === this.blindtest.getVoiceChannel().id) { // case of connexion
        muteOne(newState.member);
      } else if (oldState.channelID === this.blindtest.getVoiceChannel().id && newState.channelID !== this.blindtest.getVoiceChannel().id) { // case of disconnexion
        unmuteOne(oldState.member);
      }
    }
  }
}