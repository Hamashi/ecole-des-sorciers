import { Message, MessageReaction, TextChannel, User } from "discord.js";
import { CultureG } from "./CultureG";

export class BoardControl {

    // TODO : une énum
    private SCORE_EMOJI = '👨‍🏫';
    private START_EMOJI = '▶️';
    private STOP_EMOJI = '⏹';
    private SKIP_EMOJI = '⏭';
    private WRONG_EMOJI = '❌';
    private ONE_EMOJI = '1️⃣';    
    private TWO_EMOJI = '2️⃣';
    private THREE_EMOJI = '3️⃣';
    private FOUR_EMOJI = '4️⃣';
    private FIVE_EMOJI = '5️⃣';

    private cultureG: CultureG;
    constructor(cultureG: CultureG, textChannel: TextChannel) {
        this.cultureG = cultureG;

        this.createBoard(textChannel);
    }

    private createBoard(textChannel: TextChannel): void {
        textChannel.send("Panneau de controle du quizz").then(async message => { // TODO : dire qui a buzzé
            await message.react(this.START_EMOJI);
            await message.react(this.SKIP_EMOJI);
            await message.react(this.WRONG_EMOJI);
            await message.react(this.ONE_EMOJI);
            await message.react(this.TWO_EMOJI);
            await message.react(this.THREE_EMOJI);
            await message.react(this.FOUR_EMOJI);
            await message.react(this.FIVE_EMOJI);
            await message.react(this.SCORE_EMOJI);

            message.createReactionCollector(() => true).on('collect', (reaction, user) => this.getEvent(reaction, user));
        }
        );
    }

    private getEvent(event: MessageReaction, user: User): void {
        event.users.remove(user);

        switch(event.emoji.name) {
            case this.START_EMOJI: 
                this.cultureG.activateBuzzer();
                break;
            case this.SKIP_EMOJI:
                this.cultureG.skip();
                break;
            case this.WRONG_EMOJI:
                this.cultureG.wrongAnswer();
                break;
            case this.ONE_EMOJI:
                this.cultureG.correctAnswer(1);
                break;
            case this.TWO_EMOJI:
                this.cultureG.correctAnswer(2);
                break;
            case this.THREE_EMOJI:
                this.cultureG.correctAnswer(3);
                break;
            case this.FOUR_EMOJI:
                this.cultureG.correctAnswer(4);
                break;
            case this.FIVE_EMOJI:
                this.cultureG.correctAnswer(5);
                break;
            case this.SCORE_EMOJI:
                this.cultureG.printScores();
                break;
            case this.STOP_EMOJI:
                this.cultureG.stop();
                break;
        }
    }
}