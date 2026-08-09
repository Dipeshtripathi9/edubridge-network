import { VirtualInternshipTrack } from '@prisma/client';

export interface VirtualInternshipTaskTemplate {
  taskIndex: number;
  title: string;
  objective: string;
  deliverables: string;
  steps: string[];
  evaluationCriteria: string;
  estimatedHours: string;
  // MONTH-track tasks are grouped into 4 months of 4 weekly tasks each — these
  // three fields drive the dashboard's month-section headers. WEEK-track
  // tasks are a flat 4-item list and leave these undefined.
  monthNumber?: number;
  monthTitle?: string;
  monthDescription?: string;
}

/** Track-level note shown above the task list (matches each track's "track-note" copy). */
export const VIRTUAL_INTERNSHIP_TRACK_NOTE: Record<VirtualInternshipTrack, string> = {
  WEEK: 'Personal portfolio website — 4 week track. Five sections built in sequence: home, about me, skills, projects, contact. Good practice for layouts, cards, buttons and navigation.',
  MONTH:
    'Simple blog website — 4 month track. Frontend, backend, database, Docker and deployment, built in one continuous project. Sixteen weekly tasks grouped into four months; each task unlocks when the previous one is approved.',
};

/**
 * Static per-track task content. Content lives here (not the DB) because
 * it's identical for every student on a track; only submission/review state
 * (VirtualInternshipTask rows) is per-student.
 */
