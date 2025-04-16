"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Clock,
  Globe,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroVideoBackground } from "@/components/hero-video-background";
import { AnimatedSectionHeader } from "@/components/animated-section-header";
import { AnimatedFeatureCard } from "@/components/animated-feature-card";
import { ImpactCounter } from "@/components/impact-counter";
import { TestimonialCard } from "@/components/testimonial-card";
import { DisasterMap } from "@/components/disaster-map";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mr-4 flex items-center space-x-2"
          >
            <Shield className="h-6 w-6 text-red-500" />
            <span className="hidden font-bold sm:inline-block">
              Sentinel Flow
            </span>
          </motion.div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href="/reports"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Reports
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/subscribe"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Subscribe
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden py-24 md:py-32">
        <HeroVideoBackground />

        <div className="container relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 1.5,
                delay: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 p-4"
            >
              <Shield className="h-10 w-10 text-red-500" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Sentinel Flow
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            SentinelFlow is a real-time AI disaster alert system that turns
            devices into sensors, forming a decentralized network for rapid
            emergency detection and response.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Button
              asChild
              size="lg"
              className="group bg-red-600 hover:bg-red-700"
            >
              <Link href="/dashboard">
                Check Alerts in Your Area
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-300 text-white bg-transparent hover:bg-blue-400"
            >
              Learn More
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="mt-12 flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm text-white">
              Live monitoring active across 150+ countries
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <ArrowRight className="h-6 w-6 rotate-90 text-white opacity-70" />
          </motion.div>
        </motion.div>
      </section>

      {/* Live Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-red-600 py-3 text-white"
      >
        <div className="container">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white"></div>
              <span className="font-medium">LIVE ALERTS:</span>
            </div>
            <div className="overflow-hidden">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                }}
                className="flex whitespace-nowrap"
              >
                <span className="mx-4">
                  Flood warning in Miami-Dade County, FL
                </span>
                <span className="mx-4">
                  Wildfire alert in Northern California
                </span>
                <span className="mx-4">
                  Hurricane watch for coastal Louisiana
                </span>
                <span className="mx-4">
                  Earthquake reported near Los Angeles, CA
                </span>
                <span className="mx-4">
                  Tornado warning in central Oklahoma
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Impact Stats Section */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <AnimatedSectionHeader
            title="Making a Real Difference"
            subtitle="DisasterAlert has helped communities prepare for and respond to natural disasters across the globe."
          />

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <ImpactCounter value={5000} label="Lives Saved" delay={0.2} />
            <ImpactCounter
              value={12000}
              label="Communities Protected"
              delay={0.4}
            />
            <ImpactCounter value={250000} label="Alerts Sent" delay={0.6} />
            <ImpactCounter value={98} label="Accuracy Rate %" delay={0.8} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <AnimatedSectionHeader
          title="Stay Safe with Advanced Features"
          subtitle="Our platform combines cutting-edge technology with practical safety features to keep you informed and protected during emergencies."
        />

        <div className="grid gap-8 md:grid-cols-3">
          <AnimatedFeatureCard
            icon={Bell}
            title="Real-Time Alerts"
            description="Receive immediate notifications about disasters in your area with AI-powered severity analysis."
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
            delay={0.2}
          />
          <AnimatedFeatureCard
            icon={Shield}
            title="Safety Tips"
            description="Get personalized safety instructions based on your location and the type of disaster."
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            delay={0.4}
          />
          <AnimatedFeatureCard
            icon={Users}
            title="Community Reports"
            description="Contribute and access crowdsourced information about local conditions during emergencies."
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            delay={0.6}
          />
          <AnimatedFeatureCard
            icon={Globe}
            title="Global Coverage"
            description="Our system monitors disasters worldwide, providing alerts for over 150 countries."
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            delay={0.8}
          />
          <AnimatedFeatureCard
            icon={MapPin}
            title="Location-Based"
            description="Alerts are tailored to your specific location, ensuring you only receive relevant information."
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
            delay={1.0}
          />
          <AnimatedFeatureCard
            icon={Clock}
            title="24/7 Monitoring"
            description="Our systems work around the clock to keep you informed of developing situations."
            iconColor="text-teal-600"
            iconBgColor="bg-teal-100"
            delay={1.2}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="container">
          <AnimatedSectionHeader
            title="How DisasterAlert Works"
            subtitle="Our platform uses advanced technology to keep you safe during emergencies."
          />

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              className="relative flex flex-col items-center rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-2xl font-bold text-red-500">
                1
              </div>
              <h3 className="mb-2 text-xl font-bold">Data Collection</h3>
              <p className="text-slate-300">
                Our system continuously monitors global data sources, weather
                patterns, seismic activity, and official alerts.
              </p>
            </motion.div>

            <motion.div
              className="relative flex flex-col items-center rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-2xl font-bold text-red-500">
                2
              </div>
              <h3 className="mb-2 text-xl font-bold">AI Analysis</h3>
              <p className="text-slate-300">
                Our AI analyzes the data to determine severity, impact area, and
                generates personalized safety instructions.
              </p>
            </motion.div>

            <motion.div
              className="relative flex flex-col items-center rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-2xl font-bold text-red-500">
                3
              </div>
              <h3 className="mb-2 text-xl font-bold">Instant Alerts</h3>
              <p className="text-slate-300">
                You receive immediate, location-specific alerts through the app,
                SMS, or email with actionable safety guidance.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="container">
          <AnimatedSectionHeader
            title="Real Stories, Real Impact"
            subtitle="Hear from people who have used DisasterAlert during critical moments."
          />

          <div className="grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="DisasterAlert warned us about the flash flood 30 minutes before official channels. We had time to move to higher ground and save our important documents."
              author="Maria Rodriguez"
              location="Houston, TX"
              delay={0.2}
            />
            <TestimonialCard
              quote="During the wildfire season, I received specific evacuation routes based on real-time fire movement. This app literally saved my family."
              author="David Chen"
              location="Northern California"
              delay={0.4}
            />
            <TestimonialCard
              quote="As an emergency manager, this platform has revolutionized how we communicate with residents during disasters. The crowdsourced reports help us allocate resources more effectively."
              author="Sarah Johnson"
              location="Emergency Services Director"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Disaster Types Section with Images */}
      <section className="py-16">
        <div className="container">
          <AnimatedSectionHeader
            title="Prepared for Any Disaster"
            subtitle="DisasterAlert provides specialized alerts and safety guidance for all types of natural disasters."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              className="group relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <img
                src="images.jpg"
                alt="Flood disaster"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">Floods</h3>
                <p className="text-sm text-slate-200">
                  Real-time water level monitoring and evacuation guidance
                </p>
              </div>
            </motion.div>

            <motion.div
              className="group relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <img
                src="fire.jpg"
                alt="Wildfire disaster"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Wildfires
                </h3>
                <p className="text-sm text-slate-200">
                  Fire movement tracking and safe evacuation routes
                </p>
              </div>
            </motion.div>

            <motion.div
              className="group relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <img
                src="huri.jpg"
                alt="Hurricane disaster"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Hurricanes
                </h3>
                <p className="text-sm text-slate-200">
                  Storm tracking, wind speed alerts, and shelter locations
                </p>
              </div>
            </motion.div>

            <motion.div
              className="group relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img
                src="earth.jpg"
                alt="Earthquake disaster"
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Earthquakes
                </h3>
                <p className="text-sm text-slate-200">
                  Seismic activity monitoring and safety protocols
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-red-900/80 z-10" />
          <img
            src="https://v0.blob.com/disaster-cta-bg.jpg"
            alt="Emergency preparedness"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Be Prepared, Not Scared
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-200">
              Sign up for SMS alerts to receive critical updates even when
              you're offline or have limited connectivity. Every second counts
              during an emergency.
            </p>
            <Button
              asChild
              size="lg"
              className="group bg-white text-red-600 hover:bg-red-50"
            >
              <Link href="/subscribe">
                Subscribe to SMS Alerts
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-500" />
                <span className="font-semibold">DisasterAlert</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Providing real-time disaster alerts and safety information to
                communities worldwide.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Safety Tips
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Emergency Contacts
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
            <p className="mb-4 text-center text-sm text-muted-foreground md:mb-0 md:text-left">
              © 2025 DisasterAlert. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
