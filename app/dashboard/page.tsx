"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Upload,
  Users,
  Clock,
  Zap,
  BarChart3,
  Trophy,
  Award,
  Star,
  Navigation,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LocationModal } from "@/components/location-modal";
import { DisasterMap } from "@/components/disaster-map";
import { SafetyTipsPanel } from "@/components/safety-tips-panel";
import { EnhancedARSafetyNavigator } from "@/components/enhanced-ar-navigator";
import { AlertCard } from "@/components/alert-card";
import { StatCard } from "@/components/stat-card";
import { AnimatedCard } from "@/components/animated-card";
import { mockAlerts } from "@/lib/mock-data";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useARNavigator } from "@/lib/ar-integration";

// Define the Alert interface based on the mockAlerts structure
interface Alert {
  id: string;
  type: string;
  location: string;
  coordinates: { lat: number; lng: number };
  severity: string;
  timestamp: string;
  description: string;
  distance: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Use the AR Navigation hook with renamed function to avoid conflicts
  const { openARNavigator: arNavigator, ARNavigatorComponent } =
    useARNavigator();

  const [userProfile, setUserProfile] = useState({
    points: 0,
    totalReports: 0,
    verifiedReports: 0,
    disasterTypes: new Set(),
    badges: [] as string[],
  });

