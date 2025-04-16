"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronLeft,
  MapPin,
  Shield,
  Upload,
  X,
  AlertTriangle,
  Trophy,
  Award,
  Gift,
  Star,
  Check,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedPageHeader } from "@/components/animated-page-header";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  analyzeDisasterImage,
  ImageAnalysisResult,
  getSafetyTips,
  SafetyTip,
} from "../services/aiImageAnalysis";

// Define badge types and requirements
const BADGES = [
  {
    id: "first_report",
    name: "First Responder",
    description: "Submit your first disaster report",
    icon: Shield,
    color: "bg-blue-100 text-blue-600",
    requirement: 1,
    points: 100,
  },
  {
    id: "five_reports",
    name: "Community Guardian",
    description: "Submit 5 disaster reports",
    icon: Award,
    color: "bg-green-100 text-green-600",
    requirement: 5,
    points: 500,
  },
  {
    id: "ten_reports",
    name: "Safety Sentinel",
    description: "Submit 10 disaster reports",
    icon: Trophy,
    color: "bg-amber-100 text-amber-600",
    requirement: 10,
    points: 1000,
  },
  {
    id: "verified_reporter",
    name: "Verified Reporter",
    description: "Get 3 reports verified by authorities",
    icon: Star,
    color: "bg-purple-100 text-purple-600",
    requirement: 3,
    points: 750,
  },
  {
    id: "disaster_expert",
    name: "Disaster Expert",
    description: "Report all types of disasters",
    icon: Award,
    color: "bg-red-100 text-red-600",
    requirement: 5, // 5 different disaster types
    points: 1500,
  },
];

