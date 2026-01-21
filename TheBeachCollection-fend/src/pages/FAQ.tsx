import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search, 
  HelpCircle, 
  ArrowLeft, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  Building2,
  Waves,
  Sparkles,
  MessageCircle,
  UtensilsCrossed
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FAQModal from '@/components/FAQModal';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryIcons: Record<string, React.ReactNode> = {
    'Booking & Reservations': <Calendar className="h-6 w-6" />,
    'Beach & Location': <MapPin className="h-6 w-6" />,
    'Hotel Amenities': <Sparkles className="h-6 w-6" />,
    'Payments & Cancellations': <CreditCard className="h-6 w-6" />,
    'Accommodations & Rooms': <Building2 className="h-6 w-6" />
  };

  const faqs = [
    {
      category: 'Booking & Reservations',
      questions: [
        {
          question: 'How far in advance should I book?',
          answer: 'We recommend booking 2-4 months in advance, especially for peak season (December-March) and holidays. However, we can often accommodate last-minute bookings depending on availability at our beach properties.'
        },
        {
          question: 'What\'s included in the hotel packages?',
          answer: 'Most packages include accommodation, daily breakfast, access to beach facilities, pool access, WiFi, and airport transfers. Some premium packages also include spa credits, water sports, and romantic dinner experiences. We\'ll provide a detailed breakdown upon booking.'
        },
        {
          question: 'Do you offer custom beach vacation packages?',
          answer: 'Absolutely! We specialize in creating personalized beach getaways tailored to your preferences, budget, and travel dates. Whether you\'re looking for a romantic escape, family vacation, or adventure trip, our team will craft the perfect itinerary.'
        },
        {
          question: 'Can I combine multiple beach properties?',
          answer: 'Yes! Many of our guests love to experience different coastal destinations. We can arrange seamless transfers between our properties in Diani Beach, Mombasa, and other coastal locations for the ultimate beach-hopping experience.'
        }
      ]
    },
    {
      category: 'Beach & Location',
      questions: [
        {
          question: 'How do I get to your beach properties?',
          answer: 'Our properties are easily accessible from Moi International Airport (Mombasa). We offer complimentary airport transfers for most bookings. The drive to Diani Beach is approximately 45 minutes through scenic coastal roads.'
        },
        {
          question: 'What water activities are available?',
          answer: 'Our beach properties offer a variety of water activities including snorkeling, scuba diving, jet skiing, kitesurfing, paddleboarding, and deep-sea fishing. Some activities may require additional booking and fees.'
        },
        {
          question: 'Is it safe to swim at your beaches?',
          answer: 'Yes, our beaches are carefully selected for their safety and beauty. All properties have designated swimming areas, and many have reef protection. Lifeguards are on duty during daylight hours at our main beach properties.'
        }
      ]
    },
    {
      category: 'Hotel Amenities',
      questions: [
        {
          question: 'What amenities are available at your properties?',
          answer: 'Our properties feature infinity pools, spa and wellness centers, beachfront restaurants, fitness facilities, kids clubs, water sports centers, and private beach access. Specific amenities vary by property, so check individual listings for details.'
        },
        {
          question: 'Do you offer spa and wellness services?',
          answer: 'Yes! Most of our properties have world-class spas offering massages, facials, body treatments, and wellness programs. Many use locally-sourced ingredients and traditional African healing techniques for a truly unique experience.'
        },
        {
          question: 'What if I have dietary restrictions?',
          answer: 'We accommodate all dietary requirements including vegetarian, vegan, gluten-free, halal, and specific allergies. Please inform us at the time of booking so our chefs can prepare personalized meals for your stay.'
        }
      ]
    },
    {
      category: 'Payments & Cancellations',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept bank transfers, major credit cards (Visa, MasterCard, American Express), M-Pesa, and PayPal. A 20-30% deposit is typically required to confirm your booking, with the balance due 14 days before arrival.'
        },
        {
          question: 'What is your cancellation policy?',
          answer: 'Cancellation policies vary by rate type and season. Flexible rates allow free cancellation up to 48 hours before arrival. Non-refundable rates offer better pricing but cannot be cancelled. Please check your specific booking terms for details.'
        },
        {
          question: 'Is travel insurance recommended?',
          answer: 'While not mandatory, we strongly recommend comprehensive travel insurance covering trip cancellation, medical emergencies, and personal belongings. We can recommend trusted insurance providers upon request.'
        }
      ]
    },
    {
      category: 'Accommodations & Rooms',
      questions: [
        {
          question: 'What room types do you offer?',
          answer: 'We offer a variety of accommodations including ocean-view rooms, beachfront suites, private villas with pools, family apartments, and honeymoon suites. All rooms are designed for comfort with modern amenities and coastal-inspired décor.'
        },
        {
          question: 'Do rooms have ocean views?',
          answer: 'Many of our rooms offer stunning ocean views. Premium categories guarantee direct sea views, while garden-view rooms provide a tranquil retreat at excellent value. Room views are clearly indicated when booking.'
        },
        {
          question: 'Do accommodations have WiFi and air conditioning?',
          answer: 'All our properties offer complimentary high-speed WiFi and individually controlled air conditioning. Most rooms also feature ceiling fans, mini-bars, flat-screen TVs, and premium bedding for your comfort.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFE7F8]/30 via-white to-[#92AAD1]/20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#749DD0]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#92AAD1]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#CFE7F8]/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#749DD0] overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-pulse" />
            <div className="absolute top-32 right-20 w-24 h-24 border border-white/15 rounded-full animate-pulse delay-300" />
            <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-white/10 rounded-full animate-pulse delay-700" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Waves className="h-4 w-4 text-[#CFE7F8]" />
                <span className="text-white/90 text-sm font-medium">Help & Support</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently Asked
                <span className="block text-[#CFE7F8]">Questions</span>
              </h1>
              
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Find answers to common questions about booking your perfect beach getaway, 
                our coastal properties, amenities, and everything you need to know for an unforgettable stay.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button 
                    className="bg-white text-[#33343B] hover:bg-[#CFE7F8] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                </Link>
                <FAQModal
                  trigger={
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Quick FAQ
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transform hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-[#749DD0]/30 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">5+</div>
                <p className="text-white/70 text-sm">Beach Properties</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transform hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-[#92AAD1]/30 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <p className="text-white/70 text-sm">Guest Satisfaction</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transform hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-[#CFE7F8]/30 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <p className="text-white/70 text-sm">Support Available</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transform hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">&lt;2h</div>
                <p className="text-white/70 text-sm">Response Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#749DD0] h-5 w-5" />
            <Input
              placeholder="Search for answers... (e.g., 'payment methods', 'room types', 'cancellation')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-[#92AAD1]/30 focus:border-[#749DD0] focus:ring-[#749DD0]/20 rounded-xl bg-white/50"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === null
                ? 'bg-[#749DD0] text-white shadow-lg'
                : 'bg-white/60 text-[#48547C] hover:bg-white/80 border border-[#92AAD1]/30'
            }`}
          >
            All Categories
          </button>
          {faqs.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategory === cat.category
                  ? 'bg-[#749DD0] text-white shadow-lg'
                  : 'bg-white/60 text-[#48547C] hover:bg-white/80 border border-[#92AAD1]/30'
              }`}
            >
              {categoryIcons[cat.category]}
              {cat.category.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredFaqs.length > 0 ? (
          <div className="space-y-6">
            {filteredFaqs
              .filter(category => !activeCategory || category.category === activeCategory)
              .map((category, categoryIndex) => (
              <Card 
                key={categoryIndex} 
                className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-[#749DD0]/10 to-[#92AAD1]/5 border-b border-[#92AAD1]/10">
                  <CardTitle className="text-xl text-[#33343B] font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-xl flex items-center justify-center text-white shadow-md">
                      {categoryIcons[category.category]}
                    </div>
                    {category.category}
                    <span className="ml-auto text-sm font-normal text-[#48547C]/60 bg-[#CFE7F8]/50 px-3 py-1 rounded-full">
                      {category.questions.length} {category.questions.length === 1 ? 'question' : 'questions'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`${categoryIndex}-${faqIndex}`}
                        className="border border-[#92AAD1]/20 rounded-xl px-5 bg-white/50 hover:bg-white/80 transition-colors data-[state=open]:bg-[#CFE7F8]/20 data-[state=open]:border-[#749DD0]/30"
                      >
                        <AccordionTrigger className="text-left hover:text-[#749DD0] py-5 hover:no-underline">
                          <span className="font-medium text-[#33343B] pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-[#48547C] leading-relaxed pb-5 pt-2">
                          <div className="border-l-2 border-[#749DD0]/30 pl-4">
                            {faq.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#92AAD1]/20 to-[#CFE7F8]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-12 w-12 text-[#749DD0]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#33343B] mb-3">
              No results found
            </h3>
            <p className="text-[#48547C] mb-6 max-w-md mx-auto">
              We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory(null);
              }}
              className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#92AAD1] hover:to-[#749DD0] text-white shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          </div>
        )}

        {/* Still Need Help */}
        <div className="mt-16">
          <Card className="bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#749DD0] border-0 overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <Waves className="absolute bottom-4 right-8 h-24 w-24 text-white/10" />
            </div>
            
            <CardContent className="relative p-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Still have questions?
                </h3>
                <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
                  Can't find what you're looking for? Our beach vacation experts are here to help you 
                  plan the perfect coastal getaway. Reach out and we'll respond within 2 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button 
                      size="lg" 
                      className="bg-white text-[#33343B] hover:bg-[#CFE7F8] px-8 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 backdrop-blur-sm"
                    onClick={() => window.open('tel:+254116072343')}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call: +254 116 072 343
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
