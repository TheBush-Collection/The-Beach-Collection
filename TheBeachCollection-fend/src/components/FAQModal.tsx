import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';

interface FAQModalProps {
  trigger?: React.ReactNode;
}

export default function FAQModal({ trigger }: FAQModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      category: 'Booking & Planning',
      questions: [
        {
          question: 'How far in advance should I book?',
          answer: 'We recommend booking 3-6 months in advance, especially for peak season (July-October) and luxury accommodations. However, we can often accommodate last-minute bookings depending on availability.'
        },
        {
          question: 'What\'s included in the safari packages?',
          answer: 'Most packages include accommodation, meals, game drives, professional guides, park fees, and airport transfers. International flights are typically not included unless specified. We\'ll provide a detailed itinerary with inclusions upon booking.'
        },
        {
          question: 'Do you offer custom safari itineraries?',
          answer: 'Absolutely! We specialize in creating personalized safari experiences tailored to your interests, budget, and travel dates. Our experts will work with you to design the perfect adventure.'
        },
        {
          question: 'Can I combine multiple destinations?',
          answer: 'Yes! Many of our guests combine destinations like Kenya and Tanzania for the ultimate safari experience. We can arrange seamless transfers between countries and create multi-country itineraries.'
        }
      ]
    },
    {
      category: 'Travel Requirements',
      questions: [
        {
          question: 'Do I need a visa for East Africa?',
          answer: 'Visa requirements vary by nationality. Most visitors need a visa for Kenya and/or Tanzania. We recommend checking with your local embassy or using services like VisaHQ. We can provide invitation letters to support your visa application.'
        },
        {
          question: 'What vaccinations do I need?',
          answer: 'Yellow fever vaccination is required if you\'re traveling from a country with risk of yellow fever transmission. Other recommended vaccinations include hepatitis A, typhoid, and routine vaccines. Consult your doctor or a travel clinic for personalized advice.'
        },
        {
          question: 'What should I pack for a safari?',
          answer: 'Pack neutral-colored clothing (khaki, beige, green), comfortable walking shoes, sun protection (hat, sunscreen, sunglasses), insect repellent, binoculars, camera, medications, and lightweight layers for varying temperatures.'
        }
      ]
    },
    {
      category: 'During Your Safari',
      questions: [
        {
          question: 'What is a typical day on safari like?',
          answer: 'Days typically start early (around 6 AM) with coffee/tea and a light breakfast before morning game drives. After lunch and rest, afternoon drives continue until sunset. Evenings include dinner and relaxation around the campfire.'
        },
        {
          question: 'Will I see the Big Five?',
          answer: 'While we can\'t guarantee wildlife sightings (as animals are wild), our experienced guides know the best areas and times to maximize your chances. Most guests see lions, elephants, buffalo, leopard, and rhino during their safari.'
        },
        {
          question: 'What if I have dietary restrictions?',
          answer: 'We accommodate various dietary requirements including vegetarian, vegan, gluten-free, and allergies. Please inform us at the time of booking so we can make appropriate arrangements with our lodges and camps.'
        }
      ]
    },
    {
      category: 'Payments & Cancellations',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept bank transfers, major credit cards (Visa, MasterCard, American Express), and PayPal. Payment schedules vary by package, but typically require a 20-30% deposit to confirm booking.'
        },
        {
          question: 'What is your cancellation policy?',
          answer: 'Cancellation policies vary by season and accommodation type. Generally, cancellations made 60+ days before travel receive a full refund minus a small administrative fee. Please check your specific booking terms for details.'
        },
        {
          question: 'Is travel insurance required?',
          answer: 'While not mandatory, we strongly recommend comprehensive travel insurance covering trip cancellation, medical emergencies, and evacuation. We can recommend trusted insurance providers.'
        }
      ]
    },
    {
      category: 'Accommodations',
      questions: [
        {
          question: 'What types of accommodation do you offer?',
          answer: 'We partner with luxury lodges, tented camps, and boutique hotels. Options range from intimate bush camps to 5-star luxury resorts, all carefully selected for their location, service, and safari experience.'
        },
        {
          question: 'Are the accommodations safe?',
          answer: 'All our partner accommodations prioritize guest safety with 24/7 security, emergency procedures, and trained staff. Many properties are fenced and have night guards. Your guide will also provide safety briefings.'
        },
        {
          question: 'Do accommodations have WiFi and electricity?',
          answer: 'Most luxury lodges and camps offer WiFi (though connectivity can be limited in remote areas) and 24-hour electricity. Some bush camps may use solar power and have limited connectivity, perfect for a digital detox!'
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
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            View FAQ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <HelpCircle className="h-6 w-6 mr-2 text-orange-500" />
            Frequently Asked Questions
          </DialogTitle>
          <p className="text-gray-600">
            Find answers to common questions about planning and experiencing your safari adventure
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-orange-600">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:text-orange-600">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all categories
              </p>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Still have questions?
            </h3>
            <p className="text-orange-700 mb-4">
              Can't find what you're looking for? Our team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Contact Support
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                Call: +254 116 072 343
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
