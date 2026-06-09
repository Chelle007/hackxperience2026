// Gallery / past-showcase project type.
// This is a distinct entity from a hackathon `Submission`: it represents a
// finished, ranked project shown in the public gallery of previous events.

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  year: "2025" | "2024";
  teamName: string;
  tags: string[];
  links?: {
    github?: string;
    demo?: string;
  };
  achievements?: string[];
  rank?: "WINNER" | "RUNNER_UP" | "SECOND_RUNNER_UP" | "SPECIAL_MENTION";
  createdAt: string; // ISO date string for sorting
}
