import { MessageReaction, StreamDispatcher, TextChannel, User, VoiceChannel, VoiceConnection } from "discord.js";
import { muteAll, muteOne, unmuteAll, unmuteOne } from "../../utils/mute";
import * as ytdl from "ytdl-core";
import { ScoreManager } from "../ScoreManager";
import { Musique, musiques } from "../../resources/reprises";
export class Blindtest {

    private BUZZ_EMOJI = '🎧';

    private voiceChannel: VoiceChannel;
    private voiceConnection: VoiceConnection;
    private buzzChannel: TextChannel;
    private soundControl: StreamDispatcher;

    private started = false;
    private buzzUser: User | null = null;
    private roundIndex = 0;

    private scoreManager = new ScoreManager();

    constructor(voiceChannel: VoiceChannel, buzzChannel: TextChannel) {
        this.voiceChannel = voiceChannel;
        this.buzzChannel = buzzChannel;
        muteAll(voiceChannel);
        voiceChannel.join().then((connection) => (this.voiceConnection = connection));
        this.createBuzzer();
    }

    wrongAnswer() {
        if (this.buzzUser) {
            const member = this.voiceChannel.members.find(member => member.id === this.buzzUser.id);
            this.scoreManager.addPoints(this.buzzUser, -1);
            this.buzzUser = null;
            muteOne(member);
            this.soundControl.resume();
        }
    }

    correctAnswer(points: number): void {
        if (this.buzzUser) {
            const member = this.voiceChannel.members.find(member => member.id === this.buzzUser.id);
            this.scoreManager.addPoints(this.buzzUser, points);
            muteOne(member);
            this.skip();
        }
    }

    pause() {
        if (this.soundControl && this.started) {
            this.soundControl.pause();
            this.started = false;
            this.buzzUser = null;
            unmuteAll(this.voiceChannel);
        }
    }

    resume() {
        if (this.soundControl && !this.started) {
            muteAll(this.voiceChannel);
            this.buzzUser = null;
            this.started = true;
            this.soundControl.resume();
        }
    }

    skip() {
        this.buzzUser = null;
        this.roundIndex++;
        if (this.roundIndex === musiques.length) {
            this.stop();
            return;
        }
        this.started = true;
        this.soundControl = this.voiceConnection.play(ytdl(this.getCurrentSong().url), {seek: this.getCurrentSong().timeCode});
        console.log(this.scoreManager.getScoreMessage());
    }

    start(): void {
        this.started = true;
        this.soundControl = this.voiceConnection.play(ytdl(this.getCurrentSong().url), {seek: this.getCurrentSong().timeCode});
    }

    stop(): void {
        this.roundIndex = 0;
        if(this.started) {
            this.buzzChannel.send("Merci d'avoir participé à ce blindtest, voici les résultats finaux : ");
            this.buzzChannel.send(this.scoreManager.getScoreMessage())
        }
        this.started = false;
        this.voiceChannel.leave();
        unmuteAll(this.voiceChannel);
    }

    getCurrentSong(): Musique | null {
        if (this.started)
            return musiques[this.roundIndex]

        return null;
    }

    isStarted(): boolean {
        return this.started;
    }

    getVoiceChannel(): VoiceChannel {
        return this.voiceChannel;
    }

    private createBuzzer(): void {
        this.buzzChannel.send("Cliquer sur " + this.BUZZ_EMOJI + " pour buzzer.").then(message => {
            message.react(this.BUZZ_EMOJI);
            const filter = (reaction) => reaction.emoji.name === this.BUZZ_EMOJI;
            const collector = message.createReactionCollector(filter);
            collector.on('collect', r => this.onBuzz(r));
        }
        );
    }

    private onBuzz(event: MessageReaction): void {
        if (event.users.cache.size < 2)
            return;

        event.remove();
        event.message.react(this.BUZZ_EMOJI);
        if (!this.buzzUser && this.started) {
            this.buzzUser = event.users.cache.find(user => !user.bot);
            const member = this.voiceChannel.members.find(member => member.id === this.buzzUser.id);
            if (member) {
                console.log(this.buzzUser.username + 'buzzed');
                this.soundControl.pause()
                unmuteOne(member);
            } else {
                console.log(this.buzzUser.username + 'buzzed but is not connected to voice channel');
                this.buzzUser = null;
            }
        }
    }
}