# Disaster Alert System

A community-based disaster reporting and alert system with AI-powered image analysis.

## Features

- Report disasters with location, severity, and images
- AI-powered image analysis using OpenAI GPT-4o
- Dynamic safety tips based on disaster type
- Points and badge system for community engagement
- Reward redemption system

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## AI Image Analysis

The system uses OpenAI's GPT-4o to analyze disaster images and provide:

- Verification of disaster type
- Damage assessment
- Severity rating
- Safety tips
- Points calculation

To use this feature, you must have a valid OpenAI API key with access to the GPT-4o model.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI API
- shadcn/ui components
