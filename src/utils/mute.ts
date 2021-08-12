import { GuildMember, VoiceChannel } from "discord.js";

export async function muteOne(member: GuildMember): Promise<void> {
    try {
        await member.voice.setMute(true);
    } catch (e) {
        console.log("Problem with ", member.user.username);
    }
}

export function muteAll(voiceChannel: VoiceChannel): void {
    voiceChannel.members.forEach((member:GuildMember) => {
        if(!member.user.bot)
            this.muteOne(member);
    });
}

export async function unmuteOne(member: GuildMember): Promise<void> {
    try {
       await member.voice.setMute(false);
    } catch (e) {
        console.log("Problem with ", member.user.username);
    }
}

export function unmuteAll(voiceChannel): void {
    voiceChannel.members.forEach((member: GuildMember) => {
            this.unmuteOne(member)
    });
}
