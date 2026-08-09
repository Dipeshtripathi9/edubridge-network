import { VirtualInternshipTrack } from '@prisma/client';

export interface VirtualInternshipTaskTemplate {
  taskIndex: number;
  title: string;
  objective: string;
  deliverables: string;
  steps: string[];
  evaluationCriteria: string;
  estimatedHours: string;
}

/**
 * Static per-track task content. There are exactly 4 tasks per track — content
 * lives here (not the DB) because it's identical for every student on a track;
 * only submission/review state (VirtualInternshipTask rows) is per-student.
 */
export const VIRTUAL_INTERNSHIP_TASKS: Record<VirtualInternshipTrack, VirtualInternshipTaskTemplate[]> = {
  MONTH: [
    {
      taskIndex: 1,
      title: 'Month 1 — Onboarding and first minor project',
      objective:
        'Get matched with your team and mentor, set up your development environment, and ship a first minor project that establishes your baseline in HTML, CSS, JavaScript and Git.',
      deliverables:
        'A public repository holding your first minor project, a README with setup steps, a live deployed URL, and one pull request reviewed and approved by your mentor.',
      steps: [
        'Complete environment setup and repository access, then run the starter project locally.',
        'Meet your mentor and agree the scope of your first minor project in writing.',
        'Build the project mobile-first with semantic HTML and a single stylesheet.',
        'Work on a feature branch and open a pull request for review.',
        'Address every review comment, then merge once your mentor approves.',
        'Deploy the project and record the live URL in your README.',
      ],
      evaluationCriteria:
        'Marked on semantic markup, responsive behaviour, how readable your commit history is, and whether the README lets someone else run the project unaided.',
      estimatedHours: 'Roughly 40 to 50 hours across the month.',
    },
    {
      taskIndex: 2,
      title: 'Month 2 — Second minor project',
      objective:
        'Build a data-driven interface that consumes a live REST API, handling the loading, empty and error paths properly. This develops component thinking, asynchronous JavaScript and API integration.',
      deliverables:
        'A second repository containing the project, a README documenting the API and your state handling approach, a live URL, and a short screen recording showing all three states.',
      steps: [
        'Pick a public API and document its endpoints, rate limits and response shape.',
        'Sketch the layout, then break it into reusable components before writing code.',
        'Fetch data asynchronously and render it behind a visible loading state.',
        'Handle the empty result and network failure paths explicitly, not silently.',
        'Add filtering or sorting that runs entirely client-side.',
        'Book a mid-month check-in with your mentor and act on the feedback.',
      ],
      evaluationCriteria:
        'Marked on the clarity of your component boundaries, correctness of state handling, how the interface behaves when the API is slow or unavailable, and the quality of the mobile layout.',
      estimatedHours: 'Roughly 45 to 55 hours across the month.',
    },
    {
      taskIndex: 3,
      title: 'Month 3 — Third minor project',
      objective:
        'Move a project into a container and put an automated pipeline in front of it, so every push is built, tested and deployed without a manual step. This is the DevOps half of the track.',
      deliverables:
        'A multi-stage Dockerfile, a compose file for local development, a CI workflow file, a deployed URL, and a README showing how to run everything locally with one command.',
      steps: [
        'Write a multi-stage Dockerfile and get the final image to a sensible size.',
        'Add a compose file covering the app and any dependency such as a database.',
        'Write at least five automated tests that cover your core logic.',
        'Configure CI to install, test and build on every push to any branch.',
        'Add a deploy step that runs only when main is updated.',
        'Trigger a deliberate failure and confirm the pipeline blocks the deploy.',
      ],
      evaluationCriteria:
        'Marked on image size and layer caching, whether the pipeline genuinely blocks a broken build, how you keep secrets out of the repository, and whether local setup really is one command.',
      estimatedHours: 'Roughly 45 to 55 hours across the month.',
    },
    {
      taskIndex: 4,
      title: 'Month 4 — Major project, review and certify',
      objective:
        'Combine everything from the first three months into one deployed full-stack application with authentication, persistence and basic observability. This is the project your certificate and recommendation letter refer to.',
      deliverables:
        'A deployed application, its source repository, an architecture note covering the data model and deployment topology, and a ten-minute walkthrough recording submitted for full mentor review.',
      steps: [
        'Write a short spec: the problem, the users, and what is out of scope.',
        'Model your data and document the schema before writing any endpoint.',
        'Build the API and front end, keeping auth and validation on the server.',
        'Containerise, deploy through your pipeline, and configure environment variables.',
        'Add health checks, structured logging, and one alert that actually fires.',
        'Record the walkthrough and submit the project for full mentor review.',
      ],
      evaluationCriteria:
        'Reviewed against the full rubric: architecture decisions, code quality, security basics, deployment reliability, and how clearly you explain your trade-offs in the walkthrough.',
      estimatedHours: 'Roughly 60 to 70 hours across the month.',
    },
  ],
  WEEK: [
    {
      taskIndex: 1,
      title: 'Week 1 — Onboarding and first build',
      objective:
        'Get matched with your mentor, set up your environment, and ship a small first project that establishes your baseline in HTML, CSS, JavaScript and Git.',
      deliverables:
        'A public repository with a README and setup steps, a live deployed URL, and one pull request reviewed and approved by your mentor.',
      steps: [
        'Complete environment setup and repository access, then run the starter project locally.',
        'Meet your mentor and agree the scope of your first build in writing.',
        'Build the project mobile-first with semantic HTML and a single stylesheet.',
        'Open a pull request for review and address every comment.',
        'Deploy the project and record the live URL in your README.',
      ],
      evaluationCriteria:
        'Marked on semantic markup, responsive behaviour, and whether the README lets someone else run the project unaided.',
      estimatedHours: 'Roughly 12 to 15 hours across the week.',
    },
    {
      taskIndex: 2,
      title: 'Week 2 — Second feature build',
      objective:
        'Build a data-driven interface that consumes a live REST API, handling loading, empty and error states properly.',
      deliverables:
        'A second repository with a README documenting the API and your state handling, a live URL, and a short recording showing all three states.',
      steps: [
        'Pick a public API and document its endpoints and response shape.',
        'Break the layout into reusable components before writing code.',
        'Fetch data asynchronously behind a visible loading state.',
        'Handle the empty result and network failure paths explicitly.',
        'Book a mid-week check-in with your mentor and act on the feedback.',
      ],
      evaluationCriteria:
        'Marked on component boundaries, correctness of state handling, and the quality of the mobile layout.',
      estimatedHours: 'Roughly 12 to 15 hours across the week.',
    },
    {
      taskIndex: 3,
      title: 'Week 3 — Polish and deploy',
      objective:
        'Take one of your builds further: containerise it and put a basic CI check in front of it, so every push is tested before it ships.',
      deliverables:
        'A Dockerfile, a CI workflow file, a deployed URL, and a README showing how to run everything locally with one command.',
      steps: [
        'Write a Dockerfile and confirm the image runs locally.',
        'Write at least three automated tests covering your core logic.',
        'Configure CI to install, test and build on every push.',
        'Redeploy through the pipeline and confirm the live URL still works.',
      ],
      evaluationCriteria:
        'Marked on whether the pipeline genuinely catches a broken build, and whether local setup really is one command.',
      estimatedHours: 'Roughly 12 to 15 hours across the week.',
    },
    {
      taskIndex: 4,
      title: 'Week 4 — Final review and certify',
      objective:
        'Bring your best work from the track together, present it, and close out the internship with a full mentor review.',
      deliverables:
        'A short write-up covering what you built and why, a link to your best-deployed project, and a ten-minute walkthrough recording submitted for mentor review.',
      steps: [
        'Pick your strongest build from the track and polish its README.',
        'Fix any outstanding review comments across your repositories.',
        'Record a short walkthrough explaining your key decisions.',
        'Submit the walkthrough and write-up for final mentor review.',
      ],
      evaluationCriteria:
        'Reviewed against the track rubric: code quality, deployment reliability, and how clearly you explain your trade-offs in the walkthrough.',
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
