
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClarificationChatProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ClarificationChat({ transactionId, isOpen, onClose, onComplete }: ClarificationChatProps) {
  const [messages, setMessages] = useState<{role: 'ai' | 'user', content: string}[]>([
    { role: 'ai', content: "I found a transaction for $125.50 but need some details:\n\n1. What category should this expense be under?\n2. Who is the merchant/seller?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // User message
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Mock AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI Response & Completion
    setMessages(prev => [...prev, { 
      role: 'ai', 
      content: "Great! I've categorized this as 'Shopping > Electronics' and set the contact to 'Amazon'. The transaction is now complete and ready for your approval." 
    }]);
    setIsTyping(false);

    // Auto-close and trigger completion
    setTimeout(() => {
      onComplete(); // Notify parent
    }, 2500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:w-[450px] p-0 flex flex-col gap-0 border-l border-border shadow-2xl">
        <SheetHeader className="p-4 border-b border-border bg-muted/30">
          <SheetTitle className="text-lg font-semibold text-foreground">Clarify Transaction</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">ID: {transactionId}</SheetDescription>
        </SheetHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-muted/5">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className={cn(
                  "w-8 h-8",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <AvatarFallback className="text-[10px]">
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-card border border-border text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <Avatar className="w-8 h-8 bg-muted text-muted-foreground">
                  <AvatarFallback className="text-[10px]">
                    <Bot size={14} />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer..."
              className="flex-1 rounded-lg bg-muted/20 border-input focus:bg-background h-10 px-4"
            />
            <Button 
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-lg h-10 w-10 shrink-0"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
