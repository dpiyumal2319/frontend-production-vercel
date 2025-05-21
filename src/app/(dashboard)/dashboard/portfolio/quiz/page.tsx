"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import AxiosInstance from "@/lib/client-fetcher";
import { getCurrentUser } from "@/actions/auth";
import { User } from "@/lib/types/user";
import { Loader2 } from "lucide-react";

type Option = {
  label: string;
  score: number;
};

type Question = {
  question: string;
  options: Option[];
  weight: number;
};

const questions: Question[] = [
  {
    question: "What is your age?",
    options: [
      { label: "Under 30", score: 100 },
      { label: "30-45", score: 80 },
      { label: "46-60", score: 50 },
      { label: "Above 60", score: 20 },
    ],
    weight: 0.2,
  },
  {
    question: "What is your investment duration?",
    options: [
      { label: "Less than 2 years", score: 20 },
      { label: "2-5 years", score: 40 },
      { label: "6-10 years", score: 70 },
      { label: "More than 10 years", score: 100 },
    ],
    weight: 0.15,
  },
  {
    question: "What is your main investment objective?",
    options: [
      { label: "Capital Preservation", score: 20 },
      { label: "Income Generation", score: 40 },
      { label: "Moderate Growth", score: 70 },
      { label: "Aggressive Growth", score: 100 },
    ],
    weight: 0.25,
  },
  {
    question: "How do you rate your financial knowledge?",
    options: [
      { label: "Limited", score: 20 },
      { label: "Average", score: 60 },
      { label: "Expert", score: 100 },
    ],
    weight: 0.15,
  },
  {
    question: "How would you react if your portfolio drops 20% suddenly?",
    options: [
      { label: "Sell everything", score: 10 },
      { label: "Sell partially", score: 30 },
      { label: "Hold and wait", score: 70 },
      { label: "Invest more", score: 100 },
    ],
    weight: 0.15,
  },
  {
    question: "How stable is your annual income?",
    options: [
      { label: "Very unstable", score: 10 },
      { label: "Somewhat stable", score: 60 },
      { label: "Very stable", score: 100 },
    ],
    weight: 0.1,
  },
];

export default function RiskAssessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);

  // 1) Pull everything back out of the URL
  const tickersParam = searchParams.get("tickers") || "[]";
  const tickers = JSON.parse(decodeURIComponent(tickersParam)) as string[];

  const years = searchParams.get("years") ?? "";
  const investmentAmount = searchParams.get("inv") ?? "";
  const targetAmount = searchParams.get("tgt") ?? "";

  ///

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionClick = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const handleNextClick = () => {
    if (answers[currentQuestion] !== null) {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
    }
  };

  const handleBackClick = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const totalScore = answers.reduce((sum, optionIndex, idx) => {
    if (optionIndex === null) return sum;
    const optionScore = questions[idx].options[optionIndex].score;
    return sum! + optionScore * questions[idx].weight;
  }, 0);

  const maxPossibleScore = questions.reduce(
    (acc, q) => acc + Math.max(...q.options.map((o) => o.score)) * q.weight,
    0
  );

  const getRiskProfile = (score: number) => {
    const percentage = (score / maxPossibleScore) * 100;
    if (percentage >= 80)
      return { type: "Aggressive", color: "bg-destructive" };
    if (percentage >= 60)
      return { type: "Moderate-Aggressive", color: "bg-warning" };
    if (percentage >= 40) return { type: "Moderate", color: "bg-info" };
    if (percentage >= 20)
      return { type: "Conservative-Moderate", color: "bg-primary" };
    return { type: "Conservative", color: "bg-okay" };
  };

  const progress = (currentQuestion / questions.length) * 100;
  const riskProfile = getRiskProfile(totalScore!);

  ///

  //Getting current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const handleCompleteQuiz = async () => {
    setIsLoading(true);
    if (!user) return;
    const val = totalScore;
    if (val === null || isNaN(val)) return;
    const form = new URLSearchParams();
    form.append("user_id", user.user_id);
    form.append("score", val.toString());
    try {
      // 1) Persist it
      await AxiosInstance.post("/profile/risk_score", form);
      // 3) Rebuild the full query, adding the quiz score
      const params = new URLSearchParams({
        step: "4",
        risk_score_percent: val.toString(),
        tickers: JSON.stringify(tickers),
        years,
        inv: investmentAmount,
        tgt: targetAmount,
      });
      router.push(`/dashboard/portfolio?${params.toString()}`);
    } catch (err) {
      console.error("Failed to save risk score:", err);
      // optionally show an error toast or inline message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb className="mt-4 ml-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/portfolio">
              Portfolio Optimization
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="text-foreground font-medium">
              Quiz
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Custom Risk Level Quiz</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Enter your desired risk level (0–100):</p>
          <Label htmlFor="riskScore">Risk Level</Label>
          <Input
            id="riskScore"
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 30"
          />
          <Button onClick={handleCompleteQuiz} disabled={score === ""}>
            Submit Quiz
          </Button>
        </CardContent>
      </Card> */}
      <div className="-mt-20 min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-card rounded-lg shadow-xl overflow-hidden border border-border">
          <div className="bg-primary px-6 py-5">
            <h1 className="text-2xl font-bold text-primary-foreground">
              Investment Risk Assessment
            </h1>
            {!completed && (
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary-foreground rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-primary-foreground/80 mt-2">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            )}
          </div>

          <div className="p-6">
            {!completed ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {questions[currentQuestion].question}
                </h2>
                <div className="space-y-3 mb-8">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300
                      ${
                        answers[currentQuestion] === idx
                          ? "bg-primary/10 border-primary border-2 text-foreground"
                          : "bg-secondary hover:bg-accent border border-border hover:border-primary/50 text-foreground"
                      }
                      font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50`}
                      onClick={() => handleOptionClick(idx)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  {currentQuestion > 0 ? (
                    <button
                      className="px-6 py-2 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200"
                      onClick={handleBackClick}
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      answers[currentQuestion] !== null
                        ? "bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                    onClick={handleNextClick}
                    disabled={answers[currentQuestion] === null}
                  >
                    {currentQuestion === questions.length - 1
                      ? "Finish"
                      : "Next"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Assessment Complete
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Thank you for completing the assessment
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-6 border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-card-foreground font-medium">
                      Your Risk Score:
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {totalScore!.toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-3 ${riskProfile.color} transition-all duration-1000 ease-out`}
                        style={{
                          width: `${(totalScore! / maxPossibleScore) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <span className="px-4 py-2 rounded-full bg-primary/20 text-primary font-medium">
                      {riskProfile.type} Investor
                    </span>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Based on your answers, we&apos;ve determined your investor
                      profile. This can help guide your investment strategy.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-2">
                  <button
                    className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors"
                    onClick={() => {
                      setCurrentQuestion(0);
                      setCompleted(false);
                      setAnswers(Array(questions.length).fill(null));
                    }}
                  >
                    Start Over
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center py-3 bg-okay hover:bg-okay/80 text-white font-medium rounded-lg transition-colors"
                    onClick={() => {
                      handleCompleteQuiz();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2
                        className="h-5 w-5 animate-spin"
                        aria-label="Loading…"
                      />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
