import { User } from "discord.js";

export class ScoreManager {

    private scores: Map<User, number> = new Map();

    addPoints(user: User, number: number) {
        if(this.scores.has(user)) {
           this.scores.set(user, this.scores.get(user) + number)
        } else {
           this.scores.set(user, number)
        }
        console.log(this.getScoreMessage());
    }

    getScoreMessage(): string {
        let message = "👑";
        const sortedScores = new Map([...this.scores.entries()].sort((a, b) => b[1] - a[1]));
        for(const score of sortedScores) {
            message += score[0].username + ": " + score[1] + " points \n"
        }
        return message;
    }
}