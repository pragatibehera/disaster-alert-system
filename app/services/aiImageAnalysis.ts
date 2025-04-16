// services/ai-image-analysis.ts

// This service will handle communication with OpenAI's API for image analysis
// and generating safety tips based on the disaster type

import { OpenAI } from "openai";

// Initialize the OpenAI client
// In production, load this from environment variables
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true, // Add this option to allow browser usage
});

// Add a check to ensure the API key is available
const isValidApiKey =
  !!process.env.NEXT_PUBLIC_OPENAI_API_KEY &&
  process.env.NEXT_PUBLIC_OPENAI_API_KEY !== "your_openai_api_key_here";

// Types for our image analysis response
export interface ImageAnalysisResult {
  isValidDisaster: boolean;
  detectedDamage: {
    exists: boolean;
    severity: "low" | "medium" | "high";
    description: string;
    specificThreats: string[];
  };
  detectedDisasterType?: string;
  confidence: number;
  pointsAwarded: {
    base: number;
    clarity: number;
    severity: number;
    urgency: number;
    total: number;
  };
  safetyTips: {
    immediate: SafetyTip[];
    preventive: SafetyTip[];
    recovery: SafetyTip[];
  };
  imageQuality: {
    isGoodQuality: boolean;
    isClear: boolean;
    hasGoodLighting: boolean;
  };
}

export interface SafetyTip {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon?: string;
}

/**
 * Analyzes an image to verify if it shows disaster damage
 * @param imageBase64 Base64 encoded image data
 * @param reportedDisasterType The disaster type reported by user
 */
