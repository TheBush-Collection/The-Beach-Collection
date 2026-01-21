import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import { useBackendBookings } from '@/hooks/useBackendBookings';

interface Package {
  name: string;
  destinations?: string[];
  location?: string;
  price: number;
  rating: number;
  duration: string;
  groupSize: string;
  category?: string;
  featured?: boolean;
  highlights?: string[];
  includes?: string[];
  description?: string;
}

interface Property {
  id?: string;
  _id?: string;
  name: string;
  location: string;
  rating: number;
  numReviews?: number;
  reviews?: number;
  basePricePerNight?: number;
  price?: number;
  price_from?: number;
  featured?: boolean;
  rooms?: Array<{
    id?: string;
    _id?: string;
    name: string;
    type: string;
    price: number;
    available: boolean;
    maxGuests?: number;
    max_guests?: number;
  }>;
  images?: string[];
  description?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  packages?: Package[];
  properties?: Property[];
}

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get real data from backend hooks
  const { packages, loading: packagesLoading } = useBackendPackages();
  const { properties, loading: propertiesLoading } = useBackendProperties();
  const { bookings } = useBackendBookings();

  // Initialize messages when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: '1',
        text: "Hello! I'm your Safari Booking Assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          "Show me available packages",
          "Show me properties", 
          "Help with booking process",
          "What's included in packages?",
          "Cancellation policy"
        ]
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show loading state when data is being fetched
  const isDataLoading = packagesLoading || propertiesLoading;

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();

    let response = "";
    let suggestions: string[] = [];
    let responsePackages: Package[] = [];
    let responseProperties: Property[] = [];

    console.log('Generating response for:', lowerMessage);
    console.log('Properties available:', properties.length);
    console.log('Packages available:', packages.length);

    // Show loading state when data is being fetched
    if (isDataLoading) {
      response = "I'm loading our latest safari packages and properties from our database. Please give me a moment...";
      suggestions = ["Wait a moment", "Contact support"];
    } else if (lowerMessage.includes('all') && lowerMessage.includes('package')) {
      if (packages.length > 0) {
        response = `Here are all our safari packages:\n\n${packages.map(pkg => 
          `🦁 **${pkg.name}**\n📍 ${pkg.destinations?.join(', ') || pkg.location}\n💰 $${pkg.price} per person\n⭐ ${pkg.rating}/5\n🕒 ${pkg.duration}\n\n`
        ).join('')}`;
        responsePackages = packages;
        suggestions = ["Book a package", "Package details", "Compare packages", "Contact support"];
      } else {
        response = "I'm still loading all our packages. Please try again in a moment.";
        suggestions = ["Try again", "Show properties", "Contact support"];
      }
    } else if ((lowerMessage.includes('all') && lowerMessage.includes('property')) || 
              lowerMessage.includes('show me properties') || 
              lowerMessage.includes('list properties')) {
      if (properties.length > 0) {
        response = `Here are our properties:\n\n${properties.map(prop => 
          `🏨 **${prop.name}**\n📍 ${prop.location || 'Location not specified'}\n${prop.rating ? `⭐ ${prop.rating}/5\n` : ''}${prop.rooms?.length ? `🛏️ ${prop.rooms.length} room types available\n` : ''}\n`
        ).join('')}`;
        responseProperties = properties;
        suggestions = ["Book a property", "Show me packages", "Contact support"];
      } else {
        response = "I'm having trouble loading our properties right now. Please try again in a moment or contact our support team for assistance.";
        suggestions = ["Try again", "Contact support"];
        console.error('No properties available to display');
      }
    } else if (lowerMessage.includes('package') || lowerMessage.includes('safari') || lowerMessage.includes('tour')) {
      if (packages.length > 0) {
        response = `Here are our available safari packages:\n\n${packages.slice(0, 3).map(pkg => 
          `🦁 **${pkg.name}**\n📍 ${pkg.destinations?.join(', ') || pkg.location}\n💰 $${pkg.price} per person\n⭐ ${pkg.rating}/5 rating\n🕒 ${pkg.duration}\n👥 ${pkg.groupSize}\n\n`
        ).join('')}Would you like to see more details about any of these packages?`;
        responsePackages = packages.slice(0, 3);
        suggestions = ["View all packages", "Book a package", "Package pricing", "What's included?"];
      } else {
        response = "I'm loading our safari packages for you. Please wait a moment...";
        suggestions = ["Try again", "Show properties", "Contact support"];
      }
    } else if (lowerMessage.includes('property') || 
              lowerMessage.includes('hotel') || 
              lowerMessage.includes('lodge') || 
              lowerMessage.includes('accommodation') ||
              lowerMessage.includes('where to stay')) {
      if (properties.length > 0) {
        const featuredProperties = properties.filter(p => p.featured).slice(0, 3);
        const displayProperties = featuredProperties.length > 0 ? featuredProperties : properties.slice(0, 3);
        
        response = `Here are some of our properties you might like:\n\n${displayProperties.map(prop => 
          `🏨 **${prop.name}**\n📍 ${prop.location || 'Location not specified'}\n${prop.rating ? `⭐ ${prop.rating}/5\n` : ''}${prop.rooms?.length ? `🛏️ ${prop.rooms.length} room types available\n` : ''}\n`
        ).join('')}Would you like to see more details or book any of these properties?`;
        
        responseProperties = displayProperties;
        suggestions = ["View all properties", "Book now", "Show me packages"];
      } else {
        response = "I'm having trouble loading our properties right now. You can check our website or contact our support team for more information.";
        suggestions = ["Contact support", "Visit website"];
      }
    } else if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
      // Check for recent bookings to provide personalized response
      const recentBookings = bookings.filter(booking =>
        new Date(booking.check_in) > new Date()
      ).slice(0, 3);

      if (recentBookings.length > 0) {
        response = `I see you have upcoming bookings! Here are your recent reservations:\n\n${recentBookings.map(booking =>
          `📅 **${booking.property_name || booking.safari_properties?.name || 'Property'}**\n🏨 ${booking.room_name || 'Room'}\n📆 Check-in: ${new Date(booking.check_in).toLocaleDateString()}\n📆 Check-out: ${new Date(booking.check_out).toLocaleDateString()}\n👥 ${(booking.adults || 0) + (booking.children || 0)} guests\n💰 $${booking.total_amount}\n\n`
        ).join('')}Would you like help with any of these bookings or want to make a new reservation?`;
        suggestions = ["Modify booking", "Add special requests", "Book new property", "Contact support"];
      } else {
        response = "I'd be happy to help you with booking! You can browse our properties and packages, select your dates, and complete your reservation. Would you like me to guide you through the process?";
        suggestions = ["Show me packages", "Show me properties", "Help with dates", "Payment options"];
      }
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      const packagePrices = packages.length > 0 ? packages.slice(0, 3).map(pkg => `${pkg.name}: $${pkg.price}`).join('\n') : '';
      const propertyPrices = properties.length > 0 ? properties.slice(0, 3).map(prop =>
        `${prop.name}: From $${prop.basePricePerNight || 'Contact for pricing'}`
      ).join('\n') : '';

      response = `Here are our current prices:\n\n**Safari Packages:**\n${packagePrices || 'Loading prices...'}\n\n**Properties:**\n${propertyPrices || 'Loading properties...'}\n\nAll prices include taxes and basic amenities. Prices may vary by season and availability.`;
      suggestions = ["View package details", "Property prices", "What's included?", "Discounts available?"];
    } else if (lowerMessage.includes('availability') || lowerMessage.includes('available')) {
      const availableProperties = properties.filter(prop =>
        prop.rooms?.some(room => room.available)
      ).slice(0, 3);

      if (availableProperties.length > 0) {
        response = `Great! Here are our currently available properties:\n\n${availableProperties.map(prop =>
          `🏨 **${prop.name}**\n📍 ${prop.location}\n⭐ ${prop.rating}/5\n🛏️ Available rooms: ${prop.rooms?.filter(room => room.available).length || 'Contact for details'}\n💰 From $${prop.basePricePerNight || 'Contact for pricing'}\n\n`
        ).join('')}Would you like to check specific dates or book any of these?`;
        suggestions = ["Check dates", "Book now", "View all available", "Room details"];
      } else {
        response = "I'm checking availability for you. Our team updates availability in real-time. Would you like me to check specific dates or properties?";
        suggestions = ["Check specific dates", "Show all properties", "Contact support"];
      }
    } else if (lowerMessage.includes('zone') || lowerMessage.includes('area') || lowerMessage.includes('location')) {
      const locations = [...new Set(properties.map(prop => prop.location).filter(Boolean))];

      if (locations.length > 0) {
        response = `We operate in several amazing locations:\n\n${locations.map(location =>
          `🌍 **${location}**\n📊 ${properties.filter(prop => prop.location === location).length} properties available\n\n`
        ).join('')}Each location offers unique wildlife experiences and accommodations. Which area interests you most?`;
        suggestions = locations.map(location => `Tell me about ${location}`).concat(["Show all locations", "Compare locations"]);
      } else {
        response = "We offer safari experiences across multiple regions in Africa. Would you like to explore our packages or properties to see available destinations?";
        suggestions = ["Show destinations", "Browse packages", "Property locations"];
      }
    } else if (lowerMessage.includes('featured') || lowerMessage.includes('popular') || lowerMessage.includes('best')) {
      const featuredPackages = packages.filter(pkg => pkg.featured).slice(0, 3);
      const featuredProperties = properties.filter(prop => prop.featured).slice(0, 3);

      if (featuredPackages.length > 0 || featuredProperties.length > 0) {
        let featuredResponse = "Here are our most popular options:\n\n";

        if (featuredPackages.length > 0) {
          featuredResponse += "**🌟 Featured Safari Packages:**\n";
          featuredResponse += featuredPackages.map(pkg =>
            `🦁 **${pkg.name}**\n⭐ ${pkg.rating}/5 (${pkg.reviews} reviews)\n💰 $${pkg.price} per person\n📍 ${pkg.destinations?.join(', ') || pkg.location}\n\n`
          ).join('');
        }

        if (featuredProperties.length > 0) {
          featuredResponse += "\n**🏨 Featured Properties:**\n";
          featuredResponse += featuredProperties.map(prop =>
            `🏨 **${prop.name}**\n⭐ ${prop.rating}/5 (${prop.reviews || prop.numReviews || 0} reviews)\n📍 ${prop.location}\n💰 From $${prop.basePricePerNight || 'Contact'}\n\n`
          ).join('');
        }

        response = featuredResponse + "These are our most highly-rated and popular options. Would you like more details on any of these?";
        suggestions = ["View details", "Compare options", "See all featured", "Book now"];
      } else {
        response = "We're updating our featured selections. Would you like to see all our available packages and properties instead?";
        suggestions = ["Show all packages", "Show all properties", "Browse by category"];
      }
    } else if (lowerMessage.includes('category') || lowerMessage.includes('type') || lowerMessage.includes('wildlife') || lowerMessage.includes('adventure') || lowerMessage.includes('luxury')) {
      const categories = [...new Set(packages.map(pkg => pkg.category).filter(Boolean))];

      if (categories.length > 0) {
        response = `We offer several safari categories:\n\n${categories.map(category =>
          `🦁 **${category}**\n📊 ${packages.filter(pkg => pkg.category === category).length} packages available\n\n`
        ).join('')}Each category offers unique experiences. Which type of safari interests you?`;
        suggestions = categories.map(cat => `Tell me about ${cat}`).concat(["Show all categories", "Compare types"]);
      } else {
        response = "We offer various safari experiences including wildlife viewing, adventure trips, and luxury getaways. Would you like to browse our packages to see what's available?";
        suggestions = ["Browse packages", "Show properties", "Adventure options"];
      }
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      response = "We offer free cancellation up to 24 hours before your check-in date. For cancellations within 24 hours, a 50% refund applies. Would you like help with a specific booking?";
      suggestions = ["Cancel my booking", "Modify reservation", "Contact support", "Refund policy"];
    } else if (lowerMessage.includes('cancel booking') || lowerMessage.includes('cancel reservation')) {
      response = "To cancel your booking, you'll need your Booking ID which you can find on your booking confirmation receipt or email. Once you have that, visit our cancellation page to submit your request.";
      suggestions = ["Submit cancellation request", "Show refund policy", "Modify instead", "Contact support"];
    } else if (lowerMessage.includes('yes, cancel booking') || lowerMessage.includes('cancel my booking')) {
      response = "To cancel your booking, please use the Booking ID from your confirmation receipt or email. You can find this on your booking confirmation page or in the email we sent you. Then visit our cancellation page to submit a formal request.";
      suggestions = ["Go to cancellation page", "Show cancellation policy", "Contact support"];
    } else if (lowerMessage.includes('go to dashboard') || lowerMessage.includes('dashboard')) {
      response = "For booking management, please use the Booking ID from your confirmation receipt. You can find this ID on your booking confirmation page, email, or receipt. Then visit our cancellation page to submit your request.";
      suggestions = ["Cancel booking", "View bookings", "Submit review", "Account settings"];
    } else if (lowerMessage.includes('refund policy') || lowerMessage.includes('cancellation policy')) {
      response = "Here's our detailed cancellation and refund policy:\n\n**🕐 Free Cancellation (24 hours)**\nCancel within 24 hours of booking for 100% refund\n\n**📅 Standard Cancellation (7+ days)**\nCancel 7+ days before check-in: 75% refund + $25 processing fee\n\n**⏰ Late Cancellation (2-7 days)**\nCancel 2-7 days before check-in: 50% refund + $50 processing fee\n\n**🚫 No Refund (Less than 48 hours)**\nCancel less than 48 hours before check-in: No refund\n\nTo submit a cancellation request, use your Booking ID from your receipt and visit our cancellation page.";
      suggestions = ["Submit cancellation request", "Contact support", "View my bookings"];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      response = "We accept all major credit cards, debit cards, and PayPal. Your payment is secure and encrypted. You'll receive a confirmation receipt immediately after payment.";
      suggestions = ["Payment methods", "Security info", "Receipt help", "Billing questions"];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      response = "You can reach our support team 24/7 at support@safaribook.com or call +1-800-SAFARI. For urgent matters, use the emergency contact in your booking confirmation.";
      suggestions = ["Email support", "Call support", "Emergency contact", "FAQ"];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! Welcome to Safari Bookings. I'm here to help you plan your perfect safari adventure. What would you like to know?";
      suggestions = ["Show me packages", "Show me properties", "Booking help", "Special offers"];
    } else if (lowerMessage.includes('thank')) {
      response = "You're very welcome! I'm always here to help. Is there anything else you'd like to know about your safari booking?";
      suggestions = ["More questions", "Show me packages", "Contact support", "Start booking"];
    } else {
      response = "I understand you're asking about that. Let me help you find the right information. You can browse our properties and packages, or I can assist with specific booking questions.";
      suggestions = ["Show me packages", "Show me properties", "Booking process", "Contact support"];
    }

    return {
      id: Date.now().toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date(),
      suggestions,
      packages: responsePackages,
      properties: responseProperties
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Clear all messages when closing
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
            1
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-80 shadow-xl border-0 ${isMinimized ? 'h-14' : 'h-96'} transition-all duration-300`}>
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-orange-500 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">Safari Assistant</CardTitle>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-white hover:bg-orange-600"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-white hover:bg-orange-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender === 'bot' && <Bot className="h-4 w-4 text-orange-500" />}
                        {message.sender === 'user' && <User className="h-4 w-4 text-blue-500" />}
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`rounded-lg p-3 text-sm whitespace-pre-line ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.text}
                      </div>
                      {message.suggestions && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs h-6 px-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-orange-500" />
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 text-sm"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}