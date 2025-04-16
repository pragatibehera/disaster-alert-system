"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LocationModal } from "@/components/location-modal"
import { DisasterMap } from "@/components/disaster-map"
import { SafetyTipsPanel } from "@/components/safety-tips-panel"
import { AlertCard } from "@/components/alert-card"
import { StatCard } from "@/components/stat-card"
import { AnimatedCard } from "@/components/animated-card"
import { mockAlerts } from "@/lib/mock-data"

export default function Dashboard() {
  const router = useRouter()
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8])
  const [alerts, setAlerts] = useState(mockAlerts)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSafetyTips, setShowSafetyTips] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Check if location is stored in localStorage
    const storedLocation = localStorage.getItem("userLocation")
    if (storedLocation) {
      setLocation(storedLocation)
    } else {
      setShowLocationModal(true)
    }

    // Set up auto-refresh if enabled
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshAlerts()
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const refreshAlerts = () => {
    setLoading(true)
    // Simulate API call with timeout
    setTimeout(() => {
      // Randomize the order of alerts to simulate updates
      setAlerts([...mockAlerts].sort(() => Math.random() - 0.5))
      setLoading(false)
    }, 1000)
  }

  const handleLocationSet = (loc) => {
    setLocation(loc)
    localStorage.setItem("userLocation", loc)
    setShowLocationModal(false)
    refreshAlerts()
  }

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert)
    setShowSafetyTips(true)
  }

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true
    if (activeTab === "severe") return alert.severity === "high"
    if (activeTab === "nearby") return alert.distance < 50
    return true
  })

  // Stats for the dashboard
  const stats = [
    {
      title: "Active Alerts",
      value: alerts.length,
      icon: Bell,
      trend: "up",
      trendValue: "+3 since yesterday",
      iconColor: "text-red-500",
      iconBgColor: "bg-red-100",
    },
    {
      title: "People Notified",
      value: "12,845",
      icon: Users,
      trend: "up",
      trendValue: "+2.3%",
      iconColor: "text-blue-500",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Response Time",
      value: "4.2 min",
      icon: Clock,
      trend: "down",
      trendValue: "-0.5 min",
      iconColor: "text-green-500",
      iconBgColor: "bg-green-100",
    },
    {
      title: "System Status",
      value: "Operational",
      icon: Zap,
      iconColor: "text-amber-500",
      iconBgColor: "bg-amber-100",
    },
  ]

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
            <Button variant="outline" size="sm" onClick={() => router.push("/reports")}>
              <Upload className="mr-2 h-4 w-4" />
              Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/subscribe")}>
              <Smartphone className="mr-2 h-4 w-4" />
              SMS Alerts
            </Button>
            <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
              <Bell className="mr-2 h-4 w-4" />
              My Alerts
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
                  <p className="text-sm text-muted-foreground">Current Location</p>
                  <p className="font-medium">{location ? location : "No location set"}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowLocationModal(true)} className="ml-2">
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
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
                  <CardTitle className="text-xl font-bold">Disaster Map</CardTitle>
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
                  <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    Last 24 hours
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...alerts]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 3)
                      .map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
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
                              {new Date(alert.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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
                  <CardTitle className="text-xl font-bold">Active Alerts</CardTitle>
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
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <AlertCard alert={alert} onClick={() => handleAlertClick(alert)} />
                              </motion.div>
                            ))
                          ) : (
                            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                              <Bell className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
                              <p className="text-sm text-muted-foreground">No alerts match your criteria</p>
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
      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} onLocationSet={handleLocationSet} />
      )}

      {/* Safety Tips Panel */}
      {showSafetyTips && selectedAlert && (
        <SafetyTipsPanel alert={selectedAlert} onClose={() => setShowSafetyTips(false)} />
      )}
    </div>
  )
}