export async function analyzeDisasterImage(
  imageBase64: string,
  reportedDisasterType: string
): Promise<ImageAnalysisResult> {
  try {
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI trained to analyze disaster images. Provide detailed analysis including severity, specific threats, and customized safety tips. Format response as JSON without markdown formatting, code blocks, or backticks.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this disaster image and provide:
                1. Verify if it shows a ${reportedDisasterType}
                2. Assess damage severity and specific threats
                3. Evaluate image quality
                4. Generate relevant safety tips
                5. Calculate points based on:
                   - Base points (50 for valid disaster image)
                   - Clarity bonus (0-50 points)
                   - Severity points (low: 50, medium: 100, high: 150)
                   - Urgency bonus (0-50 points for time-critical situations)
                Format as a valid JSON object with no markdown, no code blocks, and no backticks.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    // Extract the response text
    const rawContent = response.choices[0].message.content || "{}";

    // Clean up the response - remove any markdown code blocks, backticks, etc.
    let cleanedContent = rawContent;

    // Remove markdown code block indicators
    cleanedContent = cleanedContent.replace(/```json\s*/g, "");
    cleanedContent = cleanedContent.replace(/```\s*$/g, "");
    cleanedContent = cleanedContent.replace(/```/g, "");

    // Find JSON object in the text if it's surrounded by other text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    console.log("Cleaned JSON content:", cleanedContent);

    // Parse the AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.log("Raw response:", rawContent);

      // Fall back to default values
      aiResponse = {
        isValidDisaster: true,
        severity: "medium",
        description:
          "Image analysis succeeded but response format was unexpected.",
        specificThreats: ["Unspecified threat"],
        imageQuality: {
          isGoodQuality: true,
          isClear: true,
          hasGoodLighting: true,
        },
        urgencyScore: 25,
      };
    }

    // Calculate total points
    const points = {
      base: aiResponse.isValidDisaster ? 50 : 0,
      clarity: aiResponse.imageQuality?.isClear ? 50 : 0,
      severity:
        aiResponse.severity === "high"
          ? 150
          : aiResponse.severity === "medium"
          ? 100
          : 50,
      urgency: aiResponse.urgencyScore || 0,
      total: 0,
    };
    points.total =
      points.base + points.clarity + points.severity + points.urgency;

    // Generate safety tips based on AI analysis
    const safetySuggestions = generateSafetyTips(
      aiResponse.detectedDisasterType || reportedDisasterType,
      aiResponse.specificThreats || []
    );

    return {
      isValidDisaster: aiResponse.isValidDisaster || false,
      detectedDamage: {
        exists: aiResponse.damageExists || false,
        severity: aiResponse.severity || "low",
        description:
          aiResponse.description || "No detailed description available",
        specificThreats: aiResponse.specificThreats || [],
      },
      detectedDisasterType:
        aiResponse.detectedDisasterType || reportedDisasterType,
      confidence: aiResponse.confidence || 0.5,
      pointsAwarded: points,
      safetyTips: {
        immediate: safetySuggestions.immediate,
        preventive: safetySuggestions.preventive,
        recovery: safetySuggestions.recovery,
      },
      imageQuality: {
        isGoodQuality: aiResponse.imageQuality?.isGoodQuality || false,
        isClear: aiResponse.imageQuality?.isClear || false,
        hasGoodLighting: aiResponse.imageQuality?.hasGoodLighting || false,
      },
    };
  } catch (error) {
    console.error("Error analyzing image:", error);

    // Provide more specific error messages based on error type
    let errorMessage = "Unable to analyze image due to a technical issue.";
    if (error instanceof Error) {
      if (error.message.includes("model")) {
        errorMessage = "AI model not available. Please try again later.";
      } else if (error.message.includes("API key")) {
        errorMessage =
          "API authentication error. Please check your API configuration.";
      } else if (error.message.includes("timeout")) {
        errorMessage =
          "Analysis timed out. Please try with a smaller image or try again later.";
      }
    }

    return {
      isValidDisaster: false,
      detectedDamage: {
        exists: false,
        severity: "low",
        description: errorMessage,
        specificThreats: [],
      },
      confidence: 0,
      pointsAwarded: {
        base: 0,
        clarity: 0,
        severity: 0,
        urgency: 0,
        total: 0,
      },
      safetyTips: {
        immediate: [
          {
            title: "Error Processing Image",
            description:
              "Could not analyze the image. Try uploading a clearer photo.",
            priority: "high",
            icon: "AlertCircle",
          },
        ],
        preventive: [],
        recovery: [],
      },
      imageQuality: {
        isGoodQuality: false,
        isClear: false,
        hasGoodLighting: false,
      },
    };
  }
}

function generateSafetyTips(
  disasterType: string,
  specificThreats: string[]
): { immediate: SafetyTip[]; preventive: SafetyTip[]; recovery: SafetyTip[] } {
  const baseTips = getSafetyTips(disasterType);

  // Categorize tips by urgency
  const immediate: SafetyTip[] = [];
  const preventive: SafetyTip[] = [];
  const recovery: SafetyTip[] = [];

  // Add base tips to appropriate categories
  baseTips.forEach((tip) => {
    if (tip.priority === "high") {
      immediate.push(tip);
    } else if (tip.priority === "medium") {
      preventive.push(tip);
    } else {
      recovery.push(tip);
    }
  });

  // Add specific threat-based tips
  specificThreats.forEach((threat) => {
    immediate.push({
      title: `Immediate Action Required`,
      description: `Address immediate threat: ${threat}`,
      priority: "high",
      icon: "AlertTriangle",
    });
  });

  return {
    immediate,
    preventive,
    recovery,
  };
}

/**
 * Get safety tips based on disaster type
 * @param disasterType The type of disaster
 * @returns Array of safety tips
 */
export function getSafetyTips(disasterType: string): SafetyTip[] {
  // Normalize disaster type
  const normalizedType = disasterType.toLowerCase();

  // Common safety tips for all disaster types
  const commonTips: SafetyTip[] = [
    {
      title: "Stay Informed",
      description:
        "Keep a radio or phone charged to receive emergency alerts and updates.",
      priority: "high",
      icon: "Radio",
    },
    {
      title: "Emergency Kit",
      description:
        "Maintain an emergency kit with water, non-perishable food, medications, and first aid supplies.",
      priority: "high",
      icon: "Package",
    },
  ];

  // Disaster-specific safety tips
  const specificTips: Record<string, SafetyTip[]> = {
    flood: [
      {
        title: "Avoid Floodwaters",
        description:
          "Never walk, swim, or drive through flood waters. Just 6 inches of moving water can knock you down.",
        priority: "high",
        icon: "Droplets",
      },
      {
        title: "Move to Higher Ground",
        description:
          "Evacuate if told to do so or if you feel unsafe. Move to higher ground away from water.",
        priority: "high",
        icon: "ArrowUp",
      },
      {
        title: "Electrical Hazards",
        description:
          "Stay away from power lines and electrical wiring. Don't use electrical appliances in flooded areas.",
        priority: "medium",
        icon: "Zap",
      },
    ],

    earthquake: [
      {
        title: "Drop, Cover, and Hold On",
        description:
          "During shaking, drop to the ground, take cover under sturdy furniture, and hold on until shaking stops.",
        priority: "high",
        icon: "ShieldAlert",
      },
      {
        title: "Stay Away from Windows",
        description:
          "Move away from windows, glass, and exterior walls to avoid injury from shattered glass.",
        priority: "medium",
        icon: "XCircle",
      },
      {
        title: "Check for Injuries",
        description:
          "After shaking stops, check yourself and others for injuries. Provide first aid if needed.",
        priority: "medium",
        icon: "HeartPulse",
      },
    ],

    wildfire: [
      {
        title: "Evacuate Immediately",
        description:
          "Follow evacuation orders without delay. Take only essential items and leave early to avoid being caught in fire.",
        priority: "high",
        icon: "LogOut",
      },
      {
        title: "Protect Against Smoke",
        description:
          "If trapped in smoke, stay low to the ground where air is clearer. Use a wet cloth to cover nose and mouth.",
        priority: "high",
        icon: "Wind",
      },
      {
        title: "Clear Defensible Space",
        description:
          "If preparing your property, remove flammable materials from around your home.",
        priority: "medium",
        icon: "Home",
      },
    ],

    hurricane: [
      {
        title: "Secure Your Home",
        description:
          "Board up windows and secure outdoor items that could become projectiles in high winds.",
        priority: "high",
        icon: "Lock",
      },
      {
        title: "Evacuate if Ordered",
        description:
          "Follow evacuation orders. Know your evacuation route and prepare your vehicle in advance.",
        priority: "high",
        icon: "Navigation",
      },
      {
        title: "Avoid Flood Waters",
        description:
          "After the storm, avoid walking or driving through flood waters. Just 6 inches of water can sweep you away.",
        priority: "medium",
        icon: "AlertTriangle",
      },
    ],

    tornado: [
      {
        title: "Find Shelter Immediately",
        description:
          "Go to a basement, storm cellar, or interior room without windows on the lowest floor.",
        priority: "high",
        icon: "Home",
      },
      {
        title: "Protect Your Head",
        description:
          "Cover your head and neck with your arms and use blankets or furniture for additional protection.",
        priority: "high",
        icon: "Shield",
      },
      {
        title: "Avoid Vehicles",
        description:
          "Do not try to outrun a tornado in a vehicle. Leave the vehicle and seek shelter in a sturdy building.",
        priority: "medium",
        icon: "Car",
      },
    ],

    landslide: [
      {
        title: "Move Away from Path",
        description:
          "Quickly move out of the path of the landslide or mudflow. Move uphill if possible.",
        priority: "high",
        icon: "ArrowUpRight",
      },
      {
        title: "Listen for Sounds",
        description:
          "Listen for unusual sounds like trees cracking or boulders knocking together that might indicate moving debris.",
        priority: "medium",
        icon: "Ear",
      },
      {
        title: "Stay Alert",
        description:
          "Stay awake and alert during storms that could trigger landslides. Many deaths occur when people are sleeping.",
        priority: "medium",
        icon: "AlertCircle",
      },
    ],
  };

  // Match the disaster type to our known types
  for (const [type, tips] of Object.entries(specificTips)) {
    if (normalizedType.includes(type)) {
      return [...tips, ...commonTips];
    }
  }

  // If no specific match is found, return common tips
  return commonTips;
}
