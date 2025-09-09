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
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onArchiveConversation,
  onUnarchiveConversation,
  onPinConversation,
  onUnpinConversation,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    !searchTerm || 
    conv.peer_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate conversations into categories
  const pinnedConversations = filteredConversations.filter(conv => conv.is_pinned && !conv.is_archived);
  const recentConversations = filteredConversations.filter(conv => !conv.is_pinned && !conv.is_archived);
  const archivedConversations = filteredConversations.filter(conv => conv.is_archived);

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Pinned Conversations */}
          {pinnedConversations.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                Épinglées
              </div>
              {pinnedConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={conversation.id === selectedConversationId}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onPin={() => onUnpinConversation(conversation.id)}
                  onArchive={() => onArchiveConversation(conversation.id)}
                  isPinned={true}
                />
              ))}
            </div>
          )}

          {/* Recent Conversations */}
          {recentConversations.length > 0 && (
            <div className="mb-4">
              {pinnedConversations.length > 0 && (
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                  Récentes
                </div>
              )}
              {recentConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={conversation.id === selectedConversationId}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onPin={() => onPinConversation(conversation.id)}
                  onArchive={() => onArchiveConversation(conversation.id)}
                  isPinned={false}
                />
              ))}
            </div>
          )}

          {/* Archived Conversations */}
          {archivedConversations.length > 0 && (
            <Collapsible open={showArchived} onOpenChange={setShowArchived}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Archivées ({archivedConversations.length})
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showArchived ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {archivedConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={conversation.id === selectedConversationId}
                    onSelect={() => onSelectConversation(conversation.id)}
                    onPin={() => onPinConversation(conversation.id)}
                    onArchive={() => onUnarchiveConversation(conversation.id)}
                    isPinned={conversation.is_pinned}
                    isArchived={true}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Empty State */}
          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune conversation trouvée</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}