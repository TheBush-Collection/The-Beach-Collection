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
import { subscribeToMailchimp, parseFullName } from '@/lib/mailchimp';


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
      // Parse name into first and last name for Mailchimp
      const { firstName, lastName } = parseFullName(formData.name);

      // Subscribe to Mailchimp
      const result = await subscribeToMailchimp({
        email: formData.email,
        firstName,
        lastName,
        phone: formData.phone,
        company: formData.subject,
        tags: formData.interests ? formData.interests.split(',').map(t => t.trim()) : [],
      });

      if (result.success) {
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
        toast.error(result.error || 'Failed to submit form. Please try again.');
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
      details: ['info@thebushcollection.africa', 'bookings@thebushcollection.africa'],
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
      <section className="relative py-24 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-cyan-100 max-w-3xl mx-auto mb-8">
            Ready to plan your dream safari? Get in touch with our expert team and let's create an unforgettable African adventure together.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map(({ icon: Icon, title, details, description }, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                  <div className="space-y-1 mb-2">
                    {details.map((detail, idx) => (
                      <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{description}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
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

                    <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600" disabled={isSubmitting}>
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
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/packages">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Safari Packages
                    </Button>
                  </Link>
                  <Link to="/collections">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      View Safari Properties
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Request Group Quote
                  </Button>
                  <FAQModal
                    trigger={
                      <Button variant="outline" className="w-full justify-start">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Frequently Asked Questions
                      </Button>
                    }
                  />
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Emergency Contact</CardTitle>
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-gray-600">Located in the heart of Adventure City</p>
          </div>
          
          <Card>
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
      <section className="py-16 bg-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Our safari experts are standing by to help create your perfect African adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-3">
              Call Now: +254116072343
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-3">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Safari Tours</h3>
              <p className="text-gray-400 mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/packages" className="hover:text-white">Safari Packages</Link></li>
                <li><Link to="/collections" className="hover:text-white">Properties</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tanzania</li>
                <li>Kenya</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+254116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 The Bush Collection. All rights reserved.</p>
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