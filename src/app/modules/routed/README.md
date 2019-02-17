Taken from [Types of Feature Modules](https://angular.io/guide/module-types):

Routed feature modules are domain feature modules whose top components are the targets of router navigation routes.
All lazy-loaded modules are routed feature modules by definition.

Routed feature modules don’t export anything because their components never appear in the template of an external component.

A lazy-loaded routed feature module should not be imported by any module. Doing so would trigger an eager load, defeating the purpose of lazy loading.That means you won’t see them mentioned among the `AppModule` imports. An eager loaded routed feature module must be imported by another module so that the compiler learns about its components.

Routed feature modules rarely have providers for reasons explained in [Lazy Loading Feature Modules](https://angular.io/guide/lazy-loading-ngmodules). When they do, the lifetime of the provided services should be the same as the lifetime of the module. Don't provide application-wide singleton services in a routed feature module or in a module that the routed module imports.
