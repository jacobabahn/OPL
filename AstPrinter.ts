import * as Expr from "./Expr"

class AstPrinter implements Expr.Visitor<string> {

    printExpr(expr: Expr.Expr): string {
        return expr.accept(this)
    }

    // printStmt(stmt: Stmt.Stmt): string {
    //     return stmt.accept(this)
    // }

    // Statement Visits
    // visitBlockStmt(stmt: Stmt.Block): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitClassStmt(stmt: Stmt.Class): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitExpressionStmt(stmt: Stmt.Expression): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitFuncStmt(stmt: Stmt.Func): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitIfStmt(stmt: Stmt.If): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitPrintStmt(stmt: Stmt.Print): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitReturnStmt(stmt: Stmt.Return): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitVarStmt(stmt: Stmt.Var): string {
    //     throw new Error("Method not implemented.");
    // }
    // visitWhileStmt(stmt: Stmt.While): string {
    //     throw new Error("Method not implemented.");
    // }


    // Expression Visits
    // visitAssignExpr(expr: Expr.Assign): string {
    //     throw new Error("Method not implemented.");
    // }

    visitBinaryExpr(expr: Expr.Binary): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
    }

    // visitCallExpr(expr: Expr.Call): string {
    //     throw new Error("Method not implemented.");
    // }

    // visitGetExpr(expr: Expr.Get): string {
    //     throw new Error("Method not implemented.");
    // }

    visitGroupingExpr(expr: Expr.Grouping): string {
        return this.parenthesize("group", expr.expression)
    }

    visitLiteralExpr(expr: Expr.Literal): string {
        if (expr.value == null) 
            return "nil"
        return String(expr.value)
    }

    // visitLogicalExpr(expr: Expr.Logical): string {
    //     throw new Error("Method not implemented.");
    // }

    // visitSetExpr(expr: Expr.Set): string {
    //     throw new Error("Method not implemented.");
    // }

    // visitSuperExpr(expr: Expr.Super): string {
    //     throw new Error("Method not implemented.");
    // }

    // visitThisExpr(expr: Expr.This): string {
    //     throw new Error("Method not implemented.");
    // }

    visitUnaryExpr(expr: Expr.Unary): string {
        return this.parenthesize(expr.operator.lexeme, expr.right)
    }

    // visitVariableExpr(expr: Expr.Variable): string {
    //     throw new Error("Method not implemented.");
    // }

    visitTernaryExpr(expr: Expr.Ternary): string {
        return ""
    }

    private parenthesize(name: string, ...exprs: Expr.Expr[]) {
        let output = `(${name}`
        for (const expr of exprs) {
            output += ` ${expr.accept(this)}`
        }
        output += ")"


        return output
    }

    // private transform(input: string, ...parts: Object[]){
    //     for (const part of parts){
    //         input += " "
    //         if (part instanceof Expr.Expr){
    //             input += part.accept(this)
    //         } else if (part instanceof Stmt){

    //         }
    //     }
    // }



}

// just for testing.

// function main() {
//     let expression: Expr.Expr = new Expr.Binary(
//         new Expr.Unary(
//             new Token(TokenType.MINUS, "-", null, 1),
//             new Expr.Literal(123)),
//         new Token(TokenType.STAR, "*", null, 1),
//         new Expr.Grouping(
//             new Expr.Literal(45.67)));

//     console.log(new AstPrinter().printExpr(expression));
// }

// main()

export default AstPrinter