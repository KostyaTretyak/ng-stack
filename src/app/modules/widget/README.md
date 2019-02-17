Taken from [Types of Feature Modules](https://angular.io/guide/module-types):

A widget module makes components, directives, and pipes available to external modules. Many third-party UI component libraries are widget modules.

A widget module should consist entirely of declarations, most of them exported.

A widget module should rarely have providers.

Import widget modules in any module whose component templates need the widgets.
