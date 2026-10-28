# Admin Dashboard Architecture

## Architecture

The project uses a client-server architecture. The React + Vite Admin Dashboard
uses feature-based organization with layered responsibilities: application
composition belongs to `src/app/`, feature workflows belong to
`src/features/`, and reusable infrastructure belongs to `src/shared/`.

Feature-based organization keeps pages, components, and API services for one
workflow together, making existing responsibilities easier to locate and
maintain without introducing additional state-management dependencies.

## Application layer

`src/app/App.jsx` composes the authentication provider, React Router routes,
protected route boundary, and authenticated layout. The application layout is
in `src/app/layouts/`. Route definitions remain centralized in `App.jsx`.

## Feature layer

`src/features/` contains the existing dashboard workflows:

- `auth/` owns login and recovery pages, session context, protected-route
  handling, and password-reset requests.
- `overview/` owns the dashboard overview page.
- `drivers/` owns driver listing and detail/verification screens and their
  driver-specific API operations.
- `users/` owns user listing and account-status actions.
- `settings/` owns account, security, and admin-management screens and their
  API operations.

Feature services use the authenticated request function from the existing
authentication context. The shared admin-list service accepts that request
function for driver and user listing operations used by both Overview and
their management pages.

## Shared layer and backend communication

`src/shared/api/api.js` is the dashboard's fetch-based HTTP client and handles
the configured API base URL, query parameters, JSON requests, and responses.
Authenticated feature services call the request function provided by
`src/features/auth/context/AuthContext.jsx`, which applies the current session
and preserves the existing unauthorized-session behavior. Public
password-recovery and email-verification requests use the shared HTTP client
directly. `src/shared/components/` and `src/shared/utils/` contain UI
components and formatting utilities used across features.

The dashboard communicates with the server through HTTP APIs; it does not
connect to MongoDB or access database models. API endpoint, validation,
authorization, business logic, and persistence responsibilities remain on the
backend.

## Backend responsibilities

The backend is organized as a modular monolith under `backend/src/modules/`.
Module route files register endpoints and middleware, controllers handle HTTP
requests and responses, validation schemas check input, services perform
business operations, and Mongoose models represent persisted data. Shared
configuration, middleware, and error handling are in `backend/src/config/`,
`backend/src/middlewares/`, and `backend/src/utils/`. Database connection
setup is in `backend/src/config/db.js`.

## Placing future dashboard code

When a future Admin Dashboard feature is approved and implemented, place its
pages, feature-only components, and API service in a corresponding
`src/features/<feature-name>/` folder. Add or update application routes in
`src/app/App.jsx`; put genuinely reusable UI, utilities, or infrastructure in
`src/shared/`. Do not add empty feature folders or duplicate shared API logic.

## Preservation during organization

This organization step relocated existing Admin Dashboard API operations
without changing endpoint paths, request/response behavior, route definitions,
authorization checks, or UI workflows. This keeps the current FYP-I midterm
scope intact while making the existing responsibilities clearer.
