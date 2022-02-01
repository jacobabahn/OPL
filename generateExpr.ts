import { argv } from 'process'
import { writeFileSync } from 'fs'
import Colors from './colors'

const dependencies = [
    'import Token from "./token"'
]

const expTypes = [
    "Binary   : left: Expr, operator: Token, right: Expr",
    "Grouping : expression: Expr",
    "Literal  : value: unknown",
    "Unary    : operator: Token, right: Expr"
]

const defineType = (baseName: string, className: string, fields: string): string => {
    let output: string = ''

    //Define the class
    output += `export class ${ className } extends ${ baseName } {\n`

    //Generate the members of the class
    const fieldArr: string[] = fields.split(',')
    fieldArr.forEach(field => {
        const name: string = field.trim().substring(0, field.trim().indexOf(':'))
        const type = field.trim().split(' ')[1]
        output += `    readonly ${ name }: ${ type }\n`
    })

    //Generate the constructor for the class
    output += `\n    constructor(${ fields }) {\n        super()\n`
    fieldArr.forEach(field => {
        const name = field.trim().substring(0, field.trim().indexOf(':'))
        output += `        this.${ name } = ${ name }\n`
    })
    output += '    }\n\n'

    output += `    accept = <R>(visitor: Visitor<R>): R => {
        return visitor.visit${ className + baseName }(this)
    }`

    output += '\n}\n\n'

    return output
}

const defineVisitor = (baseName: string) => {
    let output: string = `export interface Visitor<R> {\n`
    
    for (const type of expTypes) {
        const className = type.split(':')[0].trim()
        output += `    visit${ className + baseName }(${ baseName.toLocaleLowerCase() }: ${ className }): R\n`
    }
    output += '}\n\n'

    return output
}

const defineAst = (path: string, baseName: string) => {
    let output: string = ''

    //Add in dependencies
    output += dependencies.join('\n')

    //Generate the visitor interfaces
    output += `\n\n${ defineVisitor(baseName) }`

    //Generate the base abstract class
    output += `export abstract class ${ baseName } {\n    abstract accept<R>(visitor: Visitor<R>): R\n}\n\n`

    for (const type of expTypes) {
        const className = type.split(':')[0].trim()
        const fields = type.substring(type.indexOf(':') + 1).trim()
        output += defineType(baseName, className, fields)
    }

    writeFileSync(path, output.trim(), { flag: 'w' })
}

const main = (): void => {
    const args = argv.slice(2)

    if (args.length !== 1)
        console.log(`${ Colors.RED }Incorrect arguments.${ Colors.RESET }\nUsage: expgen [path]`)
    else
        defineAst(args[0], 'Expr')
}

main()