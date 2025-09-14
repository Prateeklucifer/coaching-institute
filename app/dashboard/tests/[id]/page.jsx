"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TakeTest({ params }) {
  const router = useRouter();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests/${resolvedParams.id}`);
      const data = await res.json();
      if (res.ok) {
        console.log('Fetched test data:', data.test);
        console.log('Questions with correct answers:', data.test.questions);
        setTest(data.test);
        // Initialize answers object
        const initialAnswers = {};
        data.test.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
      } else {
        setError('Failed to fetch test');
      }
    } catch (error) {
      setError('Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    test.questions.forEach((question, index) => {
      console.log(`Question ${index + 1}:`);
      console.log('User answer:', answers[index]);
      console.log('Correct answer:', question.correctOption);
      
      // Convert both to numbers to ensure correct comparison
      if (Number(answers[index]) === Number(question.correctOption)) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const isTestComplete = () => {
    return Object.values(answers).every(answer => answer !== null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push('/dashboard/tests')}
          className="text-primary hover:underline"
        >
          Return to Tests
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="text-gray-600 mb-4">Test not found</div>
        <button
          onClick={() => router.push('/dashboard/tests')}
          className="text-primary hover:underline"
        >
          Return to Tests
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-zinc-50 py-10 px-4 lg:px-10">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">Test Results</h1>
          <div className="mb-8">
            <div className="text-xl mb-2">
              Your Score: {score} out of {test.questions.length}
            </div>
            <div className="text-lg text-gray-600">
              Percentage: {((score / test.questions.length) * 100).toFixed(2)}%
            </div>
          </div>

          <div className="space-y-6">
            {test.questions.map((question, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg ${
                  Number(answers[index]) === Number(question.correctOption)
                    ? 'bg-green-50'
                    : 'bg-red-50'
                }`}
              >
                <div className="font-medium mb-2">
                  Question {index + 1}: {question.questionText}
                </div>
                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`p-2 rounded ${
                        Number(optionIndex) === Number(question.correctOption)
                          ? 'bg-green-100 text-green-800'
                          : Number(answers[index]) === Number(optionIndex)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-50'
                      }`}
                    >
                      {option.optionText}
                      {optionIndex === question.correctOption && (
                        <span className="ml-2 text-green-600">(Correct Answer)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard/tests')}
            className="mt-8 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
            <p className="text-gray-600">{test.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {test.questions.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1))}
                  disabled={currentQuestion === test.questions.length - 1}
                  className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">
              {test.questions[currentQuestion].questionText}
            </h2>
            <div className="space-y-3">
              {test.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion, index)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    answers[currentQuestion] === index
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {option.optionText}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {Object.values(answers).filter(a => a !== null).length} of {test.questions.length} questions answered
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isTestComplete()}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
