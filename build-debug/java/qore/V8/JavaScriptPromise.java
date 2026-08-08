// Java created from Qore class V8::JavaScriptPromise
package qore.V8;

/** @brief Promise for embedding and executing JavaScript code
   */
public class JavaScriptPromise extends qore.V8.JavaScriptObject {
    // JavaScriptPromise JavaScriptPromise::doCatch(code catch_code){}
    /** @brief Runs the given code asynchronously if the Promise throws an asynchronous error
     @param catch_code the code to run if the Promise throws an asynchronous error
    */
    public qore.Qore.JavaScriptPromise doCatch(org.qore.jni.QoreClosure catch_code) throws Throwable {
    }

    // auto JavaScriptPromise::getResult(){}
    /** @brief Returns the result of the promise
     @return the result of the promise
    
        @throw PROMISE-PENDING The Promise has not yet been resolved
    */
    public Object getResult() throws Throwable {
    }

    // int JavaScriptPromise::getState(){}
    /** @brief Returns the state of the Promise
     @return the state of the Promise'; see @ref promise_states for possible values
    */
    public long getState() throws Throwable {
    }

    // bool JavaScriptPromise::hasHandler(){}
    /** @brief Returns @ref True if the Promise has a handler
     @return @ref True if the Promise has a handler
    */
    public boolean hasHandler() throws Throwable {
    }

    // auto JavaScriptPromise::memberGate(string m){}
    /** @brief Returns the value of the given JavaScript promise property
     @param m the property name
    
        @return the value of the property
    */
    public Object memberGate(String m) throws Throwable {
    }

    // auto JavaScriptPromise::methodGate(string m, ...){}
    /** @brief Calls the JavaScript method and returns the response
     @param m the method name
        @param ... any argument to the method
    
        @return the response from the JavaScript method
    */
    public Object methodGate(String m) throws Throwable {
    }

    // JavaScriptPromise JavaScriptPromise::then(code then_code, *code reject_code){}
    /** @brief Runs the given code asynchronously when the Promise resolves
     @param then_code the code to run when the Promise resolves, the value of the Promise is used as the argument to
        the code
        @param reject_code the code to run if the Promise is rejected
    */
    public qore.Qore.JavaScriptPromise then(org.qore.jni.QoreClosure then_code, org.qore.jni.QoreClosure reject_code) throws Throwable {
    }

    // nothing JavaScriptPromise::wait(){}
    /** @brief Waits for the promise to resolve
     This also ensures that any background I/O is executed by spinning the UV event loop while waiting for the Promise
        to resolve
    */
    public qore.Qore. wait() throws Throwable {
    }

}
