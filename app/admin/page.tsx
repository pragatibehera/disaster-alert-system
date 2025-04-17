"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Shield, Bell, Users, BarChart3, MapPin, Link, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminAlertManager } from "@/components/admin-alert-manager";
import { Toaster } from "@/components/ui/toaster";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("alerts");

  // Mock stats for hackathon demo
  const stats = {
    activeAlerts: 3,
    totalSubscribers: 247,
    sentAlerts: 24,
    alertsToday: 2,
    averageResponseTime: "4.2 min",
  };
  
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
            <span className="font-bold">DisasterAlert Admin</span>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 font-medium">
              ADMIN
            </Badge>
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-slate-500">
              Manage SMS alerts, view subscriber information, and monitor system status
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          >
            <Card>
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Active Alerts</p>
                  <Bell className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold">{stats.activeAlerts}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Subscribers</p>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Total Alerts</p>
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">{stats.sentAlerts}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Alerts Today</p>
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold">{stats.alertsToday}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Avg. Response</p>
                  <MapPin className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">{stats.averageResponseTime}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Dashboard Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid grid-cols-3 md:w-auto md:inline-flex">
                <TabsTrigger value="alerts">Alert Management</TabsTrigger>
                <TabsTrigger value="integration">API Integration</TabsTrigger>
                <TabsTrigger value="settings">System Settings</TabsTrigger>
              </TabsList>
              
              {/* Alert Management Tab */}
              <TabsContent value="alerts" className="space-y-6">
                <AdminAlertManager />
              </TabsContent>
              
              {/* API Integration Tab */}
              <TabsContent value="integration">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Link className="mr-2 h-5 w-5 text-blue-500" />
                      API Integration Options
                    </CardTitle>
                    <CardDescription>
                      Connect DisasterAlert SMS with external emergency alert systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">Emergency Alert System (EAS) Integration</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Connect to official government emergency alert systems to automatically
                        relay official alerts to your subscribers.
                      </p>
                      <Button variant="outline" disabled>Configure EAS Integration</Button>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">Weather Service API</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Connect to weather service APIs to receive automatic alerts for
                        severe weather conditions.
                      </p>
                      <Button variant="outline" disabled>Configure Weather API</Button>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">Seismic Monitoring Integration</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Connect to seismic monitoring networks to receive automatic alerts
                        for earthquake activity.
                      </p>
                      <Button variant="outline" disabled>Configure Seismic API</Button>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-sm text-blue-800">
                      <p><strong>Hackathon Demo Note:</strong> API integrations are disabled in this demo environment.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* System Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5 text-slate-500" />
                      System Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure SMS gateway settings and system preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">SMS Gateway Configuration</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Configure your Twilio or other SMS gateway credentials to send alerts.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">API Key Status</p>
                          <p className="font-medium text-green-600">✓ Connected (Demo)</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">SMS Credits</p>
                          <p className="font-medium">1000 remaining</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">Alert Rate Limiting</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Configure how often subscribers can receive alerts to prevent alert fatigue.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Minimum Time Between Alerts</p>
                          <p className="font-medium">15 minutes</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Max Alerts Per Day</p>
                          <p className="font-medium">5 alerts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">Message Templates</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Configure templates for different types of disaster alerts.
                      </p>
                      <Button variant="outline" disabled>Edit Message Templates</Button>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-sm text-blue-800">
                      <p><strong>Hackathon Demo Note:</strong> System settings are for demonstration purposes only and cannot be modified in this demo.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <footer className="border-t bg-slate-50 py-4">
        <div className="container max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>DisasterAlert SMS Admin Dashboard</p>
            <p>Hackathon Project Demo - Not for production use</p>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}