"use client";

import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import {
  fetchAdminVotingTeams,
  fetchCommunityVotingLeaderboard,
  submitCommunityVote,
  type CommunityVotingBallot,
  type CommunityVotingTeamPayload,
} from "@/lib/client/admin-api";
import type { CommunityVotingLeaderboardEntry } from "@/lib/types";
import styles from "./Voting.module.css";

type VotingStep = 1 | 2 | 3 | 4;
type VotingMode = "admin" | "kiosk";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function formatBallotDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
  });
}

function buildMetrics(
  teams: CommunityVotingTeamPayload[],
  leaderboard: CommunityVotingLeaderboardEntry[],
): AdminMetric[] {
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
  const votedMembers = teams.reduce(
    (sum, team) => sum + team.members.filter((member) => member.hasVoted).length,
    0,
  );

  return [
    {
      key: "eligible_teams",
      label: "ELIGIBLE_TEAMS",
      value: String(teams.length),
      helper: "approved teams",
      tone: "neutral",
    },
    {
      key: "ballots_cast",
      label: "BALLOTS_CAST",
      value: String(votedMembers),
      helper: "participants voted",
      tone: votedMembers > 0 ? "emerald" : "neutral",
    },
    {
      key: "members_left",
      label: "MEMBERS_LEFT",
      value: String(Math.max(0, totalMembers - votedMembers)),
      helper: "can still vote",
      tone: totalMembers - votedMembers > 0 ? "amber" : "neutral",
    },
    {
      key: "leading_team",
      label: "CURRENT_LEADER",
      value: leaderboard[0]?.voteCount ? String(leaderboard[0].voteCount) : "0",
      helper: leaderboard[0] ? leaderboard[0].teamId : "awaiting ballots",
      tone: leaderboard[0]?.voteCount ? "emerald" : "neutral",
    },
    {
      key: "deadline_countdown",
      label: "DEADLINE_COUNTDOWN",
      value: "00.00.00.00",
      helper: "always open",
      tone: "neutral",
    },
  ];
}

function getExactTeamMatch(teams: CommunityVotingTeamPayload[], value: string) {
  const normalized = normalizeText(value);
  return teams.find((team) => normalizeText(team.teamId) === normalized) ?? null;
}

function TeamPreview({ team }: { team: CommunityVotingTeamPayload }) {
  return (
    <div className={styles.teamPreview}>
      <div>
        <p className={styles.previewLabel}>TEAM</p>
        <p className={styles.previewValue}>{team.teamId}</p>
      </div>
      <div>
        <p className={styles.previewLabel}>PROJECT</p>
        <p className={styles.previewValue}>{team.projectName}</p>
      </div>
      <div>
        <p className={styles.previewLabel}>MEMBERS</p>
        <p className={styles.previewValue}>{team.members.length}</p>
      </div>
    </div>
  );
}

