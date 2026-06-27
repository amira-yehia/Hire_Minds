import { useState } from "react";
import CandidateSidebar from "./CandidateSidebar";

const challenges = [
  {
    difficulty: "Easy",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: ["Input: nums = [2,7,11,15], target = 9", "Output: [0,1]", "Explanation: nums[0] + nums[1] == 9"],
    meta: ["15 test cases", "2s", "256MB"],
  },
  {
    difficulty: "Medium",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Find the length of the longest substring without duplicate characters while preserving the order of the original string.",
    example: ["Input: s = 'abcabcbb'", "Output: 3", "Explanation: The answer is 'abc'."],
    meta: ["21 test cases", "3s", "256MB"],
  },
  {
    difficulty: "Hard",
    title: "Merge K Sorted Lists",
    description:
      "Merge k sorted linked lists and return one sorted list. Analyze and optimize your complexity.",
    example: ["Input: lists = [[1,4,5],[1,3,4],[2,6]]", "Output: [1,1,2,3,4,4,5,6]", "Explanation: Values are merged in sorted order."],
    meta: ["18 test cases", "4s", "512MB"],
  },
];

const starterCode = `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`;

export default function CandidateAssessment() {
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [code, setCode] = useState(starterCode);
  const currentChallenge = challenges[activeChallenge];

  return (
    <div className="candidate-shell">
      <CandidateSidebar />
      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>Code Assessment</h1>
            <p>Solve three calibrated problems in your preferred language.</p>
          </div>
          <div className="candidate-timer">
            <i className="bx bx-time-five"></i>
            <span>Time Remaining: 1:28:45</span>
          </div>
        </header>

        <section className="candidate-assessment-layout">
          <article className="candidate-problem-panel">
            <div className="candidate-tabs">
              {challenges.map((challenge, index) => (
                <button
                  className={activeChallenge === index ? "active" : ""}
                  key={challenge.title}
                  onClick={() => setActiveChallenge(index)}
                  type="button"
                >
                  <span className={challenge.difficulty.toLowerCase()}>{challenge.difficulty}</span>
                  {challenge.title}
                </button>
              ))}
            </div>

            <div className="candidate-problem-body">
              <h2>{currentChallenge.title}</h2>
              <p>{currentChallenge.description}</p>

              <div className="candidate-example-box">
                <strong>Example 1</strong>
                {currentChallenge.example.map((line) => (
                  <code key={line}>{line}</code>
                ))}
              </div>

              <div className="candidate-problem-meta">
                {currentChallenge.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </article>

          <article className="candidate-editor-panel">
            <div className="candidate-editor-toolbar">
              <select aria-label="Programming language" defaultValue="Python">
                <option>Python</option>
                <option>JavaScript</option>
                <option>C++</option>
                <option>Java</option>
              </select>
              <div>
                <button className="candidate-run-button" type="button">
                  <i className="bx bx-play"></i> Run
                </button>
                <button className="candidate-submit-button" type="button">
                  Submit
                </button>
              </div>
            </div>
            <textarea
              aria-label="Code editor"
              className="candidate-code-editor"
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              value={code}
            />
          </article>
        </section>
      </main>
    </div>
  );
}
