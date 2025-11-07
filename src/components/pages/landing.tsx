import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Cloud, Database, Lock, Upload } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cloud className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold">SCloud</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            SCloud
          </h1>
          <p className="text-2xl text-muted-foreground">
            by Atif, Cloud Engineer
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern cloud storage solution powered by AWS. Store your files securely with enterprise-grade infrastructure.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Upload className="mr-2 h-5 w-5" />
                Upload Your First File
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4">Features</h2>
          <p className="text-muted-foreground">Built with cutting-edge cloud technology</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-4">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Secure S3 Storage</CardTitle>
              <CardDescription>
                Files are stored securely in AWS S3 with industry-standard encryption and redundancy.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Fast DynamoDB Metadata</CardTitle>
              <CardDescription>
                File details are managed in a high-performance DynamoDB table for instant access.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Reliable Authentication</CardTitle>
              <CardDescription>
                User authentication is handled securely using DynamoDB with encrypted credentials.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-semibold mb-6">Modern Cloud Architecture</h2>
              <p className="text-muted-foreground mb-4">
                SCloud leverages the power of AWS to provide a scalable, reliable, and secure file storage solution. 
              </p>
              <p className="text-muted-foreground mb-4">
                Built with serverless architecture, SCloud automatically scales to meet your needs while keeping costs optimized.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-600 to-red-600" />
                  99.99% uptime SLA
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-600 to-red-600" />
                  Automatic backups and versioning
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-600 to-red-600" />
                  Global CDN for fast access
                </li>
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1667984390553-7f439e6ae401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYyNDQyNzk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Cloud Computing Technology"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SCloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
