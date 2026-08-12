cmake_minimum_required(VERSION 3.10)
project(qore-v8-module)

set (VERSION_MAJOR 2)
set (VERSION_MINOR 1)
set (VERSION_PATCH 0)

set(PROJECT_VERSION "${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}")

if (${CMAKE_VERSION} VERSION_GREATER_EQUAL "3.12.0")
    cmake_policy(SET CMP0074 NEW)

    if (${CMAKE_VERSION} VERSION_GREATER_EQUAL "3.18.0")
        cmake_policy(SET CMP0053 NEW)
    endif()
endif()

cmake_policy(SET CMP0042 NEW)
if (POLICY CMP0177)
    cmake_policy(SET CMP0177 NEW)
endif()

if (UNIX AND NOT APPLE)
    set(LINUX TRUE)
endif()

find_package(Qore 2.0 REQUIRED)

# Locate libnode. When NODE_LIB_DIR is set we MUST use the libnode in that
# directory; falling back to a system libnode while including Node headers
# from somewhere else leads to header/library version mismatches (e.g.
# undefined symbol v8::api_internal::GetFunctionTemplateData when Node 24
# headers are compiled against Node 22's libnode).
if (DEFINED ENV{NODE_LIB_DIR})
    find_library(LIBNODE NAMES node
        HINTS ENV NODE_LIB_DIR
        NO_DEFAULT_PATH)
    if (NOT LIBNODE)
        # Some Node tarballs ship only the versioned soname (e.g.
        # libnode.so.137) without the unversioned development symlink.
        # Pick the highest-numbered versioned library in NODE_LIB_DIR.
        file(GLOB _node_versioned_libs "$ENV{NODE_LIB_DIR}/libnode.so.*"
                                       "$ENV{NODE_LIB_DIR}/libnode.*.dylib")
        if (_node_versioned_libs)
            list(SORT _node_versioned_libs)
            list(REVERSE _node_versioned_libs)
            list(GET _node_versioned_libs 0 LIBNODE)
            set(LIBNODE "${LIBNODE}" CACHE FILEPATH "libnode location" FORCE)
        endif()
    endif()
    if (NOT LIBNODE)
        message(FATAL_ERROR "NODE_LIB_DIR=$ENV{NODE_LIB_DIR} is set but no libnode was found there")
    endif()
else()
    find_library(LIBNODE NAMES node REQUIRED)
endif()
message(STATUS "Using libnode: ${LIBNODE}")

# Determine the Node include directory we will compile against and verify
# that it matches the libnode we'll link to. A mismatch silently produces
# a .qmod that fails at load time with undefined v8::api_internal::* symbols.
if (DEFINED ENV{NODE_INCLUDE_DIR})
    set(_node_include_dir "$ENV{NODE_INCLUDE_DIR}")
elseif(EXISTS /usr/include/node/node_version.h)
    set(_node_include_dir "/usr/include/node")
endif()

if (_node_include_dir AND EXISTS "${_node_include_dir}/node_version.h")
    file(STRINGS "${_node_include_dir}/node_version.h" _node_ver_line
        REGEX "^#define[ \t]+NODE_MODULE_VERSION[ \t]+")
    string(REGEX REPLACE ".*NODE_MODULE_VERSION[ \t]+([0-9]+).*" "\\1"
        _node_header_modver "${_node_ver_line}")

    # libnode's SOVERSION is NODE_MODULE_VERSION; extract it from the
    # resolved library path or from its actual soname.
    get_filename_component(_libnode_real "${LIBNODE}" REALPATH)
    get_filename_component(_libnode_name "${_libnode_real}" NAME)
    string(REGEX MATCH "libnode\\.so\\.([0-9]+)" _m "${_libnode_name}")
    set(_libnode_modver "${CMAKE_MATCH_1}")
    if (NOT _libnode_modver)
        string(REGEX MATCH "libnode\\.([0-9]+)\\.dylib" _m "${_libnode_name}")
        set(_libnode_modver "${CMAKE_MATCH_1}")
    endif()

    if (_node_header_modver AND _libnode_modver
        AND NOT _node_header_modver STREQUAL _libnode_modver)
        message(FATAL_ERROR
            "Node header/library mismatch: headers in ${_node_include_dir} "
            "report NODE_MODULE_VERSION=${_node_header_modver}, but ${LIBNODE} "
            "resolves to ${_libnode_real} (NODE_MODULE_VERSION=${_libnode_modver}). "
            "Set NODE_LIB_DIR to the matching Node install or fix NODE_INCLUDE_DIR.")
    endif()
    message(STATUS "Node module ABI version: ${_node_header_modver}")
endif()

if (_node_include_dir)
    include_directories(BEFORE "${_node_include_dir}")
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
    src/QC_TypeScriptProgram.qpp
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
    src/QoreV8NamespaceWrapper.cpp
    src/QoreV8ClassWrapper.cpp
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

qore_wrap_qpp_value(QPP_SOURCES METALIST QPP_META_SRC ${QPP_SRC})

foreach (it ${QPP_SOURCES})
    GET_FILENAME_COMPONENT(_outfile ${it} NAME_WE)
    set(QPP_DOX ${QPP_DOX} ${CMAKE_CURRENT_BINARY_DIR}/${_outfile}.dox.h)
endforeach()

set(module_name "v8")

set(QORE_DOX_TMPL_SRC
    docs/mainpage.dox.tmpl
)
file(MAKE_DIRECTORY "${CMAKE_BINARY_DIR}/images")

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

# Reconcile the installed i18n catalog root against the fragments these modules
# currently own.  Installing catalogs is otherwise additive: TypeScriptActionInterface
# described apps that have since migrated to native Qore providers, and its fragments
# for them stayed installed, so catalog discovery composed both descriptions of the
# same app and provider presentation refused to choose between them.
#
# This must come after every qore_external_user_module() call above, both because
# those calls record the fragment set and because install() rules run in declaration
# order, which is what publishes the manifest after the fragments it describes.
# Removals are scoped to this project, so fragments Qore and other products install
# into the same shared catalog root are untouched.
#
# Guarded like qore_install_qpp_metadata() below: the helper arrived in Qore 2.3,
# while this module only requires 2.0.
if (COMMAND qore_finalize_catalog_install)
    qore_finalize_catalog_install()
endif()

qore_dist(${PROJECT_VERSION})

# install qpp metadata files
if (COMMAND qore_install_qpp_metadata)
    qore_install_qpp_metadata(${module_name} ${QPP_META_SRC})
else()
    install(FILES ${QPP_META_SRC}
            DESTINATION ${CMAKE_INSTALL_DATADIR}/qore/metadata)
endif()

qore_config_info()

if (DOXYGEN_FOUND)
    qore_wrap_dox(QORE_DOX_SRC ${QORE_DOX_TMPL_SRC})
    add_custom_target(QORE_MOD_DOX_FILES DEPENDS ${QORE_DOX_SRC})
    add_dependencies(docs-module QORE_MOD_DOX_FILES)
endif()
