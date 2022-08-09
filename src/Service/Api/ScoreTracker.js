const { maxBy } = require('lodash')

const { BurgerPoints, SpriteType  } = require('./enums')

class TeamScore {
    constructor() {
        this.score = 0
        this.streak = 0

    }

    decreaseScore() {
        // Invalid orders also reset the streak
        this.streak = 0
        // Minimum score is 0
        if (this.score > 0) {
            this.score -= 1
        }
    }

    resetStreak() {
        this.streak = 0
    }

    increaseScore() {
        // Add points to score based on delivered burger
        this.score += 1
    }

    reset() {
        this.score = 0
        this.streak = 0
    }
}

class ScoreTracker {
    constructor(teamNames, minScoreToWinGame) {
        // Keep track of team names so we can keep the order of the teams
        this.teamNames = teamNames
        this.scores = {}
        // Amount of points needed to win the game
        this.minScoreToWinGame = minScoreToWinGame
        teamNames.forEach(name => {
            this.scores[name] = new TeamScore()
        })
    }

    increaseScore(teamName) {
        this.scores[teamName].increaseScore()
    }

    decreaseScore(teamName) {
        this.scores[teamName].decreaseScore()
    }

    reset() {
        Object.values(this.scores).map(s => s.reset())
    }

    toArray() {
        // Return team scores as an array based on team name order
        // TODO: This is not ideal. Just doing this for now to match
        // expected format of frontend client
        return this.teamNames.map(name => this.scores[name].score)
    }

    hasWinner() {
        return Object.values(this.scores).filter(s => s.score >= this.minScoreToWinGame).length > 0
    }

    getLeadingTeamName() {
        // Gets the name of the team that currently has the lead in the game
        const [team, _] = maxBy(Object.entries(this.scores), (e) => e[1].score)
        // The team name is stored as an string when added a key to the object, which
        // is why we need to convert it to an integer
        return parseInt(team)
    }
}

module.exports = ScoreTracker
