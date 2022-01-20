import { readFileSync } from 'fs';
import { relative } from 'path/win32';
import Scanner from "./Scanner";

class Lox {
    hadError: boolean = false;

    main = (args: string[]): void => {
        if (args.length > 1) {
            console.log("Usage: jlox [script]")
            process.exit(64)
        }
        else if (args.length === 1) {
            this.runFile(args[0])
        } else {
            this.runPrompt()
        }
    }

    private runFile = (path: string): void => {
        const file = readFileSync(path, { encoding: "utf8" })
        this.run(file)

        if (this.hadError)
            process.exit(65)
    }

    private runPrompt = (): void => {
        const readline = require("readline")

        const line = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        const promptLoop = () => {
            line.question("> ", (response: string) => {
                if (response === null) {
                    process.exit(1)
                }

                this.run(response)

                if (this.hadError)
                    process.exit(65)
                
                promptLoop()
            })
        }

        promptLoop()
    }

    private run = (source: string) => {
        const scanner = new Scanner(source)
        const tokens = scanner.scanTokens()

        for (const token of tokens) {
            console.log(token)
        }
    }

    error = (line: number, message: string): void => {
        this.report(line, "", message)
    }

    report = (line: number, where: string, message: string): void => {
        console.error(`[line ${line}] Error${where}: ${message}`)
        this.hadError = true
    }
}

let instance: Lox = new Lox()
instance.main(process.argv.slice(2))

export { Lox, instance }