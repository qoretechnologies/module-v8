# Writes OUTPUT, a header that defines the macro NAME as the text of INPUT (a JavaScript source) in a raw string
# literal (qoretechnologies/qore#6845)
file(READ "${INPUT}" _js)
string(FIND "${_js}" ")QOREJS\"" _found)
if (NOT _found EQUAL -1)
    message(FATAL_ERROR "${INPUT} contains the raw string delimiter )QOREJS\"")
endif()
file(WRITE "${OUTPUT}" "// generated from ${INPUT}; do not edit\n#define ${NAME} R\"QOREJS(${_js})QOREJS\"\n")
