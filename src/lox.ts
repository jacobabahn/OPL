import { readFileSync, stat } from 'fs';
import Scanner from "./Scanner";
import Token from './Token';
import { TokenType } from "./TokenType";
import Parser from './parser';
import RpnPrinter from './RpnPrinter';
import { Interpreter } from './Interpreter';
import { argv } from 'process';

const interpreter = new Interpreter()
let hadError: boolean = false
let hadRuntimeError = false
let rpn = false
let print = true

const main = (): void => {
    let args = argv.slice(2)
    if (args.includes("rpn")) {
        rpn = true
        args.splice(args.indexOf("rpn"), 1)
    }
    if (args.includes("no-output")) {
        args.splice(args.indexOf("no-output"), 1)
        print = false
    }

    if (args.length > 1) {
        console.log("Usage: jlox [script]")
        process.exit(64)
    }
    else if (args.length === 1) {
        runFile(args[0])
    } else {
        runPrompt()
    }
}

const runFile = (path: string): void => {
    const file = readFileSync(path, { encoding: "utf8" })
    run(file)

    if (hadError)
        // process.exit(65)
        return

    if (hadRuntimeError)
        // process.exit(70)
        return
}

const runPrompt = (): void => {
    const readline = require("readline")

    const line = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const promptLoop = () => {
        line.question(">", (response: string) => {
            if (response === null) {
                // process.exit(1)
                // return
            }

            run(response)

            hadError = false
            promptLoop()
        })
    }

    promptLoop()
}

const run = (source: string) => {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()

    const parser = new Parser(tokens)
    const statements = parser.parse()

    if (hadError) 
        return
    if (rpn) {
        // console.log(new RpnPrinter().printExpr(statements))
    } else {
        interpreter.interpret(statements)
    }
}

const error = (line: number, message: string): void => {
    report(line, "", message)
}

const runtimeError = (error: any): void => {
    console.log(`${error.message} \n[line ${error.token.line}]`)
    hadRuntimeError = true
}

const errorToken = (token: Token, message: string): any => {
    if (token.type === TokenType.EOF) {
        report(token.line, " at end", message)
    } else {
        report(token.line, ` at '${token.lexeme}'`, message)
    }
}

const report = (line: number, where: string, message: string): void => {
    console.log(`[line ${line}] Error${where}: ${message}`)
    hadError = true
}

main()

export { errorToken, error, runtimeError }