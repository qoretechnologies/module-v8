cmake_minimum_required(VERSION 3.5)
project(qore-v8-module)

set (VERSION_MAJOR 1)
set (VERSION_MINOR 0)
set (VERSION_PATCH 3)

set(PROJECT_VERSION "${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}")

if (${CMAKE_VERSION} VERSION_GREATER_EQUAL "3.12.0")
    cmake_policy(SET CMP0074 NEW)

    if (${CMAKE_VERSION} VERSION_GREATER_EQUAL "3.18.0")
        cmake_policy(SET CMP0053 NEW)
    endif()
endif()

cmake_policy(SET CMP0042 NEW)

if (UNIX AND NOT APPLE)
    set(LINUX TRUE)
endif()

find_package(Qore 2.0 REQUIRED)

find_library(LIBNODE NAMES node HINTS ENV NODE_LIB_DIR REQUIRED)

if (DEFINED ENV{NODE_INCLUDE_DIR})
    include_directories(BEFORE "$ENV{NODE_INCLUDE_DIR}")
elseif(EXISTS /usr/include/node/node.h)
    include_directories(BEFORE "/usr/include/node")
endif()

if (DEFINED ENV{V8_CPPGC_INCLUDE_DIR})
    include_directories(BEFORE "$ENV{V8_CPPGC_INCLUDE_DIR}")
endif()

#set(V8_COMPILE_FLAGS "-DV8_COMPRESS_POINTERS -DV8_31BIT_SMIS_ON_64BIT_ARCH")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${V8_COMPILE_FLAGS}")

# Check for C++20
include(CheckCXXCompilerFlag)
CHECK_CXX_COMPILER_FLAG("-std=c++20" COMPILER_SUPPORTS_CXX17)
if(COMPILER_SUPPORTS_CXX17)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20")
else()
    message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++20 support. Please use a different C++ compiler.")
endif()

#add_custom_command(OUTPUT ${CMAKE_SOURCE_DIR}/ts/dist/index.js
#    COMMAND yarn install
#    COMMAND yarn build
#    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/ts
#    COMMENT "Building typescript API"
#    VERBATIM
#)

set(QPP_SRC
    src/QC_JavaScriptProgram.qpp
    src/QC_JavaScriptObject.qpp
    src/QC_JavaScriptPromise.qpp
)

set(CPP_SRC
    src/v8-module.cpp
    src/QoreV8Program.cpp
    src/QoreV8Object.cpp
    src/QoreV8Promise.cpp
    src/QoreV8CallStack.cpp
    src/QoreV8StackLocationHelper.cpp
    src/QoreV8CallReference.cpp
)

set(QMOD
    qlib/TypeScriptProxy
    qlib/TypeScriptActionInterface
)

# binaries to install
set (JS_BIN_FILES
    bin/ts-proxy
    bin/netsuite-make-generic-schema
)

install(PROGRAMS ${JS_BIN_FILES}
    TYPE BIN
)

qore_wrap_qpp_value(QPP_SOURCES ${QPP_SRC})

foreach (it ${QPP_SOURCES})
    GET_FILENAME_COMPONENT(_outfile ${it} NAME_WE)
    set(QPP_DOX ${QPP_DOX} ${CMAKE_CURRENT_BINARY_DIR}/${_outfile}.dox.h)
endforeach()

set(module_name "v8")

set(QORE_DOX_TMPL_SRC
    docs/mainpage.dox.tmpl
)

add_library(${module_name} MODULE ${CPP_SRC} ${QPP_SOURCES})

include_directories(${CMAKE_SOURCE_DIR}/src)
#include_directories(${Python3_INCLUDE_DIRS})
target_include_directories(${module_name} PRIVATE $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}/include>)

add_custom_target(QORE_INC_FILES DEPENDS ${QORE_INC_SRC})
add_dependencies(${module_name} QORE_INC_FILES)

target_link_libraries(${module_name} ${QORE_LIBRARY})

set(MODULE_DOX_INPUT ${CMAKE_CURRENT_BINARY_DIR}/mainpage.dox ${JAVA_JAR_SRC_STR} ${QPP_DOX})
string(REPLACE ";" " " MODULE_DOX_INPUT "${MODULE_DOX_INPUT}")
#message(STATUS mdi: ${MODULE_DOX_INPUT})

if (DEFINED ENV{DOXYGEN_EXECUTABLE})
    set(DOXYGEN_EXECUTABLE $ENV{DOXYGEN_EXECUTABLE})
endif()

set(MODULE_DOX_INPUT ${CMAKE_BINARY_DIR})
qore_external_binary_module(${module_name} ${PROJECT_VERSION} ${LIBNODE})

qore_user_modules("${QMOD}")
qore_external_user_module("qlib/TypeScriptProxy" "")
qore_external_user_module("qlib/TypeScriptActionInterface" "TypeScriptProxy")

qore_dist(${PROJECT_VERSION})

qore_config_info()

if (DOXYGEN_FOUND)
    qore_wrap_dox(QORE_DOX_SRC ${QORE_DOX_TMPL_SRC})
    add_custom_target(QORE_MOD_DOX_FILES DEPENDS ${QORE_DOX_SRC})
    add_dependencies(docs-module QORE_MOD_DOX_FILES)
endif()
