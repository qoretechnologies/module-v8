# Install script for directory: /module-v8

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
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set default install directory permissions.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/bin" TYPE PROGRAM FILES
    "/module-v8/bin/ts-proxy"
    "/module-v8/bin/netsuite-make-generic-schema"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod")
    file(RPATH_CHECK
         FILE "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod"
         RPATH "/usr/lib/jvm/java-25-openjdk-amd64/lib")
  endif()
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/lib/x86_64-linux-gnu/qore-modules" TYPE MODULE FILES "/module-v8/container-build/v8-api-1.5.qmod")
  if(EXISTS "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod")
    file(RPATH_CHANGE
         FILE "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod"
         OLD_RPATH "/usr/lib/jvm/java-25-openjdk-amd64/lib:"
         NEW_RPATH "/usr/lib/jvm/java-25-openjdk-amd64/lib")
    if(CMAKE_INSTALL_DO_STRIP)
      execute_process(COMMAND "/usr/bin/strip" "$ENV{DESTDIR}/usr/lib/x86_64-linux-gnu/qore-modules/v8-api-1.5.qmod")
    endif()
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  include("/module-v8/container-build/CMakeFiles/v8.dir/install-cxx-module-bmi-debug.cmake" OPTIONAL)
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
    "/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qc"
    "/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qm"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramProxy.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataCache.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qm;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptAppRestConnection.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptDataField.qc")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore-modules/TypeScriptActionInterface" TYPE FILE FILES
    "/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramPool.qc"
    "/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramProxy.qc"
    "/module-v8/qlib/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataCache.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionFactory.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qm"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptAppRestConnection.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptDataField.qc"
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
    "/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qc"
    "/module-v8/qlib/TypeScriptProxy/TypeScriptProxy.qm"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptProgramProxy.qc;/usr/share/qore-modules/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataCache.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionFactory.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterface.qm;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptAppRestConnection.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc;/usr/share/qore-modules/TypeScriptActionInterface/TypeScriptDataField.qc")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/usr/share/qore-modules/TypeScriptActionInterface" TYPE FILE FILES
    "/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramPool.qc"
    "/module-v8/qlib/TypeScriptActionInterface/JavaScriptProgramProxy.qc"
    "/module-v8/qlib/TypeScriptActionInterface/JavaScriptThreadProcessPool.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionApiWithSchemaDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionAppDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataCache.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderBase.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionDataProviderFactory.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionEventDataProviderBase.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionFactory.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionGoogleApiDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterface.qm"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionInterfacePriv.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRecordBasedDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionRootDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionTablesDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptActionWebhookEventDataProvider.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptAppRestConnection.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordInterface.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptBulkRecordProxyInterface.qc"
    "/module-v8/qlib/TypeScriptActionInterface/TypeScriptDataField.qc"
    )
endif()

if(CMAKE_INSTALL_COMPONENT)
  set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
file(WRITE "/module-v8/container-build/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
