# Copyright (C) 2026 Qore Technologies, s.r.o.
# SPDX-License-Identifier: MIT
%global source_date_epoch_from_changelog 1
%global use_source_date_epoch_as_buildtime 1
%if v"%{rpmversion}" >= v"4.20"
%global build_mtime_policy clamp_to_source_date_epoch
%else
%global clamp_mtime_to_source_date_epoch 1
%endif
%bcond_without tests
%bcond_without docs
%global _find_debuginfo_dwz_opts %{nil}
Name: qore-v8-module
Version: 2.2.0
Release: 1%{?dist}
Summary: JavaScript and TypeScript integration for Qore
License: LGPL-2.1-or-later AND MIT AND Apache-2.0
URL: https://github.com/qoretechnologies/module-v8
Source0: %{name}-%{version}.tar.xz
BuildRequires: cmake >= 3.21
BuildRequires: make
BuildRequires: gcc-c++
%if 0%{?suse_version}
# Leap ships Node's executable and headers, but no embeddable shared library.
BuildRequires: libnode-devel >= 24.18.1
%else
BuildRequires: nodejs24-devel >= 24.18.0
%endif
BuildRequires: qore-devel >= 3.0.0~
BuildRequires: qore-rpm-macros >= 3.0.0~
BuildRequires: qore-process-module
BuildRequires: qore-uuid-module
Requires: qore-process-module
Requires: qore-uuid-module
%if 0%{?fedora} || 0%{?suse_version}
BuildRequires: typescript >= 5.2
Requires: typescript >= 5.2
%endif
%if %{with tests}
BuildRequires: python3 >= 3.11
BuildRequires: openssl
BuildRequires: which
BuildRequires: qore-misc-tools >= 3.0.0~
%endif
%if %{with docs}
BuildRequires: doxygen
%if 0%{?suse_version}
BuildRequires: util-linux
%else
BuildRequires: util-linux-core
%endif
%endif
%{?qore_enable_aot_post}

%description
Native Node.js/V8 bindings, source and compiled TypeScriptProxy and
TypeScriptActionInterface modules, command-line tools, compiler metadata,
provider resources and translations. TypeScript uses Node 24's built-in
compiler; the distribution TypeScript package is also available on Fedora
and openSUSE. The separately built TypeScript app catalogue is not included.

%if %{with docs}
%package doc
Summary: API references and examples for Qore JavaScript integration
BuildArch: noarch
%description doc
HTML API references and test examples for the JavaScript and TypeScript bridge,
process pools and action integration.
%endif

%prep
%autosetup
%build
%{?set_build_flags}
. %{_rpmconfigdir}/qore/module-env.sh
unset NODE_OPTIONS NODE_PATH NODE_INCLUDE_DIR NODE_LIB_DIR V8_CPPGC_INCLUDE_DIR
unset QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT QORE_TYPESCRIPT_ACTION_SCRIPTS QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS
unset QORE_DATA_PROVIDERS QORE_CONNECTION_PROVIDERS QORE_DATASOURCE_PROVIDERS QORE_PROVIDER_INDEX_DIR
qore_set_source_prefix_maps "%{qore_debug_source_dir}"
cmake -S . -B build -G 'Unix Makefiles' \
  -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_FLAGS_RELEASE=-DNDEBUG \
  -DCMAKE_INSTALL_PREFIX=%{_prefix} -DCMAKE_SKIP_RPATH=ON \
  -DCMAKE_IGNORE_PREFIX_PATH=/usr/local \
  -DQore_DIR=%{_libdir}/cmake/Qore -DQORE_EXECUTABLE=/usr/bin/qore \
  -DQORE_QPP_EXECUTABLE=/usr/bin/qpp -DQORE_QCC_EXECUTABLE=/usr/bin/qcc \
  -DQORE_TYPESCRIPT_MODULE:STRING=/usr/lib/node_modules/typescript/lib/typescript.js \
  -DQORE_BUILD_AOT_MODULES=ON -DQORE_AOT_LINK_SOURCE_MODULES=OFF \
  -DQORE_AOT_MODULE_OPT_LEVEL=3 -DQORE_GENERATE_JAVA_BINDINGS=OFF -DQORE_V8_STRICT_DOCS=ON \
  -DQORE_QM_METADATA_ENV:STRING="QORE_MODULE_DIR=$PWD/build:$PWD/build/qlib-qmod:$PWD/qlib:$QORE_MODULE_DIR;QORE_MODULE_DIR_ONLY=1;QORE_INCLUDE_DIR=;LD_LIBRARY_PATH=" \
  -DCMAKE_DISABLE_FIND_PACKAGE_Doxygen=%{!?with_docs:ON}%{?with_docs:OFF}