// Rewards catalog
const REWARDS = [
  {
    id: "coffee_voucher",
    name: "Coffee Voucher",
    description: "Free coffee at participating cafes",
    pointCost: 500,
    image: "/coffee.jpg",
  },
  {
    id: "emergency_kit",
    name: "Emergency Preparedness Kit",
    description: "Basic emergency supplies for your home",
    pointCost: 2000,
    image: "/emergency.webp",
  },
  {
    id: "gas_voucher",
    name: "Petrol Voucher",
    description: "200 Rupees voucher for fuel at participating stations",
    pointCost: 1500,
    image: "/petrol.webp",
  },
  {
    id: "donation",
    name: "Donation to Relief Fund",
    description: "Donate points to disaster relief efforts",
    pointCost: 1000,
    image: "/donation.webp",
  },
  {
    id: "premium_membership",
    name: "Premium App Membership",
    description: "3 months of premium features in DisasterAlert",
    pointCost: 3000,
    image: "/Netflix-Premium.png",
  },
];

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [showRewardSection, setShowRewardSection] = useState(false);
  const [userProfile, setUserProfile] = useState({
    points: 0,
    totalReports: 0,
    verifiedReports: 0,
    disasterTypes: new Set(),
    badges: [] as string[],
  });
  const [formData, setFormData] = useState({
    disasterType: "",
    location: "",
    severity: "",
    description: "",
    image: null,
    damageEvidence: [] as any[], // Array to store multiple images of damage
  });
  const [aiAnalysis, setAiAnalysis] = useState<ImageAnalysisResult | null>(
    null
  );
  const [safetyTips, setSafetyTips] = useState<SafetyTip[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load user profile from local storage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("disasterAlertUserProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      // Convert the disasterTypes array back to a Set if it exists
      if (parsed.disasterTypes) {
        parsed.disasterTypes = new Set(parsed.disasterTypes);
      }
      setUserProfile(parsed);
    }
  }, []);

  // Save user profile to local storage whenever it changes
  useEffect(() => {
    // Convert Set to Array for JSON serialization
    const profileToSave = {
      ...userProfile,
      disasterTypes: Array.from(userProfile.disasterTypes),
    };
    localStorage.setItem(
      "disasterAlertUserProfile",
      JSON.stringify(profileToSave)
    );
  }, [userProfile]);

  // Check for badge unlocks when user profile changes
  useEffect(() => {
    checkForBadges();
  }, [
    userProfile.totalReports,
    userProfile.verifiedReports,
    userProfile.disasterTypes,
  ]);

  const handleLocationDetect = () => {
    // Simulate geolocation detection
    setLocation("Detecting location...");
    setTimeout(() => {
      const detectedLocation = "San Francisco, CA";
      setLocation(detectedLocation);
      setFormData((prev) => ({ ...prev, location: detectedLocation }));
    }, 1500);
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      const maxSizeMB = 4;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `Image size exceeds ${maxSizeMB}MB. Please upload a smaller image.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        setImagePreview(imageData);
        setFormData((prev) => ({ ...prev, image: file }));

        // Only attempt AI analysis if a disaster type is selected
        if (!formData.disasterType) {
          toast({
            title: "Disaster Type Required",
            description:
              "Please select a disaster type before uploading an image.",
            variant: "destructive",
          });
          return;
        }

        // Analyze image with AI
        setIsAnalyzing(true);
        try {
          const analysis = await analyzeDisasterImage(
            imageData,
            formData.disasterType
          );
          setAiAnalysis(analysis);

          // Get safety tips based on disaster type
          const tips = getSafetyTips(formData.disasterType);
          setSafetyTips(tips);

          // Update form data with AI suggestions
          setFormData((prev) => ({
            ...prev,
            severity: analysis.detectedDamage.severity,
            description:
              prev.description || analysis.detectedDamage.description,
          }));

          // Show success toast with points
          if (analysis.isValidDisaster) {
            toast({
              title: "AI Analysis Complete",
              description: `Image analyzed! You'll earn ${analysis.pointsAwarded.total} points for this report.`,
            });
          } else {
            // Show a warning if the image doesn't appear to be a valid disaster
            toast({
              title: "Verification Required",
              description:
                "This may not be a disaster image. Please verify your submission.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error analyzing image:", error);
          // Set a minimal error analysis result
          setAiAnalysis({
            isValidDisaster: false,
            detectedDamage: {
              exists: false,
              severity: "low",
              description: "Unable to analyze image. Please try again later.",
              specificThreats: [],
            },
            confidence: 0,
            pointsAwarded: {
              base: 10,
              clarity: 0,
              severity: 0,
              urgency: 0,
              total: 10,
            },
            safetyTips: {
              immediate: [],
              preventive: [],
              recovery: [],
            },
            imageQuality: {
              isGoodQuality: false,
              isClear: false,
              hasGoodLighting: false,
            },
          });

          // Fall back to basic safety tips
          setSafetyTips(getSafetyTips(formData.disasterType));

          toast({
            title: "Analysis Failed",
            description:
              "AI analysis unavailable. You can still submit your report.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDamageImageUpload = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    if (files.length > 0) {
      const newDamageImages = [...formData.damageEvidence];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newDamageImages.push({
            file,
            preview: reader.result,
          });
          setFormData((prev) => ({
            ...prev,
            damageEvidence: newDamageImages,
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDamageImage = (index: any) => {
    const updatedImages = [...formData.damageEvidence];
    updatedImages.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      damageEvidence: updatedImages,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission and verification process
    setTimeout(() => {
      setIsSubmitting(false);

      // Update user profile with new report data
      const updatedProfile = {
        ...userProfile,
        totalReports: userProfile.totalReports + 1,
        points: userProfile.points + calculateReportPoints(),
        disasterTypes: userProfile.disasterTypes.add(formData.disasterType),
      };
      setUserProfile(updatedProfile);

      // Show success toast with points earned
      toast({
        title: "Report Submitted",
        description: `Thank you for your report. You've earned ${calculateReportPoints()} points!`,
      });

      // Show the reward section
      setShowRewardSection(true);
    }, 2000);
  };

  const calculateReportPoints = () => {
    // Base points for submitting a report
    let points = 100;

    // Bonus points for providing multiple damage images
    points += Math.min(formData.damageEvidence.length * 50, 200);

    // Bonus for severity
    if (formData.severity === "high") {
      points += 100;
    } else if (formData.severity === "medium") {
      points += 50;
    }

    return points;
  };

  const checkForBadges = () => {
    // Check for each badge condition and update if needed
    const newBadges = [...userProfile.badges];
    let badgesAdded = false;

    BADGES.forEach((badge) => {
      // Skip if badge already earned
      if (userProfile.badges.includes(badge.id)) return;

      // Check conditions for each badge type
      let isEarned = false;

      switch (badge.id) {
        case "first_report":
          isEarned = userProfile.totalReports >= 1;
          break;
        case "five_reports":
          isEarned = userProfile.totalReports >= 5;
          break;
        case "ten_reports":
          isEarned = userProfile.totalReports >= 10;
          break;
        case "verified_reporter":
          isEarned = userProfile.verifiedReports >= 3;
          break;
        case "disaster_expert":
          isEarned = userProfile.disasterTypes.size >= 5;
          break;
      }

      // If badge is earned, add it
      if (isEarned && !newBadges.includes(badge.id)) {
        newBadges.push(badge.id);
        badgesAdded = true;
      }
    });

    // Update badges if new ones were added
    if (badgesAdded) {
      setUserProfile((prev) => ({
        ...prev,
        badges: newBadges,
      }));

      // Show toast notification for new badge
      const newBadgeNames = BADGES.filter(
        (badge) =>
          newBadges.includes(badge.id) && !userProfile.badges.includes(badge.id)
      ).map((badge) => badge.name);

      if (newBadgeNames.length > 0) {
        toast({
          title: "Badge Unlocked!",
          description: `You earned the ${newBadgeNames.join(", ")} badge!`,
        });
      }
    }
  };

  const redeemReward = (reward: any) => {
    // Check if user has enough points
    if (userProfile.points < reward.pointCost) {
      toast({
        title: "Not Enough Points",
        description: `You need ${
          reward.pointCost - userProfile.points
        } more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    // Update user profile with deducted points
    setUserProfile((prev) => ({
      ...prev,
      points: prev.points - reward.pointCost,
    }));

    // Show success message
    toast({
      title: "Reward Redeemed!",
      description: `You've successfully redeemed: ${reward.name}. Check your email for details.`,
    });
  };

  const nextStep = () => {
    setFormStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setFormStep((prev) => prev - 1);
  };

  const updateFormData = (field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Only show the initial report form if showRewardSection is false
  // Otherwise show the reward section
  if (showRewardSection) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="container flex h-16 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="mr-4 flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="font-bold">DisasterAlert</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1">
                <Trophy className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">
                  {userProfile.points} points
                </span>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 p-4 md:p-6">
          <div className="container max-w-4xl">
            <AnimatedPageHeader
              title="Report Submitted Successfully"
              description="Thank you for helping your community by reporting disaster conditions."
              showBackButton
            />

            <Tabs defaultValue="rewards" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="history">Report History</TabsTrigger>
              </TabsList>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {REWARDS.map((reward) => (
                    <Card key={reward.id} className="overflow-hidden">
                      <div className="relative h-40 bg-slate-200">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Gift className="h-12 w-12 text-slate-400" />
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{reward.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800"
                          >
                            {reward.pointCost} points
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={userProfile.points < reward.pointCost}
                          onClick={() => redeemReward(reward)}
                        >
                          {userProfile.points < reward.pointCost
                            ? "Not Enough Points"
                            : "Redeem Reward"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Badges Tab */}
              <TabsContent value="badges" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5 text-amber-600" />
                      Your Achievement Badges
                    </CardTitle>
                    <CardDescription>
                      Complete tasks and earn badges to increase your community
                      standing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {BADGES.map((badge) => {
                        const isEarned = userProfile.badges.includes(badge.id);
                        return (
                          <div
                            key={badge.id}
                            className={`flex p-4 rounded-lg border ${
                              isEarned
                                ? badge.color
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <div
                              className={`mr-3 rounded-full p-2 ${
                                isEarned ? "bg-white/30" : "bg-slate-200"
                              }`}
                            >
                              <badge.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{badge.name}</h3>
                              <p className="text-xs">{badge.description}</p>
                              {!isEarned && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>
                                      {badge.id === "first_report"
                                        ? `${Math.min(
                                            userProfile.totalReports,
                                            1
                                          )}/${badge.requirement}`
                                        : badge.id === "five_reports"
                                        ? `${Math.min(
                                            userProfile.totalReports,
                                            5
                                          )}/${badge.requirement}`
                                        : badge.id === "ten_reports"
                                        ? `${Math.min(
                                            userProfile.totalReports,
                                            10
                                          )}/${badge.requirement}`
                                        : badge.id === "verified_reporter"
                                        ? `${Math.min(
                                            userProfile.verifiedReports,
                                            3
                                          )}/${badge.requirement}`
                                        : badge.id === "disaster_expert"
                                        ? `${Math.min(
                                            userProfile.disasterTypes.size,
                                            5
                                          )}/${badge.requirement}`
                                        : "0/1"}
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      badge.id === "first_report"
                                        ? (Math.min(
                                            userProfile.totalReports,
                                            1
                                          ) /
                                            badge.requirement) *
                                          100
                                        : badge.id === "five_reports"
                                        ? (Math.min(
                                            userProfile.totalReports,
                                            5
                                          ) /
                                            badge.requirement) *
                                          100
                                        : badge.id === "ten_reports"
                                        ? (Math.min(
                                            userProfile.totalReports,
                                            10
                                          ) /
                                            badge.requirement) *
                                          100
                                        : badge.id === "verified_reporter"
                                        ? (Math.min(
                                            userProfile.verifiedReports,
                                            3
                                          ) /
                                            badge.requirement) *
                                          100
                                        : badge.id === "disaster_expert"
                                        ? (Math.min(
                                            userProfile.disasterTypes.size,
                                            5
                                          ) /
                                            badge.requirement) *
                                          100
                                        : 0
                                    }
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </div>
                            {isEarned && (
                              <Badge className="self-start bg-white/20">
                                +{badge.points} pts
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Report History</CardTitle>
                    <CardDescription>
                      Track the status of your submitted reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userProfile.totalReports > 0 ? (
                      <div className="space-y-4">
                        {/* Most recent report (just submitted) */}
                        <div className="flex items-start p-4 rounded-lg border border-green-200 bg-green-50">
                          <div className="mr-3 rounded-full p-2 bg-green-100">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">
                                {formData.disasterType} in {formData.location}
                              </h3>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800"
                              >
                                Submitted
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {formData.description.substring(0, 100)}...
                            </p>
                            <div className="flex mt-2 gap-2">
                              {formData.damageEvidence.map(
                                (img, idx) =>
                                  idx < 3 && (
                                    <div
                                      key={idx}
                                      className="w-16 h-16 rounded bg-slate-200 overflow-hidden"
                                    >
                                      <img
                                        src={img.preview}
                                        alt={`Evidence ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )
                              )}
                              {formData.damageEvidence.length > 3 && (
                                <div className="w-16 h-16 rounded bg-slate-200 flex items-center justify-center">
                                  <span className="text-sm text-slate-600">
                                    +{formData.damageEvidence.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center text-xs text-slate-500">
                              <Clock className="mr-1 h-3 w-3" />
                              Just now • Pending verification
                            </div>
                          </div>
                        </div>

                        {/* Show older reports if we had them */}
                        {userProfile.totalReports > 1 && (
                          <>
                            <div className="flex items-start p-4 rounded-lg border">
                              <div className="mr-3 rounded-full p-2 bg-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className="font-medium">
                                    Flood in San Francisco, CA
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-100 text-amber-800"
                                  >
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                  Severe flooding reported in downtown area with
                                  several roads blocked...
                                </p>
                                <div className="mt-2 flex items-center text-xs text-slate-500">
                                  <Clock className="mr-1 h-3 w-3" />3 days ago
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start p-4 rounded-lg border border-green-200 bg-green-50">
                              <div className="mr-3 rounded-full p-2 bg-green-100">
                                <Check className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className="font-medium">
                                    Wildfire in Marin County, CA
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 text-green-800"
                                  >
                                    Verified
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                  Wildfire spreading rapidly in northern hills.
                                  Several buildings affected...
                                </p>
                                <div className="mt-2 flex items-center text-xs text-slate-500">
                                  <Clock className="mr-1 h-3 w-3" />1 week ago •
                                  Earned 250 points
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-muted-foreground">
                          You haven't submitted any reports yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  setShowRewardSection(false);
                  setFormStep(0);
                  setFormData({
                    disasterType: "",
                    location: "",
                    severity: "",
                    description: "",
                    image: null,
                    damageEvidence: [],
                  });
                  setImagePreview(null);
                }}
                variant="outline"
                className="mr-2"
              >
                Submit Another Report
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-red-600 hover:bg-red-700"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="mr-4 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-500" />
            <span className="font-bold">DisasterAlert</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">
                {userProfile.points} points
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-2xl">
          <AnimatedPageHeader
            title="Submit Disaster Report"
            description="Help your community by reporting disaster conditions in your area."
            showBackButton
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Submit Disaster Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {formStep === 0 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Disaster Type */}
                        <div className="space-y-2">
                          <Label htmlFor="disaster-type">Disaster Type</Label>
                          <Select
                            value={formData.disasterType}
                            onValueChange={(value) =>
                              updateFormData("disasterType", value)
                            }
                            required
                          >
                            <SelectTrigger id="disaster-type">
                              <SelectValue placeholder="Select disaster type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flood">Flood</SelectItem>
                              <SelectItem value="earthquake">
                                Earthquake
                              </SelectItem>
                              <SelectItem value="wildfire">Wildfire</SelectItem>
                              <SelectItem value="hurricane">
                                Hurricane/Cyclone
                              </SelectItem>
                              <SelectItem value="tornado">Tornado</SelectItem>
                              <SelectItem value="landslide">
                                Landslide
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="location"
                              placeholder="Enter location"
                              value={location}
                              onChange={(e) => {
                                setLocation(e.target.value);
                                updateFormData("location", e.target.value);
                              }}
                              required
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleLocationDetect}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              Detect
                            </Button>
                          </div>
                        </div>

                        {/* Severity */}
                        <div className="space-y-2">
                          <Label htmlFor="severity">Severity</Label>
                          <Select
                            value={formData.severity}
                            onValueChange={(value) =>
                              updateFormData("severity", value)
                            }
                            required
                          >
                            <SelectTrigger id="severity">
                              <SelectValue placeholder="Select severity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">
                                Low - Minor Impact
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium - Moderate Impact
                              </SelectItem>
                              <SelectItem value="high">
                                High - Severe Impact
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={
                            !formData.disasterType ||
                            !formData.location ||
                            !formData.severity
                          }
                        >
                          Next Step
                          <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                        </Button>
                      </motion.div>
                    )}

                    {formStep === 1 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe what you're seeing..."
                            value={formData.description}
                            onChange={(e) =>
                              updateFormData("description", e.target.value)
                            }
                            required
                            rows={4}
                          />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                          <Label htmlFor="image">
                            Incident Overview Image (Optional)
                          </Label>
                          <div className="grid gap-4">
                            <div className="flex items-center justify-center">
                              {imagePreview ? (
                                <div className="relative">
                                  <motion.img
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="Preview"
                                    className="h-48 w-full rounded-md object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-2 top-2"
                                    onClick={() => {
                                      setImagePreview(null);
                                      updateFormData("image", null);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Drag and drop or click to upload
                                  </p>
                                </motion.div>
                              )}
                            </div>
                            <Input
                              ref={fileInputRef}
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="group"
                            >
                              <Upload className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                              Upload Image
                            </Button>
                          </div>
                        </div>

                        {/* Damage Evidence Upload - NEW FIELD */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="damage-evidence">
                              Evidence of Damage
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              +50 points per image
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload images showing damaged infrastructure,
                            buildings, or affected areas to help verification.
                          </p>

                          {/* Display uploaded damage images */}
                          {formData.damageEvidence.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {formData.damageEvidence.map((image, index) => (
                                <div
                                  key={index}
                                  className="relative h-24 rounded-md overflow-hidden"
                                >
                                  <img
                                    src={image.preview}
                                    alt={`Damage evidence ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-1 top-1 h-5 w-5"
                                    onClick={() => removeDamageImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4"
                              onClick={() =>
                                document
                                  .getElementById("damage-evidence")
                                  ?.click()
                              }
                            >
                              <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Upload evidence images
                              </p>
                            </motion.div>
                          </div>
                          <Input
                            id="damage-evidence"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleDamageImageUpload}
                            className="hidden"
                          />
                        </div>

                        {/* AI Analysis Results */}
                        {aiAnalysis && (
                          <Card className="mt-4">
                            <CardHeader>
                              <CardTitle className="flex items-center text-lg">
                                <Shield className="mr-2 h-5 w-5 text-blue-500" />
                                AI Analysis Results
                                {isAnalyzing && (
                                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Damage Assessment */}
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Damage Assessment
                                  </h4>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant={
                                        aiAnalysis.detectedDamage.severity ===
                                        "high"
                                          ? "destructive"
                                          : aiAnalysis.detectedDamage
                                              .severity === "medium"
                                          ? "secondary"
                                          : "default"
                                      }
                                    >
                                      {aiAnalysis.detectedDamage.severity.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline">
                                      Confidence:{" "}
                                      {Math.round(aiAnalysis.confidence * 100)}%
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {aiAnalysis.detectedDamage.description}
                                  </p>
                                </div>

                                {/* Specific Threats */}
                                {aiAnalysis.detectedDamage.specificThreats
                                  .length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Identified Threats
                                    </h4>
                                    <div className="grid gap-2">
                                      {aiAnalysis.detectedDamage.specificThreats.map(
                                        (threat, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 bg-red-50 rounded-md"
                                          >
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-700">
                                              {threat}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Safety Tips */}
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Safety Tips
                                  </h4>
                                  <Tabs
                                    defaultValue="immediate"
                                    className="w-full"
                                  >
                                    <TabsList className="grid w-full grid-cols-3">
                                      <TabsTrigger value="immediate">
                                        Immediate
                                      </TabsTrigger>
                                      <TabsTrigger value="preventive">
                                        Preventive
                                      </TabsTrigger>
                                      <TabsTrigger value="recovery">
                                        Recovery
                                      </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="immediate">
                                      <div className="space-y-2 mt-2">
                                        {aiAnalysis.safetyTips.immediate.map(
                                          (tip, index) => (
                                            <div
                                              key={index}
                                              className="p-3 bg-red-50 rounded-lg"
                                            >
                                              <h5 className="font-medium text-red-700 mb-1">
                                                {tip.title}
                                              </h5>
                                              <p className="text-sm text-red-600">
                                                {tip.description}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="preventive">
                                      <div className="space-y-2 mt-2">
                                        {aiAnalysis.safetyTips.preventive.map(
                                          (tip, index) => (
                                            <div
                                              key={index}
                                              className="p-3 bg-blue-50 rounded-lg"
                                            >
                                              <h5 className="font-medium text-blue-700 mb-1">
                                                {tip.title}
                                              </h5>
                                              <p className="text-sm text-blue-600">
                                                {tip.description}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="recovery">
                                      <div className="space-y-2 mt-2">
                                        {aiAnalysis.safetyTips.recovery.map(
                                          (tip, index) => (
                                            <div
                                              key={index}
                                              className="p-3 bg-green-50 rounded-lg"
                                            >
                                              <h5 className="font-medium text-green-700 mb-1">
                                                {tip.title}
                                              </h5>
                                              <p className="text-sm text-green-600">
                                                {tip.description}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </div>

                                {/* Points Breakdown */}
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Points Earned
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                      <span className="text-sm text-slate-600">
                                        Base Points
                                      </span>
                                      <span className="font-medium">
                                        +{aiAnalysis.pointsAwarded.base}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                      <span className="text-sm text-slate-600">
                                        Image Quality Bonus
                                      </span>
                                      <span className="font-medium">
                                        +{aiAnalysis.pointsAwarded.clarity}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                      <span className="text-sm text-slate-600">
                                        Severity Bonus
                                      </span>
                                      <span className="font-medium">
                                        +{aiAnalysis.pointsAwarded.severity}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                      <span className="text-sm text-slate-600">
                                        Urgency Bonus
                                      </span>
                                      <span className="font-medium">
                                        +{aiAnalysis.pointsAwarded.urgency}
                                      </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                      <div className="flex items-center">
                                        <Trophy className="mr-2 h-5 w-5 text-blue-500" />
                                        <span className="font-medium">
                                          Total Points
                                        </span>
                                      </div>
                                      <span className="text-lg font-bold text-blue-600">
                                        +{aiAnalysis.pointsAwarded.total}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Image Quality Assessment */}
                                {aiAnalysis.imageQuality && (
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Image Quality
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div
                                        className={`p-2 rounded-md text-center ${
                                          aiAnalysis.imageQuality.isGoodQuality
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                        }`}
                                      >
                                        <p className="text-xs font-medium">
                                          Overall Quality
                                        </p>
                                        <p className="text-sm">
                                          {aiAnalysis.imageQuality.isGoodQuality
                                            ? "Good"
                                            : "Poor"}
                                        </p>
                                      </div>
                                      <div
                                        className={`p-2 rounded-md text-center ${
                                          aiAnalysis.imageQuality.isClear
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                        }`}
                                      >
                                        <p className="text-xs font-medium">
                                          Clarity
                                        </p>
                                        <p className="text-sm">
                                          {aiAnalysis.imageQuality.isClear
                                            ? "Clear"
                                            : "Unclear"}
                                        </p>
                                      </div>
                                      <div
                                        className={`p-2 rounded-md text-center ${
                                          aiAnalysis.imageQuality
                                            .hasGoodLighting
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                        }`}
                                      >
                                        <p className="text-xs font-medium">
                                          Lighting
                                        </p>
                                        <p className="text-sm">
                                          {aiAnalysis.imageQuality
                                            .hasGoodLighting
                                            ? "Good"
                                            : "Poor"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="flex-1"
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting || !formData.description}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Submitting...
                              </>
                            ) : (
                              "Submit Report"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>

            {/* Reward Points Preview */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                  Earn Reward Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit accurate and detailed reports to earn points that can
                  be redeemed for rewards!
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Base report submission</span>
                    <span className="font-medium">100 points</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Photo evidence (per image, up to 4)</span>
                    <span className="font-medium">+50 points each</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>High severity report</span>
                    <span className="font-medium">+100 points</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Report verification bonus</span>
                    <span className="font-medium">+150 points</span>
                  </div>
                </div>
                <div className="mt-4 rounded-md bg-amber-50 p-3 border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">
                    Current Balance
                  </h4>
                  <div className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    <span className="text-xl font-bold text-amber-700">
                      {userProfile.points} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
