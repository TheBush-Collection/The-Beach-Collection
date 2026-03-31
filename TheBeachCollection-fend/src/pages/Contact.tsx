import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Calendar, Users, HelpCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import FAQModal from '@/components/FAQModal';
import { subscribeToMailchimp } from '@/lib/mailchimp';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    travelDates: '',
    groupSize: '',
    interests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send contact form data to the backend, which saves the message
      // and subscribes to Mailchimp for follow-up
      const response = await fetch(`${BACKEND_BASE}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          preferredTravelDates: formData.travelDates,
          groupSize: formData.groupSize,
          safariInterests: formData.interests,
          message: formData.message,
          subscribe: true, // subscribe to Mailchimp for follow-up
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Thank you! We\'ll get back to you within 24 hours.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          travelDates: '',
          groupSize: '',
          interests: ''
        });
      } else {
        toast.error(data.error || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+254116072343'],
      description: 'Mon-Fri 9AM-6PM EST'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@thebushcollection.africa', 'reservations@thebushcollection.africa'],
      description: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['42 Claret Close', 'Silanga Road', 'Karen'],
      description: 'Visit us by appointment'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon-Fri: 9AM-6PM', 'Sat: 10AM-4PM'],
      description: 'Closed on Sundays'
    }
  ];

  

  return (
    <div className="min-h-screen">
      {/* Floating subscribe button */}
      <button
        onClick={() => setShowSubscribeModal(true)}
        aria-label="Subscribe to newsletter"
        className="fixed right-8 bottom-8 z-50 flex items-center gap-4 bg-[#c9a961] text-black px-5 py-3 rounded-full shadow-lg hover:opacity-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18" />
        </svg>
        <span className="font-medium">Subscribe to Newsletter</span>
      </button>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSubscribeModal(false)} />

          <div className="relative z-50 w-full max-w-xl px-4">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#c9a961] rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                <ArrowLeft className="w-5 h-5 text-white" />
              </div>

              <button
                onClick={() => setShowSubscribeModal(false)}
                className="absolute top-2 right-2 text-white text-xl leading-none p-2 z-20"
                aria-label="Close subscribe modal"
              >
                ×
              </button>

              <div className="bg-[#0f0e0d] border border-[#c9a961] rounded-lg p-6 text-white shadow-2xl">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-semibold">Subscribe to Our Newsletter</h3>
                  <p className="text-sm text-white/70 mt-2">Get exclusive safari deals, travel tips, and updates delivered to your inbox.</p>
                </div>

                <div className="mt-4">
                  <NewsletterCard onClose={() => setShowSubscribeModal(false)} />
                </div>

                <p className="text-xs text-white/50 mt-4 text-center">We respect your privacy. Unsubscribe at any time.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-[#CFE7F8] max-w-3xl mx-auto mb-8">
            Ready to plan your dream safari? Get in touch with our expert team and let's create an unforgettable African adventure together.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gradient-to-b from-[#F4FAFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map(({ icon: Icon, title, details, description }, index) => (
              <Card key={index} className="text-center rounded-2xl shadow-xl ring-1 ring-[#92AAD1]/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-[#CFE7F8] rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                    <Icon className="h-6 w-6 text-[#749DD0]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#33343B] mb-2">{title}</h3>
                  <div className="space-y-1 mb-2 w-full">
                    {details.map((detail, idx) => (
                      <p key={idx} className="text-[#48547C] font-medium text-sm break-words leading-snug">{detail}</p>
                    ))}
                  </div>
                  <p className="text-sm text-[#92AAD1]">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="rounded-2xl shadow-2xl ring-1 ring-[#92AAD1]/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#33343B]">
                    <MessageCircle className="h-5 w-5 mr-2 text-[#749DD0]" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="booking">Booking Question</SelectItem>
                          <SelectItem value="custom">Custom Safari Request</SelectItem>
                          <SelectItem value="group">Group Booking</SelectItem>
                          <SelectItem value="support">Customer Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="travelDates">Preferred Travel Dates</Label>
                        <Input
                          id="travelDates"
                          value={formData.travelDates}
                          onChange={(e) => setFormData({...formData, travelDates: e.target.value})}
                          placeholder="e.g., July 2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="groupSize">Group Size</Label>
                        <Select value={formData.groupSize} onValueChange={(value) => setFormData({...formData, groupSize: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Number of travelers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 person</SelectItem>
                            <SelectItem value="2">2 people</SelectItem>
                            <SelectItem value="3-4">3-4 people</SelectItem>
                            <SelectItem value="5-8">5-8 people</SelectItem>
                            <SelectItem value="9+">9+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="interests">Safari Interests</Label>
                      <Input
                        id="interests"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        placeholder="e.g., Big Five, Photography, Cultural experiences"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us about your dream safari..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transform-gpu transition-all" disabled={isSubmitting}>
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* (Newsletter moved to floating button + modal) */}
              {/* Quick Actions */}
              <Card className="rounded-2xl shadow-2xl ring-1 ring-[#92AAD1]/10">
                <CardHeader>
                  <CardTitle className="text-[#33343B]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/packages">
                    <Button variant="outline" className="w-full justify-start border-[#92AAD1]/30 text-[#48547C] hover:bg-[#CFE7F8]/50 hover:border-[#749DD0] transition-colors">
                      <Calendar className="h-4 w-4 mr-2 text-[#749DD0]" />
                      Browse Safari Packages
                    </Button>
                  </Link>
                  <Link to="/collections">
                    <Button variant="outline" className="w-full justify-start border-[#92AAD1]/30 text-[#48547C] hover:bg-[#CFE7F8]/50 hover:border-[#749DD0] transition-colors">
                      <MapPin className="h-4 w-4 mr-2 text-[#749DD0]" />
                      View Safari Properties
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start border-[#92AAD1]/30 text-[#48547C] hover:bg-[#CFE7F8]/50 hover:border-[#749DD0] transition-colors">
                    <Users className="h-4 w-4 mr-2 text-[#749DD0]" />
                    Request Group Quote
                  </Button>
                  <FAQModal
                    trigger={
                      <Button variant="outline" className="w-full justify-start border-[#92AAD1]/30 text-[#48547C] hover:bg-[#CFE7F8]/50 hover:border-[#749DD0] transition-colors">
                        <HelpCircle className="h-4 w-4 mr-2 text-[#749DD0]" />
                        Frequently Asked Questions
                      </Button>
                    }
                  />
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-red-50/80 border-red-200 rounded-2xl shadow-xl ring-1 ring-red-200/30">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 mb-2">
                    If you're currently on a safari and need immediate assistance:
                  </p>
                  <p className="font-semibold text-red-800">24/7 Emergency Line: +254116072343</p>
                  <p className="text-sm text-red-600 mt-2">
                    Available for guests on active safari bookings only
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gradient-to-b from-white to-[#F4FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#33343B] mb-4">Visit Our Office</h2>
            <p className="text-[#48547C]">Located in the heart of Adventure City</p>
          </div>
          
          <Card className="rounded-2xl shadow-2xl ring-1 ring-[#92AAD1]/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="rounded-lg overflow-hidden">
          <iframe
            src="https://maps.google.com/maps?width=600&height=400&hl=en&q=The%20Bush%20Collection&t=&z=14&ie=UTF8&iwloc=B&output=embed"
            width="100%"
            height="400"
            loading="lazy"
            className="w-full border-0"
            allowFullScreen
          ></iframe>
        </div>
      </CardContent>
    </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-xl text-[#CFE7F8] mb-8">
            Our safari experts are standing by to help create your perfect African adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#48547C] hover:bg-[#CFE7F8] px-8 py-3 shadow-lg hover:shadow-xl hover:scale-105 transform-gpu transition-all">
              Call Now: +254116072343
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#48547C] px-8 py-3 shadow-lg hover:shadow-xl hover:scale-105 transform-gpu transition-all">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#33343B] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Safari Tours</h3>
              <p className="text-[#92AAD1] mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-[#92AAD1]">
                <li><Link to="/packages" className="hover:text-white transition-colors">Safari Packages</Link></li>
                <li><Link to="/collections" className="hover:text-white transition-colors">Properties</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-[#92AAD1]">
                <li>Tanzania</li>
                <li>Kenya</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-[#92AAD1]">
                <li>+254116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#48547C] mt-8 pt-8 text-center text-[#92AAD1]">
            <p>&copy; {new Date().getFullYear()} The Bush Collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* single modal handled above (dark-themed). Duplicate UI removed */}
    </div>
  );
}

function NewsletterCard({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      const res = await subscribeToMailchimp({ email });
      if (res.success) {
        toast.success('Subscribed — check your inbox');
        setEmail('');
        onClose?.();
      } else {
        toast.error(res.error || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      toast.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="flex gap-2">
      <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit" disabled={loading}>{loading ? 'Subscribing...' : 'Subscribe'}</Button>
    </form>
  );
}