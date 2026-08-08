# Install script for directory: /home/david/src/qore/git/module-v8

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "debug")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "0")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set path to fallback-tool for dependency-resolution.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/bin" TYPE PROGRAM FILES
    "/home/david/src/qore/git/module-v8/bin/ts-proxy"
    "/home/david/src/qore/git/module-v8/bin/netsuite-make-generic-schema"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}/usr/lib64/qore-modules/v8-api-2.0.qmod" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}/usr/lib64/qore-modules/v8-api-2.0.qmod")
    file(RPATH_CHECK
         FILE "$ENV{DESTDIR}/usr/lib64/qore-modules/v8-api-2.0.qmod"
         RPATH "")
  endif()
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/lib64/qore-modules/v8-api-2.0.qmod")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/lib64/qore-modules" TYPE MODULE FILES "/home/david/src/qore/git/module-v8/build-debug/v8-api-2.0.qmod")
  if(EXISTS "$ENV{DESTDIR}/usr/lib64/qore-modules/v8-api-2.0.qmod" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}/usr/lib64/qore-modules/v8-api-2.0.qmod")
    if(CMAKE_INSTALL_DO_STRIP)
      execute_process(COMMAND "/usr/bin/strip" "$ENV{DESTDIR}/usr/lib64/qore-modules/v8-api-2.0.qmod")
    endif()
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  include("/home/david/src/qore/git/module-v8/build-debug/CMakeFiles/v8.dir/install-cxx-module-bmi-debug.cmake" OPTIONAL)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore-modules/TypeScriptProxy/TypeScriptProxy.qc;/usr/share/qore-modules/TypeScriptProxy/TypeScriptProxy.qm")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore-modules/TypeScriptProxy" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qm"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptInProcessPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramProxy.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataCache.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qm;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptAppRestConnection.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptDataField.qc")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore-modules/TypeScriptActionInterface" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptInProcessPool.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramPool.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramProxy.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataCache.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionFactory.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qm"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptAppRestConnection.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptDataField.qc"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore-modules/TypeScriptProxy/TypeScriptProxy.qc;/usr/share/qore-modules/TypeScriptProxy/TypeScriptProxy.qm")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore-modules/TypeScriptProxy" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qm"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(REMOVE
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy.qmod.d"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy/TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy/TypeScriptProxy.qmod.d"
)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(REMOVE
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy.qmod.d"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy/TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy/TypeScriptProxy.qmod.d"
)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore/metadata/v8/TypeScriptProxy.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptProxy.qm.meta.json")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore/metadata/v8" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptProxy/TypeScriptProxy.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptProxy/TypeScriptProxy.qm.meta.json"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(REMOVE
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy.qmod.d"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy/TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy/TypeScriptProxy.qmod.d"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy.qmod"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy.qmod.d"
)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  
set(_qore_qmod_dir "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy")
set(_qore_qmod_dst "${_qore_qmod_dir}/TypeScriptProxy.qmod")
set(_qore_qmod_tmp "${_qore_qmod_dst}.inst.tmp")
file(MAKE_DIRECTORY "${_qore_qmod_dir}")
file(REMOVE "${_qore_qmod_tmp}")
# Stage the new bytes into a fresh inode in the destination directory, then
# atomically rename(2) it onto the final name.  cmake -E copy (rather than
# file(COPY_FILE), which needs CMake 3.21) keeps this working at the declared
# 3.14 floor.  Staging in the same directory keeps src and dst on one
# filesystem so the rename is a single atomic inode swap.
execute_process(COMMAND "${CMAKE_COMMAND}" -E copy "/home/david/src/qore/git/module-v8/build-debug/qlib-qmod/TypeScriptProxy/TypeScriptProxy.qmod" "${_qore_qmod_tmp}"
    RESULT_VARIABLE _qore_qmod_rc)
if (NOT _qore_qmod_rc EQUAL 0)
    message(FATAL_ERROR "failed to stage AOT qmod '/home/david/src/qore/git/module-v8/build-debug/qlib-qmod/TypeScriptProxy/TypeScriptProxy.qmod' -> '${_qore_qmod_tmp}': ${_qore_qmod_rc}")
endif()
file(RENAME "${_qore_qmod_tmp}" "${_qore_qmod_dst}")
message(STATUS "Atomically installed: ${_qore_qmod_dst}")

endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  set(_src_jar_dir "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptProxy/jar")
if (EXISTS "${_src_jar_dir}")
    set(_aot_mod_dir "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptProxy")
    file(MAKE_DIRECTORY "${_aot_mod_dir}")
    file(REMOVE_RECURSE "${_aot_mod_dir}/jar")
    file(CREATE_LINK "../../../share/qore-modules/TypeScriptProxy/jar" "${_aot_mod_dir}/jar" SYMBOLIC)
    message(STATUS "AOT jar dir symlink: ${_aot_mod_dir}/jar -> ../../../share/qore-modules/TypeScriptProxy/jar")
endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptInProcessPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramProxy.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataCache.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qm;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptAppRestConnection.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptDataField.qc")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore-modules/TypeScriptActionInterface" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptInProcessPool.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramPool.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramProxy.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataCache.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionFactory.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qm"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptAppRestConnection.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc"
    "/home/david/src/qore/git/module-v8/qlib/TypeScriptActionInterface/TypeScriptDataField.qc"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(REMOVE
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface.qmod.d"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface/TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface/TypeScriptActionInterface.qmod.d"
)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(REMOVE
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface.qmod.d"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qmod.d"
)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore/metadata/v8/JavaScriptInProcessPool.qc.meta.json;/usr/share/qore/metadata/v8/JavaScriptProgramPool.qc.meta.json;/usr/share/qore/metadata/v8/JavaScriptProgramProxy.qc.meta.json;/usr/share/qore/metadata/v8/JavaScriptThreadProcessPool.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionApiDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionApiWithSchemaDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionAppDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionDataCache.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionDataProviderBase.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionDataProviderFactory.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionEventDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionEventDataProviderBase.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionFactory.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionGoogleApiDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionInterface.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionInterface.qm.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionInterfacePriv.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionRecordBasedDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionRootDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionTablesDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptActionWebhookEventDataProvider.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptAppRestConnection.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptBulkRecordInterface.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptBulkRecordProxyInterface.qc.meta.json;/usr/share/qore/metadata/v8/TypeScriptDataField.qc.meta.json")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore/metadata/v8" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/JavaScriptInProcessPool.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/JavaScriptProgramPool.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/JavaScriptProgramProxy.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionDataCache.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionFactory.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionInterface.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionInterface.qm.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptAppRestConnection.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/qm-metadata/TypeScriptActionInterface/TypeScriptDataField.qc.meta.json"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(REMOVE
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface.qmod.d"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface/TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface/TypeScriptActionInterface.qmod.d"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface.qmod"
  "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface.qmod.d"
)
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  
set(_qore_qmod_dir "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface")
set(_qore_qmod_dst "${_qore_qmod_dir}/TypeScriptActionInterface.qmod")
set(_qore_qmod_tmp "${_qore_qmod_dst}.inst.tmp")
file(MAKE_DIRECTORY "${_qore_qmod_dir}")
file(REMOVE "${_qore_qmod_tmp}")
# Stage the new bytes into a fresh inode in the destination directory, then
# atomically rename(2) it onto the final name.  cmake -E copy (rather than
# file(COPY_FILE), which needs CMake 3.21) keeps this working at the declared
# 3.14 floor.  Staging in the same directory keeps src and dst on one
# filesystem so the rename is a single atomic inode swap.
execute_process(COMMAND "${CMAKE_COMMAND}" -E copy "/home/david/src/qore/git/module-v8/build-debug/qlib-qmod/TypeScriptActionInterface/TypeScriptActionInterface.qmod" "${_qore_qmod_tmp}"
    RESULT_VARIABLE _qore_qmod_rc)
if (NOT _qore_qmod_rc EQUAL 0)
    message(FATAL_ERROR "failed to stage AOT qmod '/home/david/src/qore/git/module-v8/build-debug/qlib-qmod/TypeScriptActionInterface/TypeScriptActionInterface.qmod' -> '${_qore_qmod_tmp}': ${_qore_qmod_rc}")
endif()
file(RENAME "${_qore_qmod_tmp}" "${_qore_qmod_dst}")
message(STATUS "Atomically installed: ${_qore_qmod_dst}")

endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  set(_src_jar_dir "$ENV{DESTDIR}/usr/share/qore-modules//TypeScriptActionInterface/jar")
if (EXISTS "${_src_jar_dir}")
    set(_aot_mod_dir "$ENV{DESTDIR}/usr/lib64/qore-modules/TypeScriptActionInterface")
    file(MAKE_DIRECTORY "${_aot_mod_dir}")
    file(REMOVE_RECURSE "${_aot_mod_dir}/jar")
    file(CREATE_LINK "../../../share/qore-modules/TypeScriptActionInterface/jar" "${_aot_mod_dir}/jar" SYMBOLIC)
    message(STATUS "AOT jar dir symlink: ${_aot_mod_dir}/jar -> ../../../share/qore-modules/TypeScriptActionInterface/jar")
endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore/metadata/v8/QC_JavaScriptProgram.meta.json;/usr/share/qore/metadata/v8/QC_TypeScriptProgram.meta.json;/usr/share/qore/metadata/v8/QC_JavaScriptObject.meta.json;/usr/share/qore/metadata/v8/QC_JavaScriptPromise.meta.json")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore/metadata/v8" TYPE FILE FILES
    "/home/david/src/qore/git/module-v8/build-debug/QC_JavaScriptProgram.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/QC_TypeScriptProgram.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/QC_JavaScriptObject.meta.json"
    "/home/david/src/qore/git/module-v8/build-debug/QC_JavaScriptPromise.meta.json"
    )
endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
if(CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "/home/david/src/qore/git/module-v8/build-debug/install_local_manifest.txt"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
if(CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_COMPONENT MATCHES "^[a-zA-Z0-9_.+-]+$")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
  else()
    string(MD5 CMAKE_INST_COMP_HASH "${CMAKE_INSTALL_COMPONENT}")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INST_COMP_HASH}.txt")
    unset(CMAKE_INST_COMP_HASH)
  endif()
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "/home/david/src/qore/git/module-v8/build-debug/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
