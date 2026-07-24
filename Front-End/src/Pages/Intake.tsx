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
import { ArrowLeft, Sparkles } from "lucide-react";

const quickRoles = [
  "Software Engineer",
  "Product Manager",
  "Data Analyst",
  "Sales Representative",
  "Marketing Manager",
];

function Intake(): JSX.Element {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobType, setJobType] = useState("");
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewer, setInterviewer] = useState<InterviewerType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!firstName || !lastName || !jobType || !position || !companyName || !jobDescription || !interviewer) {
      setError("Please fill out every field before starting.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
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
    } catch (err) {
      console.error("Error starting interview:", err);
      setError("Could not continue to the interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleValueChange = (value: string) => {
    const selectedModel = models.find((model) => model.model === value);
    if (selectedModel) setInterviewer(selectedModel);
  };

  const applyQuickRole = (role: string) => {
    setPosition(role);
    if (!jobType) setJobType("full-time");
  };

  const fieldStyle = "border-slate-300 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 rounded-lg h-11";
  const labelStyle = "text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="w-full border-b border-slate-200 bg-white px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600" />
          <span className="font-semibold tracking-tight">MockMate</span>
        </div>
        <Button
          variant="ghost"
          className="gap-2 text-slate-500 hover:text-slate-900"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <main className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Set up your mock interview</h1>
          <p className="text-slate-500 mt-1 mb-8">One page, then straight into the call.</p>

          {/* Quick role chips */}
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Quick fill</p>
            <div className="flex flex-wrap gap-2">
              {quickRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => applyQuickRole(role)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    position === role
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first-name" className={labelStyle}>First name</Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} placeholder="John" className={fieldStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last-name" className={labelStyle}>Last name</Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} placeholder="Doe" className={fieldStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="position" className={labelStyle}>Job position</Label>
              <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} maxLength={100} placeholder="e.g., Software Engineer" className={fieldStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-name" className={labelStyle}>Company name</Label>
              <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={100} placeholder="e.g., Google" className={fieldStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="interviewer" className={labelStyle}>Interviewer</Label>
              <Select value={interviewer?.model || ""} onValueChange={handleValueChange}>
                <SelectTrigger id="interviewer" className={fieldStyle}>
                  <SelectValue placeholder="Select an interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.model} value={model.model}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="job-description" className={labelStyle}>Job description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                maxLength={600}
                placeholder="Paste the job description, or briefly describe the role (max 600 characters)."
                className="resize-none border-slate-300 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 rounded-lg min-h-[120px]"
              />
              <p className="text-right text-xs text-slate-400">{jobDescription.length}/600</p>
            </div>
          </div>

          {error && <div className="mt-6"><AlertDestructive error={error} /></div>}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-11 px-6 gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? "Starting…" : "Start interview"}
            </Button>
          </div>
        </main>

        {/* Live summary */}
        <aside className="lg:sticky lg:top-8 h-fit bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">Session preview</p>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Candidate</dt>
              <dd className="text-slate-900 text-right">{firstName || lastName ? `${firstName} ${lastName}`.trim() : "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Role</dt>
              <dd className="text-slate-900 text-right">{position || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Type</dt>
              <dd className="text-slate-900 text-right capitalize">{jobType || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2 pt-3 border-t border-slate-100">
              <dt className="text-slate-500">Company</dt>
              <dd className="text-slate-900 text-right">{companyName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Interviewer</dt>
              <dd className="text-slate-900 text-right">{interviewer?.name?.split("(")[0] || "—"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

export default Intake;