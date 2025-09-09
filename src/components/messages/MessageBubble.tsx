import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MessageWithSender, MessageAttachment } from '@/hooks/useMessages';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar: boolean;
  showSender: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  showSender,
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const downloadFile = async (attachment: MessageAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .download(attachment.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.file_type.startsWith('image/')) {
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(attachment.file_url);

      return (
        <div key={attachment.id} className="mt-2">
          <img
            src={publicUrl}
            alt={attachment.file_name}
            className="max-w-xs max-h-64 rounded-lg cursor-pointer"
            onClick={() => window.open(publicUrl, '_blank')}
          />
        </div>
      );
    }

    return (
      <div
        key={attachment.id}
        className="mt-2 p-3 border rounded-lg bg-background/50 flex items-center gap-2 max-w-xs"
      >
        {getFileIcon(attachment.file_type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(attachment.file_size / 1024)}KB
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadFile(attachment)}
          className="flex-shrink-0"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'User'} 
              />
              <AvatarFallback className="text-xs">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {showSender && !isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1 px-3">
            {message.sender?.display_name || 'Utilisateur'}
          </span>
        )}
        
        <div
          className={`
            px-3 py-2 rounded-2xl break-words
            ${isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
            }
          `}
        >
          {message.content && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.attachments?.map(renderAttachment)}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-3">
          {formatTime(message.created_at)}
        </span>
      </div>

      {isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.display_name || 'You'} 
              />
              <AvatarFallback className="text-xs">
                {message.sender?.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}
    </div>
  );
}