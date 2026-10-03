JavaScript and TypeScript RPM packaging
=======================================

Copyright 2026 Qore Technologies, s.r.o.

The runtime provides the native Node.js bridge, source/AOT TypeScriptProxy and
TypeScriptActionInterface modules, command-line tools, compiler metadata and
translations. The doc subpackage supplies three API references and test examples.
Process and UUID modules are runtime dependencies. Builds use a matching Node 24
shared library and headers; ELF dependencies retain the library's exact SONAME.
Node's built-in TypeScript transformation is required on Enterprise Linux.
Fedora and openSUSE also have a distribution TypeScript compiler at the absolute
path configured in the recipe.

Source preparation excludes ``container-build/`` and ``ts/``, matching the
Debian source exclusions. The independently built TypeScript app catalogue needs
its own pinned offline dependency and schema-license inventory. User-provided
apps can be configured with ``QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT`` or
``QORE_TYPESCRIPT_ACTION_SCRIPTS``. Their retained catalogs are checked for locale,
message and source parity; current app ownership requires the separate catalogue.

The build runs every bridge suite, CLI success/failure tests, metadata-strip tests
and catalog checks. HubSpot OAuth requires the optional matching app catalogue;
release AOT fault-injection hooks are absent and those cases explicitly skip.
Source-mode checks must cover those hooks separately. Installed runtime/SDK,
AOT/debug metadata, all target distributions and package lifecycle are separate
gates. This recipe is a candidate and is not qualified for publication.

Leap's Node.js executable/devel packages do not supply ``libnode``. Its bridge
build therefore also requires a separately qualified shared-library SDK.

The rejection regression runs its intentional unhandled promises in an isolated
child and asserts the exact expected warning classes and continued execution.
Normal suites therefore reject unrelated stderr rather than accepting arbitrary
Node warnings. The signal fixture verifies Qore handlers before and after V8
loads; the WebAssembly fixture also verifies a normal read and a bounds trap.

Combined Fedora/AlmaLinux native qualification is recorded in
``test/audits/rpm-integration.rst``. The corresponding packaging evidence records
148 cases and 1,153 assertions per target, plus separate memory and descriptor
checks with only the user-approved external diagnostic sites.
