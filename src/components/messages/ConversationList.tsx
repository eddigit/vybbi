import { useState } from 'react';
import { Search, ChevronDown, Archive, Star, MessageCircle, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  const [activeTab, setActiveTab] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    !searchTerm || 
    conv.peer_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and archived conversations
  const activeConversations = filteredConversations.filter(conv => !conv.is_archived);
  const archivedConversations = filteredConversations.filter(conv => conv.is_archived);
  
  // Filter by tab
  const getFilteredActiveConversations = () => {
    switch (activeTab) {
      case 'priority':
        return activeConversations.filter(conv => conv.is_pinned);
      case 'unread':
        return activeConversations.filter(conv => conv.unread_count && conv.unread_count > 0);
      case 'contacts':
        return activeConversations.filter(conv => 
          conv.peer_profile_type === 'artist' || 
          conv.peer_profile_type === 'agent' || 
          conv.peer_profile_type === 'manager'
        );
      default:
        return activeConversations;
    }
  };

  // Sort conversations: pinned first, then by last message time
  const sortedActiveConversations = getFilteredActiveConversations().sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
  });

  // Count badges for tabs
  const unreadCount = activeConversations.filter(conv => conv.unread_count && conv.unread_count > 0).length;
  const priorityCount = activeConversations.filter(conv => conv.is_pinned).length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Messagerie</h1>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="all" className="text-xs px-2">
              <MessageCircle className="h-3 w-3 mr-1" />
              Toutes
            </TabsTrigger>
            <TabsTrigger value="priority" className="text-xs px-2">
              <Star className="h-3 w-3 mr-1" />
              Priorité
              {priorityCount > 0 && <Badge variant="secondary" className="ml-1 px-1 text-xs">{priorityCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs px-2">
              Non lues
              {unreadCount > 0 && <Badge variant="destructive" className="ml-1 px-1 text-xs">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs px-2">
              <Users className="h-3 w-3 mr-1" />
              Pros
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsContent value="all" className="mt-0 h-full">
            {/* All Conversations */}
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
          </TabsContent>

          <TabsContent value="priority" className="mt-0 h-full">
            {/* Priority Conversations */}
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
                <Star className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Aucune conversation prioritaire</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-0 h-full">
            {/* Unread Conversations */}
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
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Aucun message non lu</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="mt-0 h-full">
            {/* Professional Contacts */}
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
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Aucun contact professionnel</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

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