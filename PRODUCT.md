# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A study and portfolio project: there are no real users. The site must read as a credible, finished product to whoever evaluates the work (recruiters, other developers), using the three roles the API already has:

- **Student**: finds courses in the catalog, enrolls, watches lessons, downloads material, tracks progress and reviews courses.
- **Instructor**: creates and edits courses (cover, outline of modules and lessons, material, video), publishes and archives them, follows enrolled students and exports them as CSV.
- **Admin**: lists users by role, changes roles, disables accounts and reads the history of changes.

No role is secondary: discovering and studying weigh as much as creating and managing courses.

## Product Purpose

A course platform where instructors publish video courses and students study them, built end to end (serverless API in `coursary-api`, this SPA) to exercise the installed skills and record where each one helps or fails. Success is a site where every flow the API offers works in the browser against `dev`, and looks like something a team would ship.

## Operating Context

- Desktop first for the instructor and admin (forms, outline editor, tables); the student flows must work as well on a phone (catalog, lesson, video).
- Sessions last days through an HttpOnly refresh cookie; videos are long and watched in one sitting or resumed from the saved position.
- Only the `dev` stage exists (`https://coursary-dev.joaodevdude.com`); there is no production.

## Capabilities and Constraints

- Everything the API exposes: sign-up with e-mail confirmation, sign-in, password recovery, profile and avatar; paginated catalog with full-text search, course page, enrollment, lesson with video and material, progress, reviews; course editor with cover, outline reordering, material and multipart video upload; student table and CSV export; admin users and roles.
- Stack fixed by the project: React Router 8 SPA, Tailwind 4, shadcn/ui, React Query; fonts self-hosted (`@fontsource`), no runtime calls to font CDNs.
- Interface in Brazilian Portuguese only, no i18n.

## Brand Commitments

Only the name, **Coursary**. No logo, palette, typography or voice has been decided; the visual exploration proposes them.

## Evidence on Hand

None. Courses, instructors, students and numbers on screen are examples and must look like examples, not claims: no invented testimonials, user counts, ratings presented as real, or partner logos.

## Product Principles

1. Every screen is a working flow against the real API, never a mockup.
2. The three roles get the same care; no role's screens are an afterthought.
3. Clarity over decoration: the student's lesson and the instructor's editor are tools first.
4. Honest content: placeholders read as placeholders.

## Accessibility & Inclusion

WCAG 2.2 AA: AA contrast in light and dark themes, visible focus on every control, touch targets of at least 40 px, `prefers-reduced-motion` respected, everything usable by keyboard.
