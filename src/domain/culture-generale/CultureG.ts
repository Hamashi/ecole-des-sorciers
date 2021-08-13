import { Message, MessageReaction, TextChannel, User, VoiceChannel } from "discord.js";
import { muteAll, muteOne, unmuteAll, unmuteOne } from "../../utils/mute";
import { ScoreManager } from "../ScoreManager";
export class CultureG {

    private BUZZ_EMOJI = '❓';

    private voiceChannel: VoiceChannel;
    private buzzChannel: TextChannel;
    private buzzMessage : Message;

    private started = false;
    private buzzUser: User | null = null;

    private scoreManager = new ScoreManager();

    private banList = [];

    constructor(voiceChannel: VoiceChannel, buzzChannel: TextChannel) {
        this.voiceChannel = voiceChannel;
        this.buzzChannel = buzzChannel;
        muteAll(voiceChannel);
        this.createBuzzer();
    }

    wrongAnswer() {
        if (this.buzzUser) {
            const member = this.voiceChannel.members.find(member => member.id === this.buzzUser.id);
            this.banList = [...this.banList, member.roles.color];
            this.buzzUser = null;
            this.getBuzzerMessage();
            muteOne(member);
        }
    }

    correctAnswer(points: number): void {
        if (this.buzzUser) {
            const member = this.voiceChannel.members.find(member => member.id === this.buzzUser.id);
            this.scoreManager.addPoints(this.buzzUser, points);
            this.skip();
            muteOne(member);
        }
    }

    activateBuzzer(): void {
        this.started = true;
        this.getBuzzerMessage();
    }

    skip(): void {
        this.banList = [];
        this.buzzUser = null;
        this.started = false;
        this.getBuzzerMessage();
    }

    printScores(): void {
        this.buzzChannel.send(this.scoreManager.getScoreMessage());
    }

    stop(): void {
        this.skip();
        this.getBuzzerMessage();
        unmuteAll(this.voiceChannel);
    }

    getVoiceChannel(): VoiceChannel {
        return this.voiceChannel;
    }

    private createBuzzer(): void {
        this.buzzChannel.send("Partie en cours de création.").then(message => {
            this.buzzMessage = message;
            message.react(this.BUZZ_EMOJI);
            const filter = (reaction) => reaction.emoji.name === this.BUZZ_EMOJI;
            const collector = message.createReactionCollector(filter);
            collector.on('collect', r => this.onBuzz(r));
            this.getBuzzerMessage();
        }
        );
    }

    private onBuzz(event: MessageReaction): void {
        if (event.users.cache.size < 2)
            return;

        event.remove();
        if (!this.buzzUser && this.started) {
            this.buzzUser = event.users.cache.find(user => !user.bot);
            const member = this.voiceChannel.members.find(member => member.id === this.buzzUser.id);
            if (member && !this.banList.find(e => e === member.roles.color)) {
                console.log(this.buzzUser.username + 'buzzed');
                unmuteOne(member);
                this.getBuzzerMessage();
            } else if (member) {
                console.log(this.buzzUser.username + 'buzzed but ' + member.roles.color + ' is banned');
                this.buzzUser = null;
            } else {
                console.log(this.buzzUser.username + 'buzzed but is not connected to voice channel');
                this.buzzUser = null;
            }
        }
    }

    private getBuzzerMessage(): void {
        if(!this.started) {
            this.buzzMessage.edit("Buzzer inactif.");
            this.buzzMessage.reactions.removeAll();
        } else if(!this.buzzUser) {
            this.buzzMessage.edit("Cliquer sur " + this.BUZZ_EMOJI + " pour buzzer.");
            this.buzzMessage.react(this.BUZZ_EMOJI);
        } else {
            this.buzzMessage.edit("La parole est à " + this.buzzUser.username);
            this.buzzMessage.reactions.removeAll();
        }
    }
}