export const VIRTUAL_INTERNSHIP_TASKS: Record<VirtualInternshipTrack, VirtualInternshipTaskTemplate[]> = {
  MONTH: [
    {
      taskIndex: 1,
      monthNumber: 1,
      monthTitle: 'Frontend foundation',
      monthDescription: 'Weeks 1–4 · build the blog interface against static content',
      title: 'Week 1 — Project setup and layout shell',
      objective:
        'Set up the repository, agree the scope of the blog with your mentor, and build the static page shell that every later screen sits inside.',
      deliverables:
        'A public repository with a README, wireframes for the three core screens, and a deployed static shell with working navigation.',
      steps: [
        'Create the repository, add a README and .gitignore, and commit the empty structure.',
        'Write a one-page scope note: what the blog does, who can post, and what is out of scope.',
        'Wireframe the post list, post detail and editor screens before writing any code.',
        'Build the page shell with semantic landmarks and a responsive navigation bar.',
        'Pick your colour, spacing and type scale, and record them as CSS variables in one file.',
        'Deploy the static shell and record the live URL in your README.',
      ],
      evaluationCriteria:
        'Marked on semantic landmarks, whether the wireframes match what you built, whether design tokens live in one place, and README quality.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 2,
      monthNumber: 1,
      monthTitle: 'Frontend foundation',
      monthDescription: 'Weeks 1–4 · build the blog interface against static content',
      title: 'Week 2 — Post list and post detail',
      objective:
        'Build the two reading screens against hard-coded sample data, so the interface is settled before any backend exists.',
      deliverables: 'A working post list and post detail page rendering from a local JSON file, with at least six sample posts.',
      steps: [
        'Write six sample posts as JSON with title, slug, excerpt, body, author, date and tags.',
        'Build the post card: title, excerpt, author, date and tag row.',
        'Lay the cards out in a grid that reflows from three columns to one.',
        'Build the post detail page with a reading measure of 60 to 75 characters per line.',
        'Add empty and not-found states for when a slug does not match a post.',
        'Check the headings form a correct outline from h1 down with no levels skipped.',
      ],
      evaluationCriteria:
        'Marked on card reuse, reading comfort on the detail page, how the not-found path is handled, and heading structure.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 3,
      monthNumber: 1,
      monthTitle: 'Frontend foundation',
      monthDescription: 'Weeks 1–4 · build the blog interface against static content',
      title: 'Week 3 — Component and style system',
      objective:
        'Turn what you built into a small set of reusable components and a documented style system, so the rest of the track is assembly rather than rewriting.',
      deliverables:
        'A components or partials set covering card, button, tag, form field and layout wrapper, plus a demo page showing every component and each of its states.',
      steps: [
        'Extract repeated markup into components or template partials.',
        'Define three button styles with hover, focus-visible, active and disabled states.',
        'Build form field styles covering label, help text and error message.',
        'Build a demo page listing every component and every state side by side.',
        'Remove duplicated CSS and replace hard-coded values with your variables.',
        'Tab through the demo page and confirm focus is visible on everything interactive.',
      ],
      evaluationCriteria:
        'Marked on whether components are genuinely reused, completeness of the state coverage, absence of duplicated CSS, and keyboard focus visibility.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 4,
      monthNumber: 1,
      monthTitle: 'Frontend foundation',
      monthDescription: 'Weeks 1–4 · build the blog interface against static content',
      title: 'Week 4 — Responsive pass and month one review',
      objective:
        'Make the whole frontend hold up across devices, fix the accessibility issues it surfaces, and submit month one for mentor review.',
      deliverables:
        'The deployed frontend working at 360, 768 and 1280 pixels, a Lighthouse report at 90 or above on accessibility and best practices, and a short write-up.',
      steps: [
        'Test every screen at 360, 768 and 1280 pixels and fix what breaks.',
        'Run an accessibility audit and fix contrast, labelling and alt text issues.',
        'Add a page title and meta description for each screen.',
        'Compress images and set explicit dimensions so the layout stops shifting.',
        'Run Lighthouse, fix anything below 90, then run it again to confirm.',
        'Write up what you built and submit the live URL for month one review.',
      ],
      evaluationCriteria:
        'Reviewed against the month one rubric: responsiveness, accessibility fixes, layout stability, and the clarity of your write-up.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 5,
      monthNumber: 2,
      monthTitle: 'Backend and database',
      monthDescription: 'Weeks 5–8 · stand up an API and move content into a database',
      title: 'Week 5 — API design and server setup',
      objective:
        'Design the blog API on paper first, then stand up a running server with routing, configuration and a health check.',
      deliverables:
        'An API specification listing every endpoint with method, path, request body and response shape, plus a running server with a health check and consistent error handling.',
      steps: [
        'List every endpoint the blog needs and document its request and response shape.',
        'Choose your stack and initialise the server project with dev and start scripts.',
        'Load configuration from environment variables with a documented .env.example.',
        'Add a health check endpoint that returns status and version.',
        'Add a central error handler returning consistent JSON error responses.',
        'Add request logging and confirm it records method, path and status code.',
      ],
      evaluationCriteria:
        'Marked on completeness of the specification, whether configuration stays out of the repository, consistency of error responses, and how useful the logs are.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 6,
      monthNumber: 2,
      monthTitle: 'Backend and database',
      monthDescription: 'Weeks 5–8 · stand up an API and move content into a database',
      title: 'Week 6 — Database schema and migrations',
      objective:
        'Model the blog data, create the database through migrations rather than manual edits, and seed it with your sample content.',
      deliverables:
        'A schema covering posts, authors, tags and comments, a migration that builds the database from scratch, and a seed script that loads your sample posts.',
      steps: [
        'Draw the entity relationship diagram before writing any schema.',
        'Write the initial migration creating tables, keys and indexes.',
        'Add foreign key constraints and decide the delete behaviour for each relationship.',
        'Write a seed script that loads the six sample posts from week two.',
        'Confirm the database can be dropped and rebuilt from migrations alone.',
        'Document the schema and how to run migrations in your README.',
      ],
      evaluationCriteria:
        'Marked on whether the diagram matches the schema, correctness of keys and indexes, whether a clean rebuild works, and documentation quality.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 7,
      monthNumber: 2,
      monthTitle: 'Backend and database',
      monthDescription: 'Weeks 5–8 · stand up an API and move content into a database',
      title: 'Week 7 — CRUD endpoints and validation',
      objective:
        'Implement create, read, update and delete for posts, with validation on every field and predictable status codes.',
      deliverables:
        'Working list, read, create, update and delete endpoints with validation, correct status codes, and a saved request collection that exercises each one.',
      steps: [
        'Implement the list and read endpoints with pagination and sorting.',
        'Implement create, update and delete with validation on every field.',
        'Return the correct status codes: 200, 201, 400, 404 and 422 as appropriate.',
        'Reject unknown fields and enforce maximum lengths on text input.',
        'Save a request collection covering the happy path and each failure case.',
        'Write at least six tests covering validation and the not-found path.',
      ],
      evaluationCriteria:
        'Marked on validation coverage, status code correctness, whether malformed input is rejected safely, and test coverage of the failure paths.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 8,
      monthNumber: 2,
      monthTitle: 'Backend and database',
      monthDescription: 'Weeks 5–8 · stand up an API and move content into a database',
      title: 'Week 8 — Connect the frontend and month two review',
      objective:
        'Replace the hard-coded sample data with live API calls, handling loading, empty and error states, then submit month two.',
      deliverables:
        'The frontend reading entirely from the API, with visible loading, empty and error states, plus a short recording showing all three.',
      steps: [
        'Replace the local data source with API calls behind a single data module.',
        'Add a visible loading state to every screen that fetches.',
        'Handle the empty list and the network failure paths explicitly, not silently.',
        'Add pagination controls wired to the API.',
        'Enable CORS for your deployed frontend origin only, not for everything.',
        'Record the three states and submit month two for review.',
      ],
      evaluationCriteria:
        'Reviewed against the month two rubric: state handling, whether failures degrade gracefully, CORS configuration, and how cleanly the API is integrated.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 9,
      monthNumber: 3,
      monthTitle: 'Accounts, comments and the editor',
      monthDescription: 'Weeks 9–12 · make the blog multi-user and authorable',
      title: 'Week 9 — Authentication',
      objective:
        'Add registration and login with securely hashed passwords and a session mechanism you can explain and defend.',
      deliverables:
        'Working register, login and logout endpoints, password hashing, session or token handling, and a short note explaining which you chose and why.',
      steps: [
        'Add a users table with a unique email and a hashed password column.',
        'Hash passwords with a slow algorithm such as bcrypt or argon2, never a plain hash.',
        'Implement register and login with messages that do not reveal which field was wrong.',
        'Issue sessions or tokens and set cookies with httpOnly, secure and sameSite.',
        'Add rate limiting to the login endpoint.',
        'Write a short note explaining your session choice and its trade-offs.',
      ],
      evaluationCriteria:
        'Marked on correctness of hashing, cookie flags, whether error messages leak account existence, and the quality of your reasoning note.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 10,
      monthNumber: 3,
      monthTitle: 'Accounts, comments and the editor',
      monthDescription: 'Weeks 9–12 · make the blog multi-user and authorable',
      title: 'Week 10 — Authorization and protected routes',
      objective: 'Make sure people can only edit what they own, enforced on the server and reflected in the interface.',
      deliverables:
        'Middleware protecting every write endpoint, author-only editing enforced server-side, and a frontend that hides actions the current user cannot take.',
      steps: [
        'Add middleware that rejects unauthenticated requests with a 401.',
        'Enforce author ownership on update and delete, returning 403 when it fails.',
        'Add an admin role that can moderate any post.',
        'Hide or disable interface actions the current user is not allowed to take.',
        'Prove a hidden button cannot be bypassed by calling the API directly.',
        'Add tests covering the 401, 403 and successful paths.',
      ],
      evaluationCriteria:
        'Marked on whether authorisation is enforced server-side rather than only hidden in the interface, status code correctness, and test coverage.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 11,
      monthNumber: 3,
      monthTitle: 'Accounts, comments and the editor',
      monthDescription: 'Weeks 9–12 · make the blog multi-user and authorable',
      title: 'Week 11 — Comments, search and pagination',
      objective: 'Add reader interaction, then make a growing archive navigable and fast.',
      deliverables:
        'Working comments on post detail, a search endpoint, tag filtering, and pagination that still performs with a few hundred seeded posts.',
      steps: [
        'Add the comment endpoints with validation and length limits.',
        'Escape or sanitise all user content before rendering it anywhere.',
        'Add search across title and body, with an index to support it.',
        'Add tag filtering and make it combine correctly with search and pagination.',
        'Seed two hundred posts and measure the list query before and after indexing.',
        'Add moderation so an author or admin can delete a comment.',
      ],
      evaluationCriteria:
        'Marked on whether user content is safely escaped, query performance after seeding, correctness when filters combine, and moderation behaviour.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 12,
      monthNumber: 3,
      monthTitle: 'Accounts, comments and the editor',
      monthDescription: 'Weeks 9–12 · make the blog multi-user and authorable',
      title: 'Week 12 — Editor, drafts and month three review',
      objective: 'Build the authoring experience: a post editor with drafts, image upload and publishing, then submit month three.',
      deliverables:
        'A working editor with draft and published states, image upload with type and size limits, a slug that stays stable after publishing, and month three submitted.',
      steps: [
        'Build the editor form with title, slug, body, tags and a draft toggle.',
        'Generate the slug from the title, then lock it once the post is published.',
        'Add image upload with a size cap, an allow-list of types, and files served safely.',
        'Show drafts only to their author and keep them out of the public list.',
        'Add autosave, or an explicit warning when leaving with unsaved changes.',
        'Submit month three for mentor review.',
      ],
      evaluationCriteria:
        'Reviewed against the month three rubric: upload safety, draft visibility rules, slug stability, and how usable the editor is in practice.',
      estimatedHours: 'Roughly 10 to 14 hours across the week.',
    },
    {
      taskIndex: 13,
      monthNumber: 4,
      monthTitle: 'Docker, pipeline and launch',
      monthDescription: 'Weeks 13–16 · containerise, automate, deploy and certify',
      title: 'Week 13 — Containerise the stack',
      objective: 'Put the application and its database into containers so the whole thing runs identically on any machine.',
      deliverables:
        'A multi-stage Dockerfile, a compose file covering app and database with a named volume, and a README showing one-command local setup.',
      steps: [
        'Write a multi-stage Dockerfile and keep the final image small.',
        'Add a .dockerignore so the build context stays lean.',
        'Write a compose file for the app and database with a named volume for data.',
        'Run migrations automatically when the container starts.',
        'Add a container health check for both services.',
        'Delete your local install, then prove setup works with one command from a clean clone.',
      ],
      evaluationCriteria:
        'Marked on image size and layer caching, whether data survives a restart, and whether one command really is enough from a clean clone.',
      estimatedHours: 'Roughly 12 to 16 hours across the week.',
    },
    {
      taskIndex: 14,
      monthNumber: 4,
      monthTitle: 'Docker, pipeline and launch',
      monthDescription: 'Weeks 13–16 · containerise, automate, deploy and certify',
      title: 'Week 14 — Tests and CI pipeline',
      objective: 'Put an automated pipeline in front of the project so nothing broken can reach production.',
      deliverables:
        'A test suite covering the critical paths, a CI workflow running on every push, and evidence that a deliberately broken commit was blocked.',
      steps: [
        'Raise the suite to cover authentication, authorisation and post CRUD.',
        'Add at least two end-to-end tests covering publishing and commenting.',
        'Configure CI to install, lint, test and build on every push.',
        'Run the database as a service container inside CI.',
        'Add a deploy job gated on the tests passing and on the main branch.',
        'Push a deliberately broken commit and capture the blocked pipeline.',
      ],
      evaluationCriteria:
        'Marked on whether the pipeline genuinely blocks a broken build, test coverage of the critical paths, secret handling, and pipeline run time.',
      estimatedHours: 'Roughly 12 to 16 hours across the week.',
    },
    {
      taskIndex: 15,
      monthNumber: 4,
      monthTitle: 'Docker, pipeline and launch',
      monthDescription: 'Weeks 13–16 · containerise, automate, deploy and certify',
      title: 'Week 15 — Deployment and operations',
      objective: 'Deploy the containerised blog to a real host with a proper domain, managed secrets and working backups.',
      deliverables:
        "A live URL on HTTPS with a custom domain, secrets held in the host's secret storage, automated database backups, and a restore you have actually performed.",
      steps: [
        'Provision the host and deploy the containers through your pipeline.',
        'Point a domain at it and confirm HTTPS with automatic certificate renewal.',
        "Move every secret into the host's secret storage, never into the image.",
        'Schedule automated database backups.',
        'Restore a backup into a scratch environment and confirm the data is intact.',
        'Document the deploy and rollback procedure in your README.',
      ],
      evaluationCriteria:
        'Marked on whether the restore was actually performed rather than assumed, secret handling, HTTPS configuration, and the clarity of your rollback procedure.',
      estimatedHours: 'Roughly 12 to 16 hours across the week.',
    },
    {
      taskIndex: 16,
      monthNumber: 4,
      monthTitle: 'Docker, pipeline and launch',
      monthDescription: 'Weeks 13–16 · containerise, automate, deploy and certify',
      title: 'Week 16 — Audit, walkthrough and certify',
      objective: 'Harden, measure and present the finished blog, then close out the internship with a full mentor review.',
      deliverables:
        'A security and performance audit with the fixes applied, structured logging with one proven alert, an architecture note, and a walkthrough recording submitted for final review.',
      steps: [
        'Run a dependency vulnerability scan and update whatever it flags.',
        'Check the OWASP basics: injection, cross-site scripting, CSRF, and rate limiting on writes.',
        'Add structured logging and one alert, then trigger it on purpose to prove it fires.',
        'Run Lighthouse and a load test, then fix the worst bottleneck you find.',
        'Write the architecture note covering data model, deployment topology and trade-offs.',
        'Record a ten-minute walkthrough and submit everything for final review and certification.',
      ],
      evaluationCriteria:
        'Reviewed against the full track rubric: security posture, observability, performance, architecture reasoning, and how clearly you explain your trade-offs.',
      estimatedHours: 'Roughly 14 to 18 hours across the week.',
    },
  ],
  WEEK: [
    {
      taskIndex: 1,
      title: 'Week 1 — Setup, page shell and Home',
      objective:
        'Set up your repository and tooling, then build the page shell every later section will sit inside — header, navigation, main and footer — finishing with the Home hero.',
      deliverables:
        'A public repository with a README and setup steps, a live deployed URL, and a page whose navigation links to all five section anchors, with the Home section complete.',
      steps: [
        'Create the repository, add a README and .gitignore, and commit an empty index.html.',
        'Sketch the five sections on paper first, then pick one accent colour and a type scale of three sizes.',
        'Build the page shell with semantic landmarks: header, nav, main, footer.',
        'Add five section elements with ids for home, about, skills, projects and contact, and wire the nav links to them.',
        'Build the Home hero: your name, a one-line introduction, and a primary button pointing at Projects.',
        'Deploy to GitHub Pages or Netlify and record the live URL in your README.',
      ],
      evaluationCriteria:
        'Marked on correct use of semantic landmarks, whether every nav anchor scrolls to the right section, how the hero reads at 360px wide, and whether the README lets someone else run the project unaided.',
      estimatedHours: 'Roughly 12 to 15 hours across the week.',
    },
    {
      taskIndex: 2,
      title: 'Week 2 — About Me and Skills',
      objective:
        'Build the About Me section and a Skills grid made from one reusable card. This is the layout week: two-column composition, then a grid that reflows on its own.',
      deliverables:
        'An About section with an optimised portrait and a short bio, plus a Skills grid of at least eight cards, both holding up from 360px to 1280px wide.',
      steps: [
        'Write a bio of 60 to 80 words and choose one portrait or illustration.',
        'Build About as a two-column layout that stacks to one column below 768px.',
        'Compress the image, set explicit width and height, and write meaningful alt text.',
        'Build a single skill card, then reuse the same markup and class for every other skill.',
        'Lay the cards out with CSS Grid using auto-fit and minmax so they reflow without extra breakpoints.',
        'Check every text and background pair against a contrast checker and fix anything below 4.5 to 1.',
      ],
      evaluationCriteria:
        'Marked on whether one card class genuinely serves every card, whether the grid reflows without hard-coded breakpoints, image weight and alt text quality, and contrast ratios.',
      estimatedHours: 'Roughly 12 to 15 hours across the week.',
    },
    {
      taskIndex: 3,
      title: 'Week 3 — Projects and interactive states',
      objective:
        'Build the Projects section as a card grid with real content, and give every interactive element a proper hover, focus and active state. This is the buttons and cards week.',
      deliverables:
        'At least three project cards, each with an image, title, description, tech tags and two links — live demo and source code — plus a documented button system used consistently across the whole page.',
      steps: [
        'Write up three projects: what it does, what you built, and which tools you used.',
        'Build one project card containing image, heading, description, tag row and two buttons.',
        'Define three button styles — primary, secondary and text link — each with hover, focus-visible and active states.',
        'Make the grid run three across on desktop, two on tablet and one on mobile.',
        'Add lazy loading and a fixed aspect ratio to project images so the page does not jump while loading.',
        'Tab through the entire page and confirm the focus ring is visible on every link and button.',
      ],
      evaluationCriteria:
        'Marked on consistency of the card and button systems, keyboard focus visibility, absence of layout shift, and how clearly the project write-ups explain your own contribution.',
      estimatedHours: 'Roughly 12 to 15 hours across the week.',
    },
    {
      taskIndex: 4,
      title: 'Week 4 — Contact, polish and launch',
      objective:
        'Build the Contact section, then audit, polish and ship the finished portfolio as something you would put on a job application.',
      deliverables:
        'A working contact section, a Lighthouse report scoring 90 or above on all four measures, the deployed live URL, and a short write-up of what you would improve next.',
      steps: [
        'Build the Contact section with a labelled form for name, email and message, plus direct email and profile links.',
        'Add validation with visible text error messages, never colour on its own.',
        'Connect the form to a service such as Formspree, or fall back to mailto, and test one real submission end to end.',
        'Add the page title, meta description, favicon and an Open Graph image.',
        'Run Lighthouse, fix anything scoring under 90, then run it again to confirm.',
        'Do a final pass at 360px, 768px and 1280px, then submit your live URL for mentor review.',
      ],
      evaluationCriteria:
        'Reviewed against the track rubric: whether a message actually reaches you, whether errors are understandable without relying on colour, your Lighthouse scores, and how the site holds up at all three widths.',
      estimatedHours: 'Roughly 15 to 18 hours across the week.',
    },
  ],
};

export function getVirtualInternshipTaskTemplate(
  track: VirtualInternshipTrack,
  taskIndex: number,
): VirtualInternshipTaskTemplate | undefined {
  return VIRTUAL_INTERNSHIP_TASKS[track].find((t) => t.taskIndex === taskIndex);
}
