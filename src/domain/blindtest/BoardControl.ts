import { Message, MessageReaction, TextChannel, User } from "discord.js";
import { Blindtest } from "./Blindtest";

export class BoardControl {

    // TODO : une énum
    private START_EMOJI = '▶️';
    private PAUSE_EMOJI = '⏸';
    private WRONG_EMOJI = '❌';
    private SKIP_EMOJI = '⏭';
    private ONE_EMOJI = '1️⃣';
    private TWO_EMOJI = '2️⃣';
    private THREE_EMOJI = '3️⃣';
    private FOUR_EMOJI = '4️⃣';
    private FIVE_EMOJI = '5️⃣';

    private blindtest: Blindtest;
    private started = false;
    private message: Message;
    constructor(blindtest: Blindtest, textChannel: TextChannel) {
        this.blindtest = blindtest;

        this.createBoard(textChannel);
    }

    private createBoard(textChannel: TextChannel): void {
        textChannel.send(this.getMessage()).then(async message => {
            this.message = message;
            await message.react(this.START_EMOJI);
            await message.react(this.PAUSE_EMOJI);
            await message.react(this.SKIP_EMOJI);
            await message.react(this.WRONG_EMOJI);
            await message.react(this.ONE_EMOJI);
            await message.react(this.TWO_EMOJI);
            await message.react(this.THREE_EMOJI);
            await message.react(this.FOUR_EMOJI);
            await message.react(this.FIVE_EMOJI);

            message.createReactionCollector(() => true).on('collect', (reaction, user) => this.getEvent(reaction, user));
        }
        );
    }

    private getEvent(event: MessageReaction, user: User): void {
        event.users.remove(user);

        switch(event.emoji.name) {
            case this.START_EMOJI: 
                this.onStart();
                break;
            case this.PAUSE_EMOJI:
                this.blindtest.pause();
                break;
            case this.SKIP_EMOJI:
                this.blindtest.skip();
                break;
            case this.WRONG_EMOJI:
                this.blindtest.wrongAnswer();
                break;
            case this.ONE_EMOJI:
                this.blindtest.correctAnswer(1);
                break;
            case this.TWO_EMOJI:
                this.blindtest.correctAnswer(2);
                break;
            case this.THREE_EMOJI:
                this.blindtest.correctAnswer(3);
                break;
            case this.FOUR_EMOJI:
                this.blindtest.correctAnswer(4);
                break;
            case this.FIVE_EMOJI:
                this.blindtest.correctAnswer(5);
                break;

        }

        this.message.edit(this.getMessage());
    }

    private onStart(): void {
        if(!this.started) {
            this.started = true;
            this.blindtest.start();
        } else {
            this.blindtest.resume();
        }

    }

    private getMessage(): string {
        const song = this.blindtest.getCurrentSong();
        if(song) {
            return `Joue actuellement : ${song.titre} de ${song.artiste}`;
        } else {
            return "Aucune musique en cours";
        }
    }
}