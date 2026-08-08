// Java created from Qore class V8::JavaScriptObject
package qore.V8;

/** @brief Object for embedding and executing JavaScript code
   */
public class JavaScriptObject {
    // auto JavaScriptObject::callAsFunction(auto js_this, ...){}
    /** @brief Call the object as a function and return the result
     @param js_this the "this" object to call the function on
        @param ... arguments to the function should follow the name converted to JavaScript values as per
        @ref javascript_qore_to_javascript
    
        @return the return value of the JavaScript function converted to Qore as per @ref javascript_javascript_to_qore
    
        @see @ref javascript_exceptions
    */
    public Object callAsFunction(Object js_this) throws Throwable {
    }

    // auto JavaScriptObject::callAsFunctionArgs(auto js_this, *softlist<auto> argv){}
    /** @brief Call the object as a function and return the result
     @param js_this the "this" object to call the function on
        @param argv arguments to the function as a list converted to JavaScript values as per
        @ref javascript_qore_to_javascript
    
        @return the return value of the JavaScript function converted to Qore as per @ref javascript_javascript_to_qore
    
        @see @ref javascript_exceptions
    */
    public Object callAsFunctionArgs(Object js_this, Object[] argv) throws Throwable {
    }

    // JavaScriptObject::constructor(JavaScriptProgram pgm) {}
    /** @brief Creates the object
     @param pgm the JavaScriptProgram where the object will be created from
    */
    public JavaScriptObject(qore.Qore.JavaScriptProgram pgm) throws Throwable {
    }

    // auto JavaScriptObject::getIndexValue(int i){}
    /** @brief Returns the value for the array index, if any
     @return the value for the array index, if any
    */
    public Object getIndexValue(long i) throws Throwable {
    }

    // JavaScriptProgram JavaScriptObject::getProgram(){}
    /** @brief Returns the QoreV8Object that contains this object
     @return the QoreV8Object that contains this object
    */
    public qore.Qore.JavaScriptProgram getProgram() throws Throwable {
    }

    // auto JavaScriptObject::getProperty(string property){}
    /** @brief Returns the value for the given key, if any
     @return the value for the given key, if any
    */
    public Object getProperty(String property) throws Throwable {
    }

    // *list<string> JavaScriptObject::getPropertyList(){}
    /** @brief Returns a list of object properties, if any
     @return a list of object properties, if any
    */
    public Object[] getPropertyList() throws Throwable {
    }

    // bool JavaScriptObject::isCallable(){}
    /** @brief Returns @ref True if the object is callable as a function
     @return @ref True if the object is callable as a function
    */
    public boolean isCallable() throws Throwable {
    }

    // bool JavaScriptObject::isConstructor(){}
    /** @brief Returns @ref True if the object is a constructor
     @return @ref True if the object is a constructor
    */
    public boolean isConstructor() throws Throwable {
    }

    // auto JavaScriptObject::memberGate(string m){}
    /** @brief Returns the value of the given JavaScript object property
     @param m the property name
    
        @return the value of the property
    */
    public Object memberGate(String m) throws Throwable {
    }

    // auto JavaScriptObject::methodGate(string m, ...){}
    /** @brief Calls the JavaScript method and returns the response
     @param m the method name
        @param ... any argument to the method
    
        @return the response from the JavaScript method
    */
    public Object methodGate(String m) throws Throwable {
    }

    // nothing JavaScriptObject::setProperty(string property, auto value){}
    /** @brief Sets the value of the given property
     @param property the name of the property to set
        @param value the value to set
    */
    public void setProperty(String property, Object value) throws Throwable {
    }

    // auto JavaScriptObject::toData(){}
    /** @brief Returns the object as data; a hash, list, or call reference
     @return converts the object to Qore data; a hash, list, or call reference
    
        @note if the current object is a callable object, it will be returned as a call reference to a JavaScript call
        without a context for JavaScript \c this
    */
    public Object toData() throws Throwable {
    }

    // string JavaScriptObject::toString(){}
    /** @brief Returns the string representation of the object
     @return the string representation of the object
    */
    public String toString() throws Throwable {
    }

}
