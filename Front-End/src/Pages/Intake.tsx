import { Button } from "@/components/ui/button";
import { AlertDestructive } from "@/components/ui/AlertDestructive";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { models } from "@/assets/models";
import { InterviewerType } from "@/utils/types";
import Waveform from "@/components/Waveform";
import { Check } from "lucide-react";

function Intake(): JSX.Element {
  const [page, setPage] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobType, setJobType] = useState("");
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewer, setInterviewer] = useState<InterviewerType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validatePage1 = () => {
    if (!firstName || !lastName || !jobType || !position) {
      setError("Please fill out all fields on this page.");
      return false;
    }
    setError(null);
    return true;
  };

  const validatePage2 = () => {
    if (!interviewer || !companyName || !jobDescription) {
      setError("Please fill out all fields on this page.");
      return false;
    }
    setError(null);
    return true;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validatePage2() || submitting) return;

    try {
      setSubmitting(true);
      navigate("/meeting", {
        state: {
          firstName,
          lastName,
          jobType,
          position,
          companyName,
          jobDescription,
          interviewer,
          fromIntake: true,
        },
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      setError("Could not continue to the interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleValueChange = (value: string) => {
    const selectedModel = models.find((model) => model.model === value);
    if (selectedModel) {
      setInterviewer(selectedModel);
    }
  };

  const fieldStyle = "mm-field-underline text-[var(--mm-paper)] h-10 focus-visible:ring-0 focus-visible:ring-offset-0";
  const labelStyle = "mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-slate)]";

  const steps = [
    {
      n: 1,
      label: "Basics",
      summary: firstName ? `${firstName} ${lastName} · ${position || "—"}` : null,
    },
    {
      n: 2,
      label: "Details",
      summary: companyName ? companyName : null,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[var(--mm-ink)] text-[var(--mm-paper)]">
      <div className="w-full border-b border-[var(--mm-ink-line)] px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Waveform live bars={10} className="text-[var(--mm-signal)] h-3" />
          <span className="mm-eyebrow">New case file</span>
        </div>
        <Button
          className="mm-btn-ghost rounded-none h-10 px-5"
          onClick={() => navigate("/home")}
        >
          Back to dashboard
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">

        {/* Sidebar — vertical stepper + live-building case card */}
        <aside className="flex flex-col gap-10">
          <div className="relative flex flex-col gap-8">
            {steps.map((step) => {
              const isDone = page > step.n;
              const isActive = page === step.n;
              return (
                <div key={step.n} className="relative pl-9">
                  {step.n < steps.length && <div className="mm-stepper-line" />}
                  <div
                    className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border mm-font-mono text-xs
                      ${isActive ? "border-[var(--mm-signal)] text-[var(--mm-signal)]" : isDone ? "border-[var(--mm-teal)] bg-[var(--mm-teal)] text-[var(--mm-ink)]" : "border-[var(--mm-ink-line)] text-[var(--mm-slate)]"}`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : step.n}
                  </div>
                  <p className={`mm-font-mono text-xs uppercase tracking-widest ${isActive ? "text-[var(--mm-paper)]" : "text-[var(--mm-slate)]"}`}>
                    {step.label}
                  </p>
                  {step.summary && (
                    <p className="text-sm text-[var(--mm-slate)] mt-1">{step.summary}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live-building case card */}
          <div className="mm-panel p-5">
            <span className="mm-eyebrow block mb-3">Case file preview</span>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--mm-slate)]">Candidate</dt>
                <dd className="text-[var(--mm-paper)] text-right">
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--mm-slate)]">Role</dt>
                <dd className="text-[var(--mm-paper)] text-right">{position || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--mm-slate)]">Type</dt>
                <dd className="text-[var(--mm-paper)] text-right capitalize">{jobType || "—"}</dd>
              </div>
              <div className="mm-tape pt-2 flex justify-between gap-2">
                <dt className="text-[var(--mm-slate)]">Company</dt>
                <dd className="text-[var(--mm-paper)] text-right">{companyName || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--mm-slate)]">Interviewer</dt>
                <dd className="text-[var(--mm-paper)] text-right">{interviewer?.name?.split("(")[0] || "—"}</dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Active step form — full-width fields, no boxed card */}
        <main>
          {page === 1 && (
            <>
              <h2 className="mm-font-display text-2xl text-[var(--mm-paper)] mb-1">Job information</h2>
              <p className="text-sm text-[var(--mm-slate)] mb-8">
                Tell us who you are and what role you're prepping for.
              </p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7 max-w-2xl">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="first-name" className={labelStyle}>First name</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={50}
                    placeholder="John"
                    className={fieldStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="last-name" className={labelStyle}>Last name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    maxLength={50}
                    placeholder="Doe"
                    className={fieldStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="job-type" className={labelStyle}>Job type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger id="job-type" className={fieldStyle}>
                      <SelectValue placeholder="Select a job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="position" className={labelStyle}>Job position</Label>
                  <Input
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    maxLength={100}
                    placeholder="e.g., Software Engineer"
                    className={fieldStyle}
                  />
                </div>
              </div>
            </>
          )}

          {page === 2 && (
            <>
              <h2 className="mm-font-display text-2xl text-[var(--mm-paper)] mb-1">Job details</h2>
              <p className="text-sm text-[var(--mm-slate)] mb-8">
                The more specific, the sharper the questions.
              </p>
              <div className="grid gap-7 max-w-2xl">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="company-name" className={labelStyle}>Company name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={100}
                    placeholder="e.g., Google"
                    className={fieldStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="job-description" className={labelStyle}>Job description</Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    maxLength={600}
                    placeholder="Briefly describe the job (max 600 characters)."
                    className="resize-none mm-field-underline text-[var(--mm-paper)] min-h-[110px]"
                  />
                  <p className="text-right text-xs mm-font-mono text-[var(--mm-slate)]">
                    {jobDescription.length}/600
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="interviewer" className={labelStyle}>Interviewer</Label>
                  <Select
                    value={interviewer?.model || ""}
                    onValueChange={(value) => handleValueChange(value)}
                  >
                    <SelectTrigger id="interviewer" className={fieldStyle}>
                      <SelectValue placeholder="Select an interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.model} value={model.model}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between mt-10 pt-6 mm-tape max-w-2xl">
            {page > 1 ? (
              <Button className="mm-btn-ghost rounded-none h-11 px-5" onClick={() => setPage(page - 1)}>
                Back
              </Button>
            ) : <span />}
            {page < 2 ? (
              <Button
                className="mm-btn-primary rounded-none h-11 px-5"
                onClick={() => {
                  if (validatePage1()) setPage(page + 1);
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                className="mm-btn-primary rounded-none h-11 px-5"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Start interview"}
              </Button>
            )}
          </div>
          {error && <div className="max-w-2xl mt-4"><AlertDestructive error={error} /></div>}
        </main>
      </div>
    </div>
  );
}

export default Intake;