export default function VotingClient() {
  const [mode, setMode] = useState<VotingMode>("kiosk");
  const [teams, setTeams] = useState<CommunityVotingTeamPayload[]>([]);
  const [ballots, setBallots] = useState<CommunityVotingBallot[]>([]);
  const [leaderboard, setLeaderboard] = useState<CommunityVotingLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [submitState, setSubmitState] = useState("");

  const [step, setStep] = useState<VotingStep>(1);
  const [teamInput, setTeamInput] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedVoterEmail, setSelectedVoterEmail] = useState("");
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.teamId === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const availableTargets = useMemo(
    () => teams.filter((team) => team.teamId !== selectedTeamId),
    [selectedTeamId, teams],
  );

  const filteredTeams = useMemo(() => {
    const query = normalizeText(teamInput);
    if (!query) return teams;
    return teams.filter((team) => normalizeText(team.teamId).includes(query));
  }, [teamInput, teams]);

  const selectedMember = useMemo(
    () => selectedTeam?.members.find((member) => member.email === selectedVoterEmail) ?? null,
    [selectedTeam, selectedVoterEmail],
  );

  const shellMetrics = useMemo(() => buildMetrics(teams, leaderboard), [leaderboard, teams]);

  const loadData = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);
    setError("");

    try {
      const [teamsPayload, leaderboardPayload] = await Promise.all([
        fetchAdminVotingTeams(),
        fetchCommunityVotingLeaderboard(),
      ]);
      setMode(teamsPayload.mode);
      setTeams(teamsPayload.teams);
      setBallots(teamsPayload.ballots);
      setLeaderboard(leaderboardPayload.leaderboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load community voting.");
    } finally {
      if (mode === "initial") setLoading(false);
      if (mode === "refresh") setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData("initial");
  }, [loadData]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadData("refresh");
    }, 12000);
    return () => window.clearInterval(id);
  }, [loadData]);

  function resetFlow() {
    setStep(1);
    setTeamInput("");
    setSelectedTeamId("");
    setSelectedVoterEmail("");
    setSelectedVotes([]);
    setDropdownOpen(false);
  }

  function handleSelectTeam(team: CommunityVotingTeamPayload) {
    setSelectedTeamId(team.teamId);
    setTeamInput(team.teamId);
    setSelectedVoterEmail("");
    setSelectedVotes([]);
    setDropdownOpen(false);
    setSubmitState("");
  }

  function handleTeamNext() {
    const exactMatch = getExactTeamMatch(teams, teamInput);
    const team = selectedTeam ?? exactMatch;

    if (!team) {
      setSubmitState("Please select a valid approved team ID.");
      return;
    }

    if (team.members.length === 0) {
      setSubmitState("This team has no valid member list. Please contact the organisers.");
      return;
    }

    setSelectedTeamId(team.teamId);
    setTeamInput(team.teamId);
    setSelectedVoterEmail("");
    setSelectedVotes([]);
    setSubmitState("");
    setStep(2);
  }

  function handleMemberNext() {
    if (!selectedMember) {
      setSubmitState("Please select your name before continuing.");
      return;
    }

    if (selectedMember.hasVoted) {
      setSubmitState("This participant has already submitted a vote.");
      return;
    }

    setSubmitState("");
    setStep(3);
  }

  function toggleVote(submissionId: string) {
    setSelectedVotes((current) => {
      if (current.includes(submissionId)) {
        return current.filter((item) => item !== submissionId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, submissionId];
    });
    setSubmitState("");
  }

  async function handleSubmitVote() {
    if (!selectedTeam || !selectedMember) {
      setSubmitState("Please complete the team and member steps first.");
      return;
    }

    if (selectedVotes.length !== 3) {
      setSubmitState("Select exactly 3 approved projects before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitState("");
    try {
      await submitCommunityVote({
        sourceTeamId: selectedTeam.teamId,
        voterEmail: selectedMember.email,
        votedSubmissionIds: selectedVotes,
      });
      await loadData("refresh");
      setStep(4);
    } catch (submitError) {
      setSubmitState(
        submitError instanceof Error ? submitError.message : "Unable to submit this community vote.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const allMembersUsed = selectedTeam ? selectedTeam.members.every((member) => member.hasVoted) : false;

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.contentHeader}>
        <div>
          <h2>&gt; COMMUNITY_VOTING</h2>
          <p>{mode === "admin" ? "// ADMIN LOG OF CAST COMMUNITY VOTES" : "// KIOSK MODE FOR APPROVED PROJECT TEAMS"}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/community-favourites" className={styles.headerLink}>
            [ VIEW PUBLIC LEADERBOARD ]
          </Link>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => void loadData("refresh")}
            disabled={refreshing || loading}
          >
            <RefreshCcw aria-hidden="true" size={14} className={refreshing ? styles.spin : ""} />
            <span>{refreshing ? "REFRESHING" : "REFRESH"}</span>
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.cardWrap}>
          <article className={styles.card}>
            {mode === "admin" ? (
              <>
                <div className={styles.cardTop}>
                  <span className={styles.stepBadge}>ADMIN VIEW</span>
                  <h3 className={styles.cardTitle}>Community vote log</h3>
                  <p className={styles.cardSubtitle}>
                    Each ballot shows who voted, which team they came from, and the 3 approved teams they selected.
                  </p>
                </div>

                {loading ? (
                  <div className={styles.emptyState}>{"// LOADING COMMUNITY VOTE LOG..."}</div>
                ) : error ? (
                  <div className={styles.errorBox}>{error}</div>
                ) : ballots.length === 0 ? (
                  <div className={styles.emptyState}>[ NO COMMUNITY VOTES HAVE BEEN CAST YET ]</div>
                ) : (
                  <div className={styles.logList}>
                    {ballots.map((ballot) => (
                      <article key={ballot.id} className={styles.logCard}>
                        <div className={styles.logHeader}>
                          <div>
                            <div className={styles.logTitle}>
                              {ballot.voterName} <span className={styles.logSubtle}>from {ballot.sourceTeamId}</span>
                            </div>
                            <div className={styles.logMeta}>
                              {ballot.voterEmail} · {formatBallotDate(ballot.createdAt)}
                            </div>
                          </div>
                          <div className={styles.logMeta}>Kiosk opened by {ballot.createdByAdmin}</div>
                        </div>
                        <div className={styles.logVotes}>
                          {ballot.votedTeams.map((team, index) => (
                            <div key={team.submissionId} className={styles.logVoteChip}>
                              <span className={styles.logVoteIndex}>#{index + 1}</span>
                              <div>
                                <div className={styles.logVoteTeam}>{team.teamId}</div>
                                <div className={styles.logVoteProject}>{team.projectName}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.cardTop}>
                  <span className={styles.stepBadge}>STEP {step}/4</span>
                  <h3 className={styles.cardTitle}>
                    {step === 1 && "Please enter your team name"}
                    {step === 2 && `Team: ${selectedTeam?.teamId ?? "-"}`}
                    {step === 3 && "Pick your 3 favourite approved projects"}
                    {step === 4 && "Vote submitted"}
                  </h3>
                  <p className={styles.cardSubtitle}>
                    {step === 1 && "Autocomplete only shows approved team IDs."}
                    {step === 2 && "Choose the participant who is casting this vote."}
                    {step === 3 && `${selectedVotes.length} of 3 selected. Your own team is hidden.`}
                    {step === 4 && "This participant is now locked from voting again."}
                  </p>
                </div>

                {loading ? (
                  <div className={styles.emptyState}>{"// LOADING ELIGIBLE TEAMS..."}</div>
                ) : error ? (
                  <div className={styles.errorBox}>{error}</div>
                ) : teams.length === 0 ? (
                  <div className={styles.emptyState}>[ NO APPROVED PROJECTS AVAILABLE FOR COMMUNITY VOTING ]</div>
                ) : (
                  <>
                    {step === 1 ? (
                      <div className={styles.stepBody}>
                        <label className={styles.fieldLabel} htmlFor="team-id-input">
                          TEAM_ID
                        </label>
                        <div className={styles.autocompleteWrap}>
                          <input
                            id="team-id-input"
                            type="text"
                            value={teamInput}
                            onChange={(event) => {
                              setTeamInput(event.target.value);
                              setSelectedTeamId("");
                              setDropdownOpen(true);
                              setSubmitState("");
                            }}
                            onFocus={() => setDropdownOpen(true)}
                            placeholder="TYPE TEAM ID..."
                            className={styles.teamInput}
                            autoComplete="off"
                          />
                          {dropdownOpen && (
                            <div className={styles.dropdown}>
                              {filteredTeams.length === 0 ? (
                                <div className={styles.dropdownEmpty}>NO MATCHING APPROVED TEAM IDs</div>
                              ) : (
                                filteredTeams.map((team) => (
                                  <button
                                    key={team.submissionId}
                                    type="button"
                                    className={styles.dropdownItem}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => handleSelectTeam(team)}
                                  >
                                    <span>{team.teamId}</span>
                                    <span className={styles.dropdownMeta}>{team.projectName}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {selectedTeam ? <TeamPreview team={selectedTeam} /> : null}

                        <div className={styles.footerRow}>
                          <div className={styles.message} aria-live="polite">
                            {submitState}
                          </div>
                          <button type="button" className={styles.primaryButton} onClick={handleTeamNext}>
                            NEXT
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {step === 2 && selectedTeam ? (
                      <div className={styles.stepBody}>
                        <TeamPreview team={selectedTeam} />

                        <div className={styles.memberList}>
                          {selectedTeam.members.map((member) => {
                            const checked = member.email === selectedVoterEmail;
                            return (
                              <label
                                key={member.email}
                                className={`${styles.memberRow} ${member.hasVoted ? styles.memberRowDisabled : ""}`}
                              >
                                <input
                                  type="radio"
                                  name="voter"
                                  value={member.email}
                                  checked={checked}
                                  disabled={member.hasVoted}
                                  onChange={() => {
                                    setSelectedVoterEmail(member.email);
                                    setSubmitState("");
                                  }}
                                />
                                <span className={styles.memberName}>{member.name}</span>
                                <span className={styles.memberMeta}>
                                  {member.hasVoted ? "ALREADY VOTED" : member.email}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {allMembersUsed ? (
                          <div className={styles.warningBox}>
                            Every listed member on this team has already voted. No further vote can be submitted.
                          </div>
                        ) : null}

                        <div className={styles.footerRow}>
                          <button type="button" className={styles.secondaryButton} onClick={() => setStep(1)}>
                            BACK
                          </button>
                          <div className={styles.message} aria-live="polite">
                            {submitState}
                          </div>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleMemberNext}
                            disabled={allMembersUsed}
                          >
                            CONTINUE
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {step === 3 && selectedTeam ? (
                      <div className={styles.stepBody}>
                        <div className={styles.voteCounter}>SELECTED {selectedVotes.length}/3</div>
                        <div className={styles.projectGrid}>
                          {availableTargets.map((team) => {
                            const selected = selectedVotes.includes(team.submissionId);
                            const locked = !selected && selectedVotes.length >= 3;
                            return (
                              <button
                                key={team.submissionId}
                                type="button"
                                className={`${styles.projectCard} ${selected ? styles.projectCardSelected : ""}`}
                                onClick={() => toggleVote(team.submissionId)}
                                disabled={locked}
                              >
                                <div className={styles.projectCardTop}>
                                  <span className={styles.projectTeam}>{team.teamId}</span>
                                  <span className={styles.projectCheck}>{selected ? "[x]" : "[ ]"}</span>
                                </div>
                                <p className={styles.projectName}>{team.projectName}</p>
                                <p className={styles.projectTrack}>{team.track || "UNTAGGED_TRACK"}</p>
                              </button>
                            );
                          })}
                        </div>

                        <div className={styles.footerRow}>
                          <button type="button" className={styles.secondaryButton} onClick={() => setStep(2)}>
                            BACK
                          </button>
                          <div className={styles.message} aria-live="polite">
                            {submitState}
                          </div>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => void handleSubmitVote()}
                            disabled={selectedVotes.length !== 3 || submitting}
                          >
                            {submitting ? "SUBMITTING..." : "SUBMIT"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {step === 4 ? (
                      <div className={styles.stepBody}>
                        <div className={styles.successBox}>
                          Vote recorded for <strong>{selectedMember?.name ?? "participant"}</strong> from{" "}
                          <strong>{selectedTeam?.teamId ?? "team"}</strong>.
                        </div>
                        <div className={styles.footerRow}>
                          <div className={styles.message}>
                            The leaderboard refreshes automatically and this participant cannot vote again.
                          </div>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => {
                              resetFlow();
                              void loadData("refresh");
                            }}
                          >
                            NEXT VOTER
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}
          </article>
        </section>

        <aside className={styles.sidePanel}>
          <div className={styles.sidePanelHead}>
            <h3>&gt; LIVE PREVIEW</h3>
            <p>{"// TOP 5 CURRENTLY LEADING"}</p>
          </div>
          {leaderboard.length === 0 ? (
            <div className={styles.emptyState}>[ NO COMMUNITY VOTES YET ]</div>
          ) : (
            <div className={styles.miniBoard}>
              {leaderboard.slice(0, 5).map((entry) => (
                <div key={entry.submissionId} className={styles.miniBoardRow}>
                  <span className={styles.miniRank}>#{entry.rank}</span>
                  <div className={styles.miniMeta}>
                    <span>{entry.teamId}</span>
                    <span>{entry.projectName}</span>
                  </div>
                  <span className={styles.miniVotes}>{entry.voteCount}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
