"use client";

import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface PracticeQuizProps {
  questions: Question[];
}

export default function PracticeQuiz({ questions }: PracticeQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    new Array(questions.length).fill(""),
  );
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers(new Array(questions.length).fill(""));
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const calculateScore = () => {
    return selectedAnswers.filter(
      (answer, index) => answer === questions[index].answer,
    ).length;
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="text-center bg-indigo-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Hasil Latihan
          </h3>
          <div className="text-6xl font-bold text-indigo-600 mb-2">
            {score}/{questions.length}
          </div>
          <p className="text-xl text-gray-700 mb-4">
            Nilai: {percentage.toFixed(0)}%
          </p>
          <div
            className={`inline-block px-6 py-3 rounded-lg font-semibold ${
              percentage >= 80
                ? "bg-green-100 text-green-800"
                : percentage >= 60
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {percentage >= 80
              ? "🎉 Sangat Baik!"
              : percentage >= 60
                ? "👍 Cukup Baik"
                : "📖 Perlu Belajar Lagi"}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900">Pembahasan:</h4>
          {questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.answer;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-gray-900">
                    {index + 1}. {question.question}
                  </p>
                  {isCorrect ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Jawaban Anda:{" "}
                    </span>
                    <span
                      className={isCorrect ? "text-green-700" : "text-red-700"}
                    >
                      {selectedAnswers[index] || "Tidak dijawab"}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Jawaban Benar:{" "}
                      </span>
                      <span className="text-green-700">{question.answer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleReset}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Ulangi Latihan
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Soal {currentQuestion + 1} dari {questions.length}
          </span>
          <span>
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-lg font-semibold text-gray-900 mb-4">
          {question.question}
        </p>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                selectedAnswers[currentQuestion] === option
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300 bg-white"
              }`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Sebelumnya
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.some((a) => a === "")}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selesai & Lihat Hasil
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Selanjutnya →
          </button>
        )}
      </div>

      {/* Answer Status */}
      <div className="flex flex-wrap gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              selectedAnswers[index]
                ? "bg-indigo-600 text-white"
                : index === currentQuestion
                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
