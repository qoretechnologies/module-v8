%{?_datarootdir: %global mydatarootdir %_datarootdir}
%{!?_datarootdir: %global mydatarootdir %{buildroot}/usr/share}

%global module_api %(qore --latest-module-api 2>/dev/null)
%global module_dir %{_libdir}/qore-modules
%global user_module_dir %{mydatarootdir}/qore-modules/

Name:           qore-v8-module
Version:        1.0.0
Release:        1
Summary:        Qorus Integration Engine - Qore v8 module
License:        LGPL-2.1-or-later AND MIT
Group:          Productivity/Networking/Other
Url:            https://qoretechnologies.com
Source:         qore-v8-module-%{version}.tar.bz2
BuildRequires:  gcc-c++
%if 0%{?el7}
BuildRequires:  devtoolset-7-gcc-c++
%endif
BuildRequires:  cmake >= 3.5
BuildRequires:  v8-11.3-devel
Requires:       nodejs-libs
BuildRequires:  qore-devel >= 2.0
BuildRequires:  qore-stdlib >= 2.0
BuildRequires:  qore >= 2.0
BuildRequires:  doxygen
Requires:       qore-module(abi)%{?_isa} = %{module_api}
Requires:       %{_bindir}/env
BuildRoot:      %{_tmppath}/%{name}-%{version}-build

%description
This package contains the v8 module for the Qore Programming Language.

%prep
%setup -q

%build
%if 0%{?el7}
# enable devtoolset7
. /opt/rh/devtoolset-7/enable
unset v8PATH
%endif
export CXXFLAGS="%{?optflags}"
cmake -DCMAKE_INSTALL_PREFIX=%{_prefix} -DCMAKE_BUILD_TYPE=RELWITHDEBINFO -DCMAKE_SKIP_RPATH=1 -DCMAKE_SKIP_INSTALL_RPATH=1 -DCMAKE_SKIP_BUILD_RPATH=1 -DCMAKE_PREFIX_PATH=${_prefix}/lib64/cmake/Qore .
make %{?_smp_mflags}
make %{?_smp_mflags} docs
sed -i 's/#!\/usr\/bin\/env qore/#!\/usr\/bin\/qore/' test/*.qtest

%install
make DESTDIR=%{buildroot} install %{?_smp_mflags}

%files
%{module_dir}

%check
qore -l ./v8-api-%{module_api}.qmod test/v8.qtest -v

%package doc
Summary: v8 module for Qore
Group: Development/Languages/Other

%description doc
v8 module for the Qore Programming Language.

This RPM provides API documentation, test and example programs

%files doc
%defattr(-,root,root,-)
%doc docs/v8 test/*.qtest

%changelog
* Thu Jul 25 2024 David Nichols <david@qore.org>
- initial version