cmake --build build -- %{?_smp_mflags}
%if %{with docs}
cmake --build build --target docs -- %{?_smp_mflags}
%endif
%install
DESTDIR=%{buildroot} cmake --install build
%qore_install_aot_sources qlib
sed -i '1s|.*|#!/usr/bin/qore|' %{buildroot}%{_bindir}/ts-proxy %{buildroot}%{_bindir}/netsuite-make-generic-schema
find %{buildroot}%{_libdir}/qore-modules -type f -name '*.qmod' -exec chmod 755 {} +
%if %{with docs}
install -d %{buildroot}%{_docdir}/%{name}-doc
cp -a build/docs %{buildroot}%{_docdir}/%{name}-doc/
cp -a test %{buildroot}%{_docdir}/%{name}-doc/examples
hardlink -t -O %{buildroot}%{_docdir}/%{name}-doc
%endif
%check
%if %{with tests}
. %{_rpmconfigdir}/qore/module-env.sh
unset NODE_OPTIONS NODE_PATH NODE_INCLUDE_DIR NODE_LIB_DIR V8_CPPGC_INCLUDE_DIR
unset QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT QORE_TYPESCRIPT_ACTION_SCRIPTS QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS
unset QORE_DATA_PROVIDERS QORE_CONNECTION_PROVIDERS QORE_DATASOURCE_PROVIDERS QORE_PROVIDER_INDEX_DIR
export QORE_MODULE_DIR="$PWD/build:$PWD/build/qlib-qmod:$QORE_MODULE_DIR"
python3 -B -W error debian/tests/test_aot_metadata.py
sh debian/tests/cli "$PWD/bin/netsuite-make-generic-schema"
export QORE_V8_TEST_MODULE_DIR="$PWD/build"
export QORE_V8_TEST_QMOD_DIR="$PWD/build/qlib-qmod"
for suite in test/*.qtest; do
  timeout 600 /usr/bin/qore -b --enable-debug \
    -l "$QORE_V8_TEST_MODULE_DIR/v8-api-$(/usr/bin/qore --latest-module-api).qmod" \
    -l "$QORE_V8_TEST_QMOD_DIR/TypeScriptProxy/TypeScriptProxy.qmod" \
    -l "$QORE_V8_TEST_QMOD_DIR/TypeScriptActionInterface/TypeScriptActionInterface.qmod" \
    "$suite" -v
done
# The independent ts/ app catalogue has its own source/locale qualification.
qore-data-provider-i18n --no-color --check-tree --require-standard-locales \
  --require-complete-locales --output "$PWD/qlib"
%endif
%files
%license LICENSE COPYING.GPL COPYING.LGPL debian/copyright rpm/licenses/*.txt
%doc README*
%{_bindir}/ts-proxy
%{_bindir}/netsuite-make-generic-schema
%{_libdir}/qore-modules/*
%{_datadir}/qore-modules/*
%{_datadir}/qore/metadata/*
%{_datadir}/qore/i18n/
%if %{with docs}
%files doc
%license LICENSE COPYING.GPL COPYING.LGPL debian/copyright rpm/licenses/*.txt
%doc %{_docdir}/%{name}-doc/
%endif
%changelog
* Sun Oct 04 2026 David Nichols <david@qore.org> - 2.2.0-1
- Align the package version with the module release.

* Sat Oct 03 2026 David Nichols <david@qore.org> - 2.1.0-1
- Package the Node.js bridge, AOT modules, tools, metadata and translations.
- Use the packaged Qore SDK and Node 24 shared library; run offline suites.
- Retain source exclusions and license notices for the separate app catalogue.
