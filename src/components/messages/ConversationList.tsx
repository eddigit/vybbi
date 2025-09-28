import { useState } from 'react';
import { Search, ChevronDown, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ConversationWithDetails } from '@/hooks/useConversations';
import ConversationListItem from './ConversationListItem';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onArchiveConversation: (conversationId: string) => void;
  onUnarchiveConversation: (conversationId: string) => void;
  onPinConversation: (conversationId: string) => void;
  onUnpinConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onArchiveConversation,
  onUnarchiveConversation,
  onPinConversation,
  onUnpinConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    !searchTerm || 
    conv.peer_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Unified conversation list (pinned first, then others, archived separate)
  const activeConversations = filteredConversations.filter(conv => !conv.is_archived);
  const archivedConversations = filteredConversations.filter(conv => conv.is_archived);
  
  // Sort active conversations: pinned first, then by last message time
  const sortedActiveConversations = activeConversations.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
  });

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/30 border-muted"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Active Conversations */}
        {sortedActiveConversations.length > 0 ? (
          <div className="space-y-1 p-1">
            {sortedActiveConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onSelect={() => onSelectConversation(conversation.id)}
                onPin={() => conversation.is_pinned ? onUnpinConversation(conversation.id) : onPinConversation(conversation.id)}
                onArchive={() => onArchiveConversation(conversation.id)}
                onDelete={() => onDeleteConversation(conversation.id)}
                isPinned={conversation.is_pinned}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-sm">Aucune conversation</p>
            </div>
          </div>
        )}

        {/* Archived Conversations */}
        {archivedConversations.length > 0 && (
          <div className="border-t mt-4">
            <Collapsible open={showArchived} onOpenChange={setShowArchived}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-4 py-3 h-auto text-sm">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    <span>Archivées ({archivedConversations.length})</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showArchived ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 p-1">
                  {archivedConversations.map((conversation) => (
                    <ConversationListItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversationId}
                      onSelect={() => onSelectConversation(conversation.id)}
                      onPin={() => conversation.is_pinned ? onUnpinConversation(conversation.id) : onPinConversation(conversation.id)}
                      onArchive={() => onUnarchiveConversation(conversation.id)}
                      onDelete={() => onDeleteConversation(conversation.id)}
                      isPinned={conversation.is_pinned}
                      isArchived={true}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}