import {
    Discord,
    CommandMessage,
    Command,
    Description,
    On,
    Guard,
} from "@typeit/discord";
import { TextChannel, VoiceState } from "discord.js";
import { BoardControl } from "../domain/culture-generale/BoardControl";
import { CultureG } from "../domain/culture-generale/CultureG";
import { AdminOnly } from "../domain/guards/AdminOnly";
import { muteOne, unmuteOne } from "../utils/mute";

@Discord("!cg")
@Description("Culture Générale commands")
export abstract class CultureGeneraleCommands {
    private cultureG: CultureG;

    @Command("setup")
    @Guard(AdminOnly)
    //TODO : verification command.member.voice.channel and command.channel and permissions to connect valid
    setup(command: CommandMessage): void {
        this.cultureG = new CultureG(command.member.voice.channel, command.channel as TextChannel);
    }

    @Command("createBC")
    @Guard(AdminOnly)
    createBC(command: CommandMessage): void {
        if (this.cultureG)
            new BoardControl(this.cultureG, command.channel as TextChannel);
    }

    @Command("stop")
    @Guard(AdminOnly)
    stop(): void {
        if (this.cultureG) {
            this.cultureG.stop();
            this.cultureG = null;
        }
    }

    @On("voiceStateUpdate")
    manageMute(states: VoiceState[]) {
        if (this.cultureG) {
            const oldState = states[0];
            const newState = states[1];
            if (oldState.channelID !== this.cultureG.getVoiceChannel().id && newState.channelID === this.cultureG.getVoiceChannel().id) { // case of connexion
                muteOne(newState.member);
            } else if (oldState.channelID === this.cultureG.getVoiceChannel().id && newState.channelID !== this.cultureG.getVoiceChannel().id) { // case of disconnexion
                unmuteOne(oldState.member);
            }
        }
    }
}