'use client';

import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

// ==========================================
// 🔧 CONFIGURATION
// ==========================================
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '100',
    currency: '$',
    period: '/mo',
    description: 'Perfect for trying out the platform.',
    popular: false,
    buttonText: 'Get Started Free',
    features: [
      { text: '1 Project', included: true },
      { text: 'Basic Analytics', included: true },
      { text: 'Community Support', included: true },
      { text: 'Custom Domains', included: false },
      { text: 'API Access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29',
    currency: '$',
    period: '/mo',
    description: 'Best for freelancers and creators.',
    popular: true, 
    buttonText: 'Get Started',
    features: [
      { text: '10 Projects', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Priority Email Support', included: true },
      { text: 'Custom Domains', included: true },
      { text: 'API Access', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '99',
    currency: '$',
    period: '/mo',
    description: 'For agencies and large teams.',
    popular: false,
    buttonText: 'Get Started',
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: 'Real-time Analytics', included: true },
      { text: '24/7 Dedicated Support', included: true },
      { text: 'Custom Domains', included: true },
      { text: 'API Access', included: true },
    ],
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
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-2">Pricing</h2>
        <p className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
          Simple, transparent pricing
        </p>
        <p className="text-xl text-gray-500">
          No hidden fees. Cancel anytime.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3 lg:gap-8 items-start">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col
              ${plan.popular 
                ? 'border-2 border-indigo-600 shadow-xl scale-100 lg:scale-105 z-10' 
                : 'border border-gray-200 shadow-lg'
              }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
                <Sparkles size={14} /> Most Popular
              </div>
            )}

            <div className="p-8 flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6 h-10">{plan.description}</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{plan.currency}{plan.price}</span>
                <span className="text-gray-500 ml-2">{plan.period}</span>
              </div>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-8
                  ${plan.popular 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
              >
                {plan.buttonText}
              </button>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">What's included</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400 line-through'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}