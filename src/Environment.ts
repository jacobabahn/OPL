import Token from './Token';

class Environment {
    values = {}

    get(name: Token) {
        if (name.lexeme in this.values) {
            return this.values[name.lexeme]
        }

        throw new Error(`Undefined variable '${name.lexeme}.'`)
    }

    assign(name, value): void {
        if (name.lexeme in this.values) {
            this.values[name.lexeme] = value
            return
        }

        throw new Error(`Undefined variable '${name.lexeme}.'`)
    }

    define(name, value): void {
        this.values[name] = value
    }
}

export default Environment;