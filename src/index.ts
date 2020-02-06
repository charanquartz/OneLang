import { PackageManager, PackagesFolderSource } from "./StdLib/PackageManager";
import { readFile } from "./Utils/NodeUtils";
import { OneCompiler } from "./OneCompiler";
import { ExprLangLexer } from "./Generator/ExprLang/ExprLangLexer";
import { ExprLangParser } from "./Generator/ExprLang/ExprLangParser";
import { ExprLangAst } from "./Generator/ExprLang/ExprLangAst";
import { ExprLangAstPrinter } from "./Generator/ExprLang/ExprLangAstPrinter";
import { ExprLangVM, VariableContext, VariableSource } from "./Generator/ExprLang/ExprLangVM";
import { AstHelper } from "./One/AstHelper";
import { OverviewGenerator } from "./One/OverviewGenerator";
import * as LangConfigs from "./Generator/LangConfigs";

const rootDir = `${__dirname}/..`;

class OneLangGlobal {
    getCapabilities() { 
        return { 
            sourceLanguages: ['typescript', 'php', 'ruby', 'csharp' ],
            targetLanguages: ['cpp', 'csharp', 'go', 'java', 'javascript', 'perl', 'php', 'python', 'ruby',' swift', 'typescript' ],
        }; 
    }

    async transpile(source: string, sourceLang: string, targetLang: string): Promise<string> {
        const pacMan = new PackageManager(new PackagesFolderSource());
        await pacMan.loadAllCached();

        const overlayCode = readFile(`${rootDir}/langs/NativeResolvers/${sourceLang}.ts`);
        const stdlibCode = pacMan.getInterfaceDefinitions();
        const genericTransforms = readFile(`${rootDir}/langs/NativeResolvers/GenericTransforms.yaml`);

        const compiler = new OneCompiler();
        compiler.setup(overlayCode, stdlibCode, genericTransforms);
        compiler.parse(sourceLang, source);

        const langYaml = readFile(`${rootDir}/langs/${targetLang}.yaml`);
        const langSchema = OneCompiler.parseLangSchema(langYaml, pacMan, compiler.stdlibCtx.schema);

        const codeGen = compiler.getCodeGenerator(langSchema);
        const generatedCode = codeGen.generate(false);
        return generatedCode;
    }
}

export const OneLang = new OneLangGlobal();
export { ExprLangLexer, ExprLangParser, ExprLangAst, ExprLangAstPrinter, ExprLangVM, VariableContext, VariableSource, OneCompiler, AstHelper, OverviewGenerator };
export { LangConfigs };