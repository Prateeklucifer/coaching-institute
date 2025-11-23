'use client';

import React from 'react';
import { Check, CheckCircle, Clock, Award, BookOpen, Users, FileText, HelpCircle, X, Sparkles } from 'lucide-react';

// ==========================================
// 🔧 CONFIGURATION
// ==========================================
const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '999',
    currency: '₹',
    period: '/year',
    duration: '1 year',
    description: 'Ideal for beginners starting their learning journey',
    popular: false,
    buttonText: 'Enroll Now',
    features: [
      { text: 'Access to basic study materials', included: true },
      { text: '2 live classes per week', included: true },
      { text: 'Weekly assignments', included: true },
      { text: 'Email support', included: true },
      { text: 'Doubt clearing sessions', included: false },
      { text: 'Certificate of completion', included: false },
    ],
    icon: <BookOpen className="w-8 h-8 text-blue-600" />
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '1999',
    currency: '₹',
    period: '/month',
    duration: '6 months',
    description: 'Comprehensive learning experience with additional support',
    popular: true,
    buttonText: 'Get Premium',
    features: [
      { text: 'All Basic Plan features', included: true },
      { text: '4 live classes per week', included: true },
      { text: 'Daily doubt clearing sessions', included: true },
      { text: 'Weekly mock tests', included: true },
      { text: 'Certificate of completion', included: true },
      { text: 'Priority support', included: true },
    ],
    icon: <Award className="w-8 h-8 text-yellow-500" />
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    price: '3499',
    currency: '₹',
    period: '/month',
    duration: '12 months',
    description: 'Complete package for serious learners',
    popular: false,
    buttonText: 'Go Elite',
    features: [
      { text: 'All Premium Plan features', included: true },
      { text: 'Unlimited live classes', included: true },
      { text: '24/7 doubt support', included: true },
      { text: 'Personalized study plan', included: true },
      { text: 'Monthly one-on-one mentorship', included: true },
      { text: 'Guaranteed internship opportunity', included: true },
    ],
    icon: <Users className="w-8 h-8 text-purple-600" />
  },
];

export default function PricingPage() {
  
  const handlePlanSelect = (plan) => {
    // Create query parameters
    const params = new URLSearchParams({
      plan: plan.name,
      amount: plan.price
    });
    
    // Use standard browser navigation to avoid Next.js specific errors in preview
    window.location.href = `/checkout?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Our Pricing Plans</h2>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Affordable Learning Solutions
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan that fits your learning needs and budget
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-2xl transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden
                ${plan.popular 
                  ? 'border-2 border-blue-500 shadow-xl transform lg:scale-105 z-10 bg-white' 
                  : 'border border-gray-200 bg-white hover:border-blue-200'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  {plan.icon}
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-gray-600 mb-6 min-h-[3rem]">{plan.description}</p>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold text-blue-700">{plan.currency}{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-1">Duration: {plan.duration}</p>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mb-8
                    ${plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transform hover:scale-105' 
                      : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700'
                    }`}
                >
                  {plan.buttonText}
                </button>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>What's included:</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className={`px-6 py-3 text-center text-sm font-medium ${
                plan.popular ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>7-day money back guarantee</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}