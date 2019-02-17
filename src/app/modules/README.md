This folder contains modules described in [Types of Feature Modules](https://angular.io/guide/module-types)

# domain
Domain feature modules deliver a user experience dedicated to a particular application domain like editing a customer or placing an order.
They typically have a top component that acts as the feature root and private, supporting sub-components descend from it.

Domain feature modules consist mostly of declarations. Only the top component is exported.

Domain feature modules rarely have providers. When they do, the lifetime of the provided services should be the same as the lifetime of the module.

Domain feature modules are typically imported exactly once by a larger feature module.

They might be imported by the root `AppModule` of a small application that lacks routing.

# routed
Routed feature modules are domain feature modules whose top components are the targets of router navigation routes.
All lazy-loaded modules are routed feature modules by definition.

Routed feature modules don’t export anything because their components never appear in the template of an external component.

A lazy-loaded routed feature module should not be imported by any module. Doing so would trigger an eager load, defeating the purpose of lazy loading.That means you won’t see them mentioned among the `AppModule` imports. An eager loaded routed feature module must be imported by another module so that the compiler learns about its components.

Routed feature modules rarely have providers for reasons explained in [Lazy Loading Feature Modules](https://angular.io/guide/lazy-loading-ngmodules). When they do, the lifetime of the provided services should be the same as the lifetime of the module. Don't provide application-wide singleton services in a routed feature module or in a module that the routed module imports.

# service
Service modules provide utility services such as data access and messaging. Ideally, they consist entirely of providers and have no declarations. Angular's `HttpClientModule` is a good example of a service module.

The root `AppModule` is the only module that should import service modules.

# widget
A widget module makes components, directives, and pipes available to external modules. Many third-party UI component libraries are widget modules.

A widget module should consist entirely of declarations, most of them exported.

A widget module should rarely have providers.

Import widget modules in any module whose component templates need the widgets.
