"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { EduVerification } from "@/components/edu-verification"
import { PaymentModal } from "@/components/payment-modal"

import type React from "react"
import { useState } from "react"
import {
  Upload,
  FileText,
  Presentation,
  Merge,
  Download,
  Check,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Star,
  ArrowRight,
  Users,
  Award,
  LogIn,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileItem {
  id: string
  name: string
  size: number
  type: string
}

interface UserType {
  id: string
  name: string
  email: string
  plan: "free" | "pro" | "enterprise"
  filesProcessedToday: number
}

export default function AsaPDF() {
  const [activeTab, setActiveTab] = useState("merge")
  const [files, setFiles] = useState<FileItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<"pro" | "enterprise">("pro")
  const [isEduVerificationOpen, setIsEduVerificationOpen] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  // Login/Register states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUser({
      id: "1",
      name: "John Doe",
      email: loginEmail,
      plan: "pro",
      filesProcessedToday: 12,
    })
    setIsLoginOpen(false)
    setLoginEmail("")
    setLoginPassword("")
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUser({
      id: "1",
      name: registerName,
      email: registerEmail,
      plan: "free",
      filesProcessedToday: 0,
    })
    setIsLoginOpen(false)
    setRegisterName("")
    setRegisterEmail("")
    setRegisterPassword("")
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    const newFiles = uploadedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)
    const newFiles = droppedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const canProcessFiles = () => {
    if (!user) return false
    if (user.plan === "free" && user.filesProcessedToday >= 5) return false
    return true
  }

  const processFiles = async () => {
    if (files.length === 0 || !canProcessFiles()) return

    setIsProcessing(true)
    setProgress(0)
    setShowSuccess(false)
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        // Create a mock File object for the demo
        const mockFile = new File(["mock content"], file.name, { type: file.type })
        formData.append("files", mockFile)
      })
      formData.append("action", activeTab)
      formData.append("userId", user?.id || "")

      // Progress simulation
      for (let i = 0; i <= 90; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const response = await fetch("/api/process-files", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setProgress(100)

        // Update user's daily usage
        if (user) {
          setUser({ ...user, filesProcessedToday: user.filesProcessedToday + files.length })
        }

        setShowSuccess(true)

        // Auto-download
        const a = document.createElement("a")
        a.href = url
        a.download = `${activeTab}_${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        throw new Error("Processing failed")
      }
    } catch (error) {
      console.error("Processing error:", error)
      setShowSuccess(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = (plan: string) => {
    if (user) {
      setUser({ ...user, plan: plan as "free" | "pro" | "enterprise" })
    }
    setIsPaymentModalOpen(false)
  }

  const handleEduVerified = () => {
    if (user) {
      setUser({ ...user, plan: "pro" })
    }
    setIsEduVerificationOpen(false)
  }

  const openPaymentModal = (plan: "pro" | "enterprise") => {
    setSelectedPaymentPlan(plan)
    setIsPaymentModalOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: "smooth" })
    setIsMobileMenuOpen(false)
  }

  const tabs = [
    { id: "merge", label: "Merge PDFs", icon: Merge },
    { id: "markdown", label: "Markdown", icon: FileText },
    { id: "pptx", label: "PowerPoint", icon: Presentation },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
      {/* Header */}
      <header className="relative z-50 sticky top-0 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">asapdf</h1>
                <p className="text-xs font-medium text-gray-500 -mt-1">As Soon As PDF</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 capitalize">{user.plan} Plan</p>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="rounded-full px-4 py-2 text-sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 font-medium">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Welcome to asapdf</DialogTitle>
                      <DialogDescription>Login or create your account to get started</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login" className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Login
                          </Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="register" className="space-y-4">
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-email">Email</Label>
                            <Input
                              id="reg-email"
                              type="email"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-password">Password</Label>
                            <Input
                              id="reg-password"
                              type="password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Create Account
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left text-gray-700 hover:text-gray-900 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-left text-gray-700 hover:text-gray-900 font-medium"
                >
                  How it Works
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-left text-gray-700 hover:text-gray-900 font-medium"
                >
                  Pricing
                </button>
                {!user && (
                  <Button
                    onClick={() => setIsLoginOpen(true)}
                    className="bg-black text-white hover:bg-gray-800 rounded-full w-fit px-6 py-2"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-tight mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                As Soon As
              </span>{" "}
              PDF Tools.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Lightning-fast PDF processing that works as soon as you need it. No waiting, no hassle.
            </p>

            {user && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold">{user.name}</span>!
                </p>
                <p className="text-xs text-gray-500">
                  {user.plan === "free"
                    ? `${5 - user.filesProcessedToday} files remaining today`
                    : "Unlimited processing"}
                </p>
              </div>
            )}

            {/* Tab Selection */}
            <div className="flex justify-center mb-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-full p-2 shadow-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                      activeTab === tab.id ? "bg-black text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <Button
                onClick={() => setIsLoginOpen(true)}
                size="lg"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-12 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Processing Now
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="relative -mt-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Success Alert */}
          {showSuccess && (
            <Alert className="mb-8 border-green-200 bg-green-50/80 backdrop-blur-sm">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Files processed successfully! Your download should start automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Usage Limit Warning */}
          {user && user.plan === "free" && user.filesProcessedToday >= 5 && (
            <Alert className="mb-8 border-orange-200 bg-orange-50/80 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You've reached your daily limit. Upgrade to Pro for unlimited processing!
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Upload Section */}
              <div className="p-8 lg:p-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Upload Files</h3>
                </div>

                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                    canProcessFiles()
                      ? "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => canProcessFiles() && document.getElementById("file-upload")?.click()}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {canProcessFiles() ? "Drop your files here" : "Upgrade to continue"}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {activeTab === "merge"
                      ? "Upload multiple PDF files to merge them into one document"
                      : activeTab === "markdown"
                        ? "Upload Markdown files to convert them to PDF format"
                        : "Upload PowerPoint presentations to convert them to PDF format"}
                  </p>
                  {canProcessFiles() && (
                    <Button variant="outline" className="rounded-full px-6 py-2 border-2 hover:bg-gray-50">
                      Browse Files
                    </Button>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept={activeTab === "merge" ? ".pdf" : activeTab === "markdown" ? ".md,.markdown" : ".pptx,.ppt"}
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={!canProcessFiles()}
                  />
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-4">Uploaded Files</h4>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-48">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Processing Section */}
              <div className="p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Process & Download</h3>
                </div>

                {files.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No files uploaded yet</h4>
                    <p className="text-gray-500">Upload files to get started with processing</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-900">Ready to process</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {files.length} file{files.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total size: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                      </div>
                    </div>

                    {isProcessing && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                          <span className="font-medium text-gray-900">Processing files...</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm text-gray-600">{progress}% complete</p>
                      </div>
                    )}

                    <Button
                      onClick={processFiles}
                      disabled={isProcessing || files.length === 0 || !user || !canProcessFiles()}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-semibold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                    >
                      {!user ? (
                        <>
                          <LogIn className="w-5 h-5 mr-3" />
                          Login to Process
                        </>
                      ) : isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-3" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-3" />
                          {activeTab === "merge"
                            ? "Merge PDFs"
                            : activeTab === "markdown"
                              ? "Convert to PDF"
                              : "Convert to PDF"}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Every Need
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage, convert, and optimize your PDF documents in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Lightning Fast</CardTitle>
                <CardDescription className="text-gray-600">
                  Process files in seconds with our optimized algorithms and cloud infrastructure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Secure & Private</CardTitle>
                <CardDescription className="text-gray-600">
                  Your files are encrypted and automatically deleted after processing. Complete privacy guaranteed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Works Everywhere</CardTitle>
                <CardDescription className="text-gray-600">
                  Access from any device, any browser. No downloads or installations required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Merge className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Multiple Formats</CardTitle>
                <CardDescription className="text-gray-600">
                  Support for PDF, Markdown, PowerPoint, and more. Convert between any formats seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Team Collaboration</CardTitle>
                <CardDescription className="text-gray-600">
                  Share processed files instantly with your team. Built-in collaboration tools included.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Premium Quality</CardTitle>
                <CardDescription className="text-gray-600">
                  Maintain original formatting and quality. Professional results every time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How It{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your documents. No technical knowledge required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Upload Files</h3>
                <p className="text-gray-600 leading-relaxed">
                  Drag and drop your files or click to browse. We support all major document formats including PDF,
                  Markdown, and PowerPoint.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Choose Action</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select what you want to do - merge PDFs, convert Markdown to PDF, or transform PowerPoint
                  presentations.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-10 h-10 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Download Result</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your processed file is ready in seconds. Download instantly or share with your team members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Loved by{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who trust asapdf for their document needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "asapdf has revolutionized how we handle documents in our office. The speed and quality are
                  unmatched!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Miller</p>
                    <p className="text-sm text-gray-500">Marketing Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "As a freelancer, I need reliable tools. asapdf delivers every time with professional results."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">John Davis</p>
                    <p className="text-sm text-gray-500">Freelance Designer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "The security and privacy features give me peace of mind. Perfect for handling sensitive documents."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">EW</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Emily Wilson</p>
                    <p className="text-sm text-gray-500">Legal Consultant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Free</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
                <CardDescription className="text-gray-600">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">5 files per day</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">Basic PDF merge</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">Standard quality</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">Email support</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full py-3"
                >
                  Get Started Free
                </Button>
                <Button
                  onClick={() => setIsEduVerificationOpen(true)}
                  variant="outline"
                  className="w-full mt-2 rounded-full py-3"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student/Educator Access
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-bold mb-2">Pro</CardTitle>
                <div className="text-4xl font-bold mb-4">$3</div>
                <CardDescription className="text-purple-100">For professionals and teams</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-300 mr-3" />
                    <span>Unlimited files</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-300 mr-3" />
                    <span>All conversion tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-300 mr-3" />
                    <span>Premium quality</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-300 mr-3" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-300 mr-3" />
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <Button
                  onClick={() => openPaymentModal("pro")}
                  className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-full py-3 font-semibold"
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-4">$15</div>
                <CardDescription className="text-gray-600">For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">Everything in Pro</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">API access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">24/7 phone support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-600">SLA guarantee</span>
                  </li>
                </ul>
                <Button
                  onClick={() => openPaymentModal("enterprise")}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full py-3"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">Ready to Transform Your Documents?</h2>
          <p className="text-xl text-purple-100 mb-12 leading-relaxed">
            Join thousands of users who trust asapdf for their document processing needs. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsLoginOpen(true)}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 py-4 text-lg font-semibold"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 rounded-full px-8 py-4 text-lg font-semibold"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Super Cool Footer */}
      <footer className="relative bg-gray-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-5">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white">asapdf</h3>
                    <p className="text-lg font-medium text-gray-300 -mt-1">As Soon As PDF</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg mb-8">
                  The most powerful and user-friendly PDF toolkit on the web. Transform your documents with lightning
                  speed and professional quality.
                </p>

                {/* Social Links */}
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  >
                    <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  >
                    <Github className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  >
                    <Linkedin className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  >
                    <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  </a>
                </div>
              </div>

              {/* Links Sections */}
              <div className="lg:col-span-7 grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Product
                  </h4>
                  <ul className="space-y-4">
                    <li>
                      <a
                        href="#features"
                        className="text-gray-300 hover:text-white transition-colors flex items-center group"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#pricing"
                        className="text-gray-300 hover:text-white transition-colors flex items-center group"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        API
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Integrations
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Support
                  </h4>
                  <ul className="space-y-4">
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Status
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Community
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Company
                  </h4>
                  <ul className="space-y-4">
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        Privacy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-16 pt-12 border-t border-gray-800">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email us</p>
                    <p className="text-white font-medium">hello@asapdf.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Call us</p>
                    <p className="text-white font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Visit us</p>
                    <p className="text-white font-medium">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 mb-4 md:mb-0">
                  © 2024 asapdf. All rights reserved. Made with ❤️ for document lovers.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Cookies
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Security
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
      </footer>
      {/* Payment Modal */}
      {user && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPaymentPlan}
          onSuccess={handlePaymentSuccess}
          userId={user.id}
        />
      )}

      {/* Edu Verification Modal */}
      <Dialog open={isEduVerificationOpen} onOpenChange={setIsEduVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <EduVerification onVerified={handleEduVerified} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
