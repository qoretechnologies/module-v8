// Java created from Qore class V8::JavaScriptProgram
package qore.V8;

/** @brief Program for embedding and executing JavaScript code
   @par Restrictions:
    @ref Qore::PO_NO_EMBEDDED_LOGIC

*/
public class JavaScriptProgram {
    // JavaScriptProgram::constructor(string source_code, string source_label) {}
    /** @brief Creates the object and parses and runs the given source code
     @param source_code the JavaScript source to parse and compile
        @param source_label the label or file name of the source
    */
    public JavaScriptProgram(String source_code, String source_label) throws Throwable {
    }

    // JavaScriptObject JavaScriptProgram::getGlobal(){}
    /** @brief Returns the global proxy object
    @return the global proxy object
    */
    public qore.Qore.JavaScriptObject getGlobal() throws Throwable {
    }

    // nothing JavaScriptProgram::setSaveReferenceCallback(*code save_ref_callback){}
    /** @brief Sets the "save reference" callback for %Qore data stored in JavaScript objects
     @par Restrictions:
        @ref Qore::PO_NO_PROCESS_CONTROL
    
        @par Example:
        @code{.py}
    hash<auto> ref_cache;
    code callback = sub (auto v) {
        # save reference to value in cache, so it doesn't go out of scope
        object_cache{v.uniqueHash()} = v;
    }
    v8pgm.setSaveReferenceCallback(callback);
        @endcode
    
        @param save_ref_callback the callback to save any %Qore values stored in Python code
    
        Due to the differences in garbage collection approaches between %Qore and JavaScript, %Qore objects must be
        managed with a deterministic life cycle; JavaScript objects have only weak references to %Qore values due to the
        lack of destructors in JavaScript and the lack of determinism in the JavaScript runtime for object lifecycle
        management.
    
        The callback set here will be called any time a %Qore reference is stored in a Python object; if no callback is
        set, then the standard thread-local implementation is used where %Qore references are saved in a thread-local
        hash.
    
        @see @ref v8_qore_reference_lifecycle_management for more information
    */
    public qore.Qore. setSaveReferenceCallback(org.qore.jni.QoreClosure save_ref_callback) throws Throwable {
    }

    // int JavaScriptProgram::spinEventLoop(){}
    /** @brief Spins the event loop the program
    */
    public long spinEventLoop() throws Throwable {
    }

    // int JavaScriptProgram::spinOnce(){}
    /** @brief Spins the event loop once for the program
    */
    public long spinOnce() throws Throwable {
    }

}
