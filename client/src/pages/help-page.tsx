import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen, HelpCircle, Headphones } from "lucide-react";
import { useLocation } from "wouter";

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const faqs = [
    {
      id: "faq-1",
      question: "How do I create a playlist?",
      answer: "To create a playlist, navigate to the \"Pick 'N' Play\" section and select songs you want to include. Click the \"Add to Playlist\" button and choose either an existing playlist or create a new one. You can then manage your playlists from the dashboard."
    },
    {
      id: "faq-2",
      question: "How do I schedule music for different times?",
      answer: "Use the \"Time Slot\" feature on the dashboard. Select the playlists you want to play at different times of the day, and set up a schedule. You can create multiple time slots for different days of the week and assign different playlists to each slot."
    },
    {
      id: "faq-3",
      question: "What file formats are supported for jingles?",
      answer: "We support MP3, WAV, and AAC file formats for jingles and voiceovers. The maximum file size is 10MB per upload. For optimal quality, we recommend using MP3 files with a bitrate of at least 192kbps."
    },
    {
      id: "faq-4",
      question: "How long does jingle approval take?",
      answer: "Jingle approvals typically take 1-2 business days. Our team reviews all uploads to ensure they meet our content guidelines and quality standards. You'll receive a notification once your jingle has been approved or if there are any issues that need to be addressed."
    },
    {
      id: "faq-5",
      question: "Can I customize when jingles are played?",
      answer: "Yes, when uploading a jingle you can set specific start and end dates, as well as repeat settings. This allows you to schedule jingles for special promotions, events, or specific times of the day or week."
    },
    {
      id: "faq-6",
      question: "How do I request a custom jingle or voiceover?",
      answer: "Navigate to the \"Request Jingle / Voice over\" section and click on the \"New Request\" button. Fill out the form with details about what you need, including style, purpose, and any script ideas you have. Our team will review your request and get back to you with pricing and timeline information."
    }
  ];
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Help Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium mb-2">Online Guide</h2>
            <p className="text-gray-600 mb-4">Find comprehensive guides and documentation to help you start working with our platform.</p>
            <Button variant="link" className="text-primary p-0 h-auto flex items-center" onClick={() => setLocation('/online-guide')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <HelpCircle className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium mb-2">FAQs</h2>
            <p className="text-gray-600 mb-4">Get quick answers to the most commonly asked questions about our services.</p>
            <Button variant="link" className="text-primary p-0 h-auto flex items-center" onClick={() => document.getElementById('faqs-section')?.scrollIntoView({ behavior: 'smooth' })}>
              View FAQs <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Headphones className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium mb-2">Support</h2>
            <p className="text-gray-600 mb-4">Can't find what you're looking for? Contact our support team for assistance.</p>
            <Button variant="link" className="text-primary p-0 h-auto flex items-center" onClick={() => setLocation('/contact')}>
              Contact support <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div id="faqs-section">
        <h2 className="text-xl font-medium mb-4">Popular Topics</h2>
        
        <Card>
          <Accordion type="single" collapsible value={expandedFaq || undefined} onValueChange={(value) => setExpandedFaq(value)}>
            {faqs.map((faq) => (
              <AccordionItem value={faq.id} key={faq.id}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                  <h3 className="text-lg font-medium text-left">{faq.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-gray-50">
                  <p className="text-gray-600">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-medium mb-4">Need More Help?</h2>
        <p className="text-gray-600 mb-4">If you can't find the answer to your question, our support team is here to help.</p>
        <Button onClick={() => setLocation('/contact')}>
          Contact Support
        </Button>
      </div>
    </DashboardLayout>
  );
}
