// Java created from Qore class V8::TypeScriptProgram
package qore.V8;

/** @brief Program for embedding and executing TypeScript code with runtime transpilation to JavaScript
   @par Restrictions:
    @ref Qore::PO_NO_EMBEDDED_LOGIC

TypeScript source code is transpiled to JavaScript using Node.js's built-in
    \c stripTypeScriptTypes() API (requires Node.js 24+) before execution. The transpilation
    uses \c transform mode, which handles type stripping, enums, and namespace transformation.

    All methods from @ref JavaScriptProgram are inherited and work identically.
*/
public class TypeScriptProgram extends qore.V8.JavaScriptProgram {
    // TypeScriptProgram::constructor(string source_code, string source_label) {}
    /** @brief Creates the object, transpiles the TypeScript source to JavaScript, and executes it
     @par Code Flags:
        @ref NAMED_ARGS
    
        @param source_code the TypeScript source to transpile and execute
        @param source_label the label or file name of the source
    
        @throw JAVASCRIPT-PROGRAM-ERROR error initializing the program
        @throw JAVASCRIPT-EXCEPTION error in the TypeScript source code (syntax error, etc.)
    */
    public TypeScriptProgram(String source_code, String source_label) throws Throwable {
    }

}
