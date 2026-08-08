//! V8 namespace
namespace V8 {
//! Object for embedding and executing JavaScript code
/***/
class JavaScriptObject {

public:
//! Call the object as a function and return the result
/** @param js_this the "this" object to call the function on
    @param ... arguments to the function should follow the name converted to JavaScript values as per
    @ref javascript_qore_to_javascript

    @return the return value of the JavaScript function converted to Qore as per @ref javascript_javascript_to_qore

    @see @ref javascript_exceptions
*/
auto callAsFunction(auto js_this,  ...);

public:
//! Call the object as a function and return the result
/** @param js_this the "this" object to call the function on
    @param argv arguments to the function as a list converted to JavaScript values as per
    @ref javascript_qore_to_javascript

    @return the return value of the JavaScript function converted to Qore as per @ref javascript_javascript_to_qore

    @see @ref javascript_exceptions
*/
auto callAsFunctionArgs(auto js_this, __7_ softlist<auto> argv);

public:
//! Creates the object
/** @param pgm the JavaScriptProgram where the object will be created from
*/
 constructor(JavaScriptProgram pgm);

public:
//! Returns the value for the array index, if any
/** @return the value for the array index, if any
*/
auto getIndexValue(int i);

public:
//! Returns the QoreV8Object that contains this object
/** @return the QoreV8Object that contains this object
*/
JavaScriptProgram getProgram();

public:
//! Returns the value for the given key, if any
/** @return the value for the given key, if any
*/
auto getProperty(string property);

public:
//! Returns a list of object properties, if any
/** @return a list of object properties, if any
*/
__7_ list<string> getPropertyList();

public:
//! Returns @ref True if the object is callable as a function
/** @return @ref True if the object is callable as a function
*/
bool isCallable();

public:
//! Returns @ref True if the object is a constructor
/** @return @ref True if the object is a constructor
*/
bool isConstructor();

public:
//! Returns the value of the given JavaScript object property
/** @param m the property name

    @return the value of the property
*/
auto memberGate(string m);

public:
//! Calls the JavaScript method and returns the response
/** @param m the method name
    @param ... any argument to the method

    @return the response from the JavaScript method
*/
auto methodGate(string m,  ...);

public:
//! Sets the value of the given property
/** @param property the name of the property to set
    @param value the value to set
*/
nothing setProperty(string property, auto value);

public:
//! Returns the object as data; a hash, list, or call reference
/** @return converts the object to Qore data; a hash, list, or call reference

    @note if the current object is a callable object, it will be returned as a call reference to a JavaScript call
    without a context for JavaScript \c this
*/
auto toData();

public:
//! Returns the string representation of the object
/** @return the string representation of the object
*/
string toString();
};
}
