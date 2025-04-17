"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Send,
  CheckCircle,
  Users,
  Smartphone,
  Plus,
  Clock,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { smsService } from "@/lib/sms-service";

export function AdminAlertManager() {
  const [activeTab, setActiveTab] = useState("create");
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [subscribers, setSubscribers] = useState<{phoneNumber: string; disasterTypes: string[]}[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  
  // Alert form state
  const [alertType, setAlertType] = useState("earthquake");
  const [alertLocation, setAlertLocation] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("medium");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertInstructions, setAlertInstructions] = useState("");
  
  // Load subscribers from localStorage for demo purposes
  useEffect(() => {
    const loadSubscribers = () => {
      try {
        // For demo purposes, get from localStorage
        const storedSubscription = localStorage.getItem('disasterAlertSubscription');
        
        if (storedSubscription) {
          const subscription = JSON.parse(storedSubscription);
          setSubscribers([{
            phoneNumber: subscription.phoneNumber,
            disasterTypes: subscription.disasterTypes,
          }]);
        }
        
        // Add some dummy data for the demo
        setSubscribers(prev => [
          ...prev,
          { phoneNumber: "+15551234567", disasterTypes: ["earthquake", "flood"] },
          { phoneNumber: "+15552345678", disasterTypes: ["wildfire", "hurricane", "tornado"] },
        ]);
      } catch (error) {
        console.error("Error loading subscribers:", error);
      }
    };

    // Load recent alerts (mock data for hackathon)
    const loadRecentAlerts = () => {
      const mockRecentAlerts = [
        {
          id: "alert-1",
          type: "Flood",
          location: "Downtown, San Francisco",
          severity: "high",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          recipientCount: 156,
          status: "sent",
        },
        {
          id: "alert-2",
          type: "Earthquake",
          location: "Oakland, CA",
          severity: "medium",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          recipientCount: 89,
          status: "sent",
        },
        {
          id: "alert-3",
          type: "Wildfire",
          location: "Marin County, CA",
          severity: "high",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          recipientCount: 205,
          status: "sent",
        },
      ];
      
      setRecentAlerts(mockRecentAlerts);
    };
    
    loadSubscribers();
    loadRecentAlerts();
  }, []);

  // Create and send a new alert
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alertLocation || !alertDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide location and description for the alert.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    setIsSending(true);
    setSendProgress(10);

    try {
      // Create the new alert
      const newAlert = {
        id: `alert-${Date.now()}`,
        type: alertType.charAt(0).toUpperCase() + alertType.slice(1),
        location: alertLocation,
        severity: alertSeverity,
        description: alertDescription,
        instructions: alertInstructions,
        timestamp: new Date().toISOString(),
        coordinates: { lat: 37.7749, lng: -122.4194 }, // Mock coordinates for demo
        recipientCount: 0,
        status: "sending",
      };
      
      // Find eligible subscribers (those who signed up for this disaster type)
      const eligibleSubscribers = subscribers.filter(sub => 
        sub.disasterTypes.includes(alertType)
      );
      
      // Progress tracking
      setSendProgress(20);
      const progressInterval = setInterval(() => {
        setSendProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 300);

      // Send SMS alerts to all eligible subscribers
      let successCount = 0;
      
      for (const subscriber of eligibleSubscribers) {
        try {
          const result = await smsService.sendDisasterAlert(
            subscriber.phoneNumber,
            newAlert.type,
            newAlert.location,
            newAlert.severity,
            newAlert.instructions || undefined
          );
          
          if (result.success) {
            successCount++;
          }
        } catch (error) {
          console.error("Error sending to subscriber:", error);
          // Continue with other subscribers even if one fails
        }
      }
      
      // Update sending status and clear interval
      clearInterval(progressInterval);
      setSendProgress(100);
      
      // Update the alert with final info
      newAlert.recipientCount = successCount;
      newAlert.status = "sent";
      
      // Add to recent alerts
      setRecentAlerts(prev => [newAlert, ...prev]);
      
      // Show success message
      toast({
        title: "Alert Sent Successfully",
        description: `Alert sent to ${successCount} subscribers.`,
      });
      
      // Reset form after a delay
      setTimeout(() => {
        setAlertLocation("");
        setAlertDescription("");
        setAlertInstructions("");
        setIsCreating(false);
        setIsSending(false);
        setSendProgress(0);
        setActiveTab("history");
      }, 1000);
      
    } catch (error) {
      console.error("Error creating alert:", error);
      setIsCreating(false);
      setIsSending(false);
      setSendProgress(0);
      
      toast({
        title: "Failed to Send Alert",
        description: "There was an error sending the alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Cancel alert creation
  const handleCancel = () => {
    setAlertLocation("");
    setAlertDescription("");
    setAlertInstructions("");
    setIsCreating(false);
    setIsSending(false);
    setSendProgress(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Bell className="mr-2 h-5 w-5 text-red-500" />
          SMS Alert Management System
        </CardTitle>
        <CardDescription>
          Create and send emergency alerts to subscribed users in affected areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="create" className="flex-1">Create Alert</TabsTrigger>
            <TabsTrigger value="subscribers" className="flex-1">Subscribers</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Alert History</TabsTrigger>
          </TabsList>
          
          {/* Create New Alert Tab */}
          <TabsContent value="create">
            <form onSubmit={handleCreateAlert} className="space-y-4">
              {/* Disaster Type */}
              <div className="space-y-2">
                <Label htmlFor="alert-type">Disaster Type</Label>
                <Select 
                  value={alertType} 
                  onValueChange={setAlertType}
                  disabled={isCreating}
                >
                  <SelectTrigger id="alert-type">
                    <SelectValue placeholder="Select disaster type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="earthquake">Earthquake</SelectItem>
                    <SelectItem value="wildfire">Wildfire</SelectItem>
                    <SelectItem value="hurricane">Hurricane/Cyclone</SelectItem>
                    <SelectItem value="tornado">Tornado</SelectItem>
                    <SelectItem value="landslide">Landslide</SelectItem>
                    <SelectItem value="tsunami">Tsunami</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="alert-location">Location</Label>
                <Input
                  id="alert-location"
                  placeholder="Enter affected area (e.g., Downtown San Francisco)"
                  value={alertLocation}
                  onChange={(e) => setAlertLocation(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              
              {/* Severity */}
              <div className="space-y-2">
                <Label>Severity Level</Label>
                <RadioGroup 
                  defaultValue="medium" 
                  value={alertSeverity}
                  onValueChange={setAlertSeverity}
                  className="flex space-x-4"
                  disabled={isCreating}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="severity-low" />
                    <Label htmlFor="severity-low" className="text-green-600 font-medium">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="severity-medium" />
                    <Label htmlFor="severity-medium" className="text-amber-600 font-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="severity-high" />
                    <Label htmlFor="severity-high" className="text-red-600 font-medium">High</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="alert-description">Alert Description</Label>
                <Textarea
                  id="alert-description"
                  placeholder="Describe the disaster situation"
                  rows={3}
                  value={alertDescription}
                  onChange={(e) => setAlertDescription(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              
              {/* Safety Instructions */}
              <div className="space-y-2">
                <Label htmlFor="alert-instructions">Safety Instructions (Optional)</Label>
                <Textarea
                  id="alert-instructions"
                  placeholder="Add specific safety instructions for this alert"
                  rows={3}
                  value={alertInstructions}
                  onChange={(e) => setAlertInstructions(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              
              {/* Recipients Info */}
              <div className="rounded-md bg-slate-50 p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Potential Recipients</p>
                    <p className="text-xs text-slate-500">
                      {alertType ? 
                        `${subscribers.filter(s => s.disasterTypes.includes(alertType)).length} subscribers will receive this alert` :
                        "Select a disaster type to see recipient count"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  <Smartphone className="mr-1 h-3 w-3" />
                  {subscribers.length} Total Subscribers
                </Badge>
              </div>
              
              {/* Sending Progress */}
              {isSending && (
                <div className="space-y-2">
                  <Progress value={sendProgress} className="h-2" />
                  <p className="text-xs text-center text-slate-500">
                    {sendProgress < 100 ? 
                      `Sending emergency alerts to subscribers... (${Math.round(sendProgress)}%)` : 
                      "Alerts sent successfully!"}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isCreating || !alertLocation || !alertDescription}
                >
                  {isCreating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Sending Alerts...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Emergency Alert
                    </>
                  )}
                </Button>
              </div>
              
              {/* Demo Warning */}
              <div className="mt-4 text-xs text-slate-500 bg-blue-50 p-2 rounded-md border border-blue-200">
                <p className="font-medium text-blue-800">⚠️ Hackathon Demo Note:</p>
                <p>This is a simulated environment. In a production system, alerts would be integrated with local emergency services and official alert systems.</p>
              </div>
            </form>
          </TabsContent>
          
          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Registered Subscribers</h3>
                <Badge variant="outline" className="bg-slate-100">
                  {subscribers.length} Total
                </Badge>
              </div>
              
              {subscribers.length > 0 ? (
                <div className="space-y-3">
                  {subscribers.map((subscriber, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between rounded-md border p-3 bg-white"
                    >
                      <div>
                        <div className="flex items-center">
                          <Smartphone className="mr-2 h-4 w-4 text-slate-500" />
                          <span className="font-medium">{subscriber.phoneNumber}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {subscriber.disasterTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-slate-300 mb-2" />
                  <h3 className="text-lg font-medium">No Subscribers Yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    When users subscribe to SMS alerts, they will appear here.
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <Button className="w-full" variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subscriber Manually
                </Button>
                <p className="mt-2 text-xs text-center text-slate-500">
                  Manual subscriber management is disabled in this demo
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Alert History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Alerts</h3>
                <Badge variant="outline" className="bg-slate-100">
                  {recentAlerts.length} Alerts
                </Badge>
              </div>
              
              {recentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="rounded-md border p-3 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            alert.severity === "high" ? "bg-red-100" :
                            alert.severity === "medium" ? "bg-amber-100" : "bg-green-100"
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              alert.severity === "high" ? "text-red-600" :
                              alert.severity === "medium" ? "text-amber-600" : "text-green-600"
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{alert.type} Alert</h4>
                            <p className="text-sm text-slate-500">{alert.location}</p>
                          </div>
                        </div>
                        <Badge variant={alert.status === "sent" ? "outline" : "secondary"} className="bg-green-50 text-green-800 border-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {alert.status === "sent" ? "Sent" : "Sending"}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          {alert.recipientCount} recipients
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-slate-300 mb-2" />
                  <h3 className="text-lg font-medium">No Alerts Sent Yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    When you send alerts, they will appear in this history.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 text-xs text-slate-500 px-6 py-3">
        <div className="flex justify-between w-full">
          <span>DisasterAlert SMS System</span>
          <span>For Hackathon Demo Purposes Only</span>
        </div>
      </CardFooter>
    </Card>
  );
}