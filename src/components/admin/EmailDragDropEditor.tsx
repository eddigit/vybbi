import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Eye, Code, Settings } from "lucide-react";
import { EmailBlockPalette } from './EmailBlockPalette';
import { EmailBlock, EmailBlockType } from './EmailBlock';

export interface EmailBlockData {
  id: string;
  type: EmailBlockType;
  content: string;
  properties: Record<string, any>;
}

interface EmailDragDropEditorProps {
  initialBlocks?: EmailBlockData[];
  onBlocksChange: (blocks: EmailBlockData[]) => void;
  onHtmlChange: (html: string) => void;
  variables?: string[];
}

export const EmailDragDropEditor: React.FC<EmailDragDropEditorProps> = ({
  initialBlocks = [],
  onBlocksChange,
  onHtmlChange,
  variables = []
}) => {
  const [blocks, setBlocks] = useState<EmailBlockData[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'code'>('builder');

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // If dropping from palette to canvas
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const blockType = result.draggableId as EmailBlockType;
      const newBlock: EmailBlockData = {
        id: `block-${Date.now()}`,
        type: blockType,
        content: getDefaultContent(blockType),
        properties: getDefaultProperties(blockType)
      };

      const newBlocks = [...blocks];
      newBlocks.splice(destination.index, 0, newBlock);
      setBlocks(newBlocks);
      onBlocksChange(newBlocks);
      updateHtml(newBlocks);
    }
    // If reordering blocks in canvas
    else if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      const newBlocks = Array.from(blocks);
      const [reorderedItem] = newBlocks.splice(source.index, 1);
      newBlocks.splice(destination.index, 0, reorderedItem);
      setBlocks(newBlocks);
      onBlocksChange(newBlocks);
      updateHtml(newBlocks);
    }
  }, [blocks, onBlocksChange]);

  const updateBlock = useCallback((id: string, updates: Partial<EmailBlockData>) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
    onBlocksChange(newBlocks);
    updateHtml(newBlocks);
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks);
    onBlocksChange(newBlocks);
    updateHtml(newBlocks);
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [blocks, onBlocksChange, selectedBlockId]);

  const updateHtml = useCallback((currentBlocks: EmailBlockData[]) => {
    const html = generateEmailHtml(currentBlocks);
    onHtmlChange(html);
  }, [onHtmlChange]);

  const generateEmailHtml = (currentBlocks: EmailBlockData[]): string => {
    const blocksHtml = currentBlocks.map(block => {
      switch (block.type) {
        case 'title':
          return `<h${block.properties.level || 1} style="color: ${block.properties.color || '#333'}; text-align: ${block.properties.align || 'left'}; font-family: Arial, sans-serif; margin: 20px 0;">${block.content}</h${block.properties.level || 1}>`;
        case 'text':
          return `<p style="color: ${block.properties.color || '#333'}; text-align: ${block.properties.align || 'left'}; font-family: Arial, sans-serif; font-size: ${block.properties.fontSize || '14px'}; line-height: 1.5; margin: 15px 0;">${block.content}</p>`;
        case 'image':
          return `<img src="${block.content}" alt="${block.properties.alt || ''}" style="max-width: 100%; height: auto; display: block; margin: 20px ${block.properties.align === 'center' ? 'auto' : '0'};" />`;
        case 'button':
          return `<div style="text-align: ${block.properties.align || 'center'}; margin: 25px 0;"><a href="${block.properties.url || '#'}" style="display: inline-block; padding: ${block.properties.padding || '12px 24px'}; background-color: ${block.properties.backgroundColor || '#007bff'}; color: ${block.properties.textColor || '#ffffff'}; text-decoration: none; border-radius: ${block.properties.borderRadius || '4px'}; font-family: Arial, sans-serif; font-weight: bold;">${block.content}</a></div>`;
        case 'separator':
          return `<hr style="border: none; height: 1px; background-color: ${block.properties.color || '#e0e0e0'}; margin: ${block.properties.margin || '30px 0'};" />`;
        case 'logo':
          return `<div style="text-align: ${block.properties.align || 'center'}; margin: 30px 0;"><img src="${block.content}" alt="Logo" style="max-width: ${block.properties.maxWidth || '150px'}; height: auto;" /></div>`;
        case 'variable':
          return `<span style="background-color: #f0f8ff; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #0066cc;">{{${block.content}}}</span>`;
        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;">
    ${blocksHtml}
  </div>
</body>
</html>`;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full">
        {/* Palette */}
        <div className="w-64 bg-muted/30 border-r p-4">
          <h3 className="font-semibold mb-4">Blocs disponibles</h3>
          <EmailBlockPalette />
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="border-b bg-background px-4">
            <div className="flex space-x-4">
              {[
                { id: 'builder', label: 'Constructeur', icon: Settings },
                { id: 'preview', label: 'Aperçu', icon: Eye },
                { id: 'code', label: 'Code HTML', icon: Code }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {activeTab === 'builder' && (
              <Droppable droppableId="canvas">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-96 bg-background border-2 border-dashed rounded-lg p-4 ${
                      snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                    }`}
                  >
                    {blocks.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Glissez des blocs ici pour construire votre email</p>
                      </div>
                    ) : (
                      blocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-4 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                            >
                              <div className="relative group">
                                <EmailBlock
                                  block={block}
                                  isSelected={selectedBlockId === block.id}
                                  onSelect={() => setSelectedBlockId(block.id)}
                                  onUpdate={(updates) => updateBlock(block.id, updates)}
                                  variables={variables}
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteBlock(block.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}

            {activeTab === 'preview' && (
              <div className="bg-gray-100 p-8 rounded-lg">
                <div 
                  className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg"
                  dangerouslySetInnerHTML={{ __html: generateEmailHtml(blocks).split('<body')[1]?.split('</body>')[0]?.replace('style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">', '') || '' }}
                />
              </div>
            )}

            {activeTab === 'code' && (
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-auto max-h-96">
                  <code>{generateEmailHtml(blocks)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

function getDefaultContent(type: EmailBlockType): string {
  switch (type) {
    case 'title': return 'Nouveau titre';
    case 'text': return 'Nouveau paragraphe de texte...';
    case 'image': return 'https://via.placeholder.com/400x200';
    case 'button': return 'Cliquez ici';
    case 'separator': return '';
    case 'logo': return 'https://via.placeholder.com/150x50';
    case 'variable': return 'nom_variable';
    default: return '';
  }
}

function getDefaultProperties(type: EmailBlockType): Record<string, any> {
  switch (type) {
    case 'title': return { level: 1, color: '#333333', align: 'left' };
    case 'text': return { color: '#333333', align: 'left', fontSize: '14px' };
    case 'image': return { alt: '', align: 'center' };
    case 'button': return { url: '#', backgroundColor: '#007bff', textColor: '#ffffff', align: 'center', padding: '12px 24px', borderRadius: '4px' };
    case 'separator': return { color: '#e0e0e0', margin: '30px 0' };
    case 'logo': return { align: 'center', maxWidth: '150px' };
    case 'variable': return {};
    default: return {};
  }
}