  useEffect(() => {
    // Check if location is stored in localStorage
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      setLocation(storedLocation);
    } else {
      setShowLocationModal(true);
    }

    // Load user profile from local storage
    const savedProfile = localStorage.getItem("disasterAlertUserProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Convert the disasterTypes array back to a Set if it exists
        if (parsed.disasterTypes) {
          parsed.disasterTypes = new Set(parsed.disasterTypes);
        }
        setUserProfile(parsed);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }

    // Set up auto-refresh if enabled
    let interval: string | number | NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshAlerts();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const refreshAlerts = () => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      // Randomize the order of alerts to simulate updates
      setAlerts([...mockAlerts].sort(() => Math.random() - 0.5));
      setLoading(false);
    }, 1000);
  };

  const handleLocationSet = (loc: string) => {
    setLocation(loc);
    localStorage.setItem("userLocation", loc);
    setShowLocationModal(false);
    refreshAlerts();
  };

  const handleARNavigation = (alert: Alert) => {
    setSelectedAlert(alert);
    arNavigator(alert);
  };

  // Navigate to mobile browser AR navigator
  const openMobileARNavigator = () => {
    router.push("/mobile-ar-navigator");
  };

  // Add back the click handler for showing safety tips
  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowSafetyTips(true);
  };

  // Original function for backward compatibility
  const openARNavigator = () => {
    // If no alert is selected, use the first alert in the list
    if (!selectedAlert && alerts.length > 0) {
      setSelectedAlert(alerts[0] as Alert);
      arNavigator(alerts[0] as Alert);
    } else if (selectedAlert) {
      arNavigator(selectedAlert);
    }
  };

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true;
    if (activeTab === "severe") return alert.severity === "high";
    if (activeTab === "nearby") return alert.distance < 50;
    return true;
  });

  // Stats for the dashboard
  const stats = [
    {
      title: "Active Alerts",
      value: alerts.length,
      icon: Bell,
      trend: "up" as "up",
      trendValue: "+3 since yesterday",
      iconColor: "text-red-500",
      iconBgColor: "bg-red-100",
    },
    {
      title: "People Notified",
      value: "12,845",
      icon: Users,
      trend: "up" as "up",
      trendValue: "+2.3%",
      iconColor: "text-blue-500",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Response Time",
      value: "4.2 min",
      icon: Clock,
      trend: "down" as "down",
      trendValue: "-0.5 min",
      iconColor: "text-green-500",
      iconBgColor: "bg-green-100",
    },
    {
      title: "System Status",
      value: "Operational",
      icon: Zap,
      trend: "neutral" as "neutral",
      trendValue: "",
      iconColor: "text-amber-500",
      iconBgColor: "bg-amber-100",
    },
  ];

  // Define the badge info for display
  const BADGES = [
    {
      id: "first_report",
      name: "First Responder",
      description: "Submit your first disaster report",
      icon: Shield,
      color: "bg-blue-100 text-blue-600",
      requirement: 1,
    },
    {
      id: "five_reports",
      name: "Community Guardian",
      description: "Submit 5 disaster reports",
      icon: Award,
      color: "bg-green-100 text-green-600",
      requirement: 5,
    },
    {
      id: "ten_reports",
      name: "Safety Sentinel",
      description: "Submit 10 disaster reports",
      icon: Trophy,
      color: "bg-amber-100 text-amber-600",
      requirement: 10,
    },
    {
      id: "verified_reporter",
      name: "Verified Reporter",
      description: "Get 3 reports verified by authorities",
      icon: Star,
      color: "bg-purple-100 text-purple-600",
      requirement: 3,
    },
  ];

  // Get user badges for display
  const userBadges = BADGES.filter((badge) =>
    userProfile.badges.includes(badge.id)
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Shield className="h-6 w-6 text-red-500" />
            <span className="font-bold">DisasterAlert</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center gap-2 mr-4 rounded-full bg-amber-100 px-3 py-1.5">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">
                {userProfile.points} points
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/reports")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/mobile-ar-navigator")}
              className="bg-black text-white hover:bg-black/80 border-black"
            >
              <Navigation className="mr-2 h-4 w-4" />
              AR Nav
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/subscribe")}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              SMS Alerts
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container">
          {/* Location Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 overflow-hidden rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Location
                  </p>
                  <p className="font-medium">
                    {location ? location : "No location set"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationModal(true)}
                  className="ml-2"
                >
                  Change
                </Button>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAlerts}
                  disabled={loading}
                  className="relative overflow-hidden"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                  {loading && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </Button>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <Label htmlFor="auto-refresh">Auto-update</Label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main stats and alerts grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* First column - Stats */}
            <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
              {/* Emergency AR Navigation Card */}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                trendValue={stat.trendValue}
                delay={0.1 + index * 0.1}
                iconColor={stat.iconColor}
                iconBgColor={stat.iconBgColor}
              />
            ))}
          </div>

          {/* User Points & Achievements Card - NEW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                  Your Disaster Response Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Points Card */}
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <Trophy className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-amber-600">
                        {userProfile.points}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total Points Earned
                      </p>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/reports")}
                          className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
                        >
                          View Rewards
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Reports Status */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-2 font-medium">Your Contributions</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Reports</span>
                        <Badge variant="outline" className="bg-blue-50">
                          {userProfile.totalReports}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Verified Reports</span>
                        <Badge variant="outline" className="bg-green-50">
                          {userProfile.verifiedReports}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Disaster Types Reported</span>
                        <Badge variant="outline" className="bg-purple-50">
                          {userProfile.disasterTypes.size}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-2 font-medium">
                      Badges Earned ({userProfile.badges.length})
                    </h3>
                    {userBadges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {userBadges.map((badge) => (
                          <div
                            key={badge.id}
                            className={`flex items-center p-1.5 rounded-lg ${badge.color}`}
                          >
                            <div className="mr-2 rounded-full p-1 bg-white/30">
                              <badge.icon className="h-3 w-3" />
                            </div>
                            <span className="text-xs font-medium">
                              {badge.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-24">
                        <Award className="h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Submit reports to earn badges
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dashboard Content */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column - Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    Disaster Map
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 items-center rounded-full bg-slate-100 px-2 text-xs font-medium">
                      <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                      Live
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DisasterMap alerts={alerts} />
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <AnimatedCard delay={0.4} className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    Recent Activity
                  </CardTitle>
                  <Badge variant="outline" className="ml-2">
                    Last 24 hours
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...alerts]
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .slice(0, 3)
                      .map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.5 + index * 0.1,
                          }}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`mt-0.5 h-2 w-2 rounded-full ${
                              alert.severity === "high"
                                ? "bg-red-500"
                                : alert.severity === "medium"
                                ? "bg-amber-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="font-medium">
                              New {alert.type} alert in {alert.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(() => {
                                const date = new Date(alert.timestamp);
                                const hours = date.getHours();
                                const minutes = date.getMinutes();
                                const ampm = hours >= 12 ? "PM" : "AM";
                                const formattedHours = hours % 12 || 12;
                                const formattedMinutes =
                                  minutes < 10 ? `0${minutes}` : minutes;
                                return `${formattedHours}:${formattedMinutes} ${ampm}`;
                              })()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            {/* Right Column - Alerts */}
            <div className="flex flex-col space-y-6">
              <AnimatedCard delay={0.5}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    Active Alerts
                  </CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {alerts.length} alerts
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search alerts..." className="pl-8" />
                    </div>
                  </div>
                  <Tabs defaultValue="all" onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="severe" className="flex-1">
                        Severe
                      </TabsTrigger>
                      <TabsTrigger value="nearby" className="flex-1">
                        Nearby
                      </TabsTrigger>
                    </TabsList>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mt-4 max-h-[400px] space-y-4 overflow-y-auto pr-1">
                          {filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert, index) => (
                              <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                }}
                              >
                                <AlertCard
                                  alert={alert}
                                  onClick={() => handleAlertClick(alert)}
                                />
                              </motion.div>
                            ))
                          ) : (
                            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                              <Bell className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
                              <p className="text-sm text-muted-foreground">
                                No alerts match your criteria
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </AnimatedCard>

              {/* Emergency Contact Card */}
              <AnimatedCard delay={0.6}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-bold text-red-700">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">National Emergency:</span>
                      <span>911</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Disaster Helpline:</span>
                      <span>1-800-RED-CROSS</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">FEMA:</span>
                      <span>1-800-621-3362</span>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              {/* Weather Forecast Card */}
              <AnimatedCard delay={0.7}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Risk Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-sm">Today</span>
                      </div>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-3/4 bg-red-500"></div>
                      </div>
                      <span className="text-sm font-medium">High</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Tomorrow</span>
                      </div>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-1/2 bg-amber-500"></div>
                      </div>
                      <span className="text-sm font-medium">Medium</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Wednesday</span>
                      </div>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-1/4 bg-green-500"></div>
                      </div>
                      <span className="text-sm font-medium">Low</span>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </main>

      {/* Location Modal */}
      <LocationModal
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleLocationSet}
      />

      {/* Safety Tips Panel */}
      {selectedAlert && showSafetyTips && (
        <SafetyTipsPanel
          alert={selectedAlert}
          onClose={() => setShowSafetyTips(false)}
        />
      )}

      {/* AR Navigator Component from hook */}
      <ARNavigatorComponent />
    </div>
  );
}
