import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Palette } from "lucide-react";
import { EmailBlockData } from './EmailDragDropEditor';

export type EmailBlockType = 
  | 'title' 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'separator' 
  | 'logo' 
  | 'variable';

interface EmailBlockProps {
  block: EmailBlockData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<EmailBlockData>) => void;
  variables?: string[];
}

export const EmailBlock: React.FC<EmailBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onUpdate,
  variables = []
}) => {
  const [showProperties, setShowProperties] = useState(false);

  const renderBlockContent = () => {
    switch (block.type) {
      case 'title':
        return (
          <div 
            className="cursor-pointer"
            onClick={onSelect}
            style={{
              color: block.properties.color || '#333',
              textAlign: block.properties.align || 'left'
            }}
          >
            {React.createElement(
              `h${block.properties.level || 1}`,
              { className: "m-0" },
              block.content
            )}
          </div>
        );

      case 'text':
        return (
          <div 
            className="cursor-pointer"
            onClick={onSelect}
            style={{
              color: block.properties.color || '#333',
              textAlign: block.properties.align || 'left',
              fontSize: block.properties.fontSize || '14px'
            }}
          >
            <p className="m-0 leading-relaxed">{block.content}</p>
          </div>
        );

      case 'image':
        return (
          <div 
            className="cursor-pointer"
            onClick={onSelect}
            style={{ textAlign: block.properties.align || 'center' }}
          >
            <img 
              src={block.content} 
              alt={block.properties.alt || ''} 
              className="max-w-full h-auto rounded"
              style={{ maxHeight: '200px' }}
            />
          </div>
        );

      case 'button':
        return (
          <div 
            className="cursor-pointer"
            onClick={onSelect}
            style={{ textAlign: block.properties.align || 'center' }}
          >
            <div
              className="inline-block px-6 py-3 rounded font-medium"
              style={{
                backgroundColor: block.properties.backgroundColor || '#007bff',
                color: block.properties.textColor || '#ffffff',
                borderRadius: block.properties.borderRadius || '4px'
              }}
            >
              {block.content}
            </div>
          </div>
        );

      case 'separator':
        return (
          <div className="cursor-pointer py-4" onClick={onSelect}>
            <hr 
              className="border-0 h-px"
              style={{ 
                backgroundColor: block.properties.color || '#e0e0e0',
                margin: '0'
              }} 
            />
          </div>
        );

      case 'logo':
        return (
          <div 
            className="cursor-pointer"
            onClick={onSelect}
            style={{ textAlign: block.properties.align || 'center' }}
          >
            <img 
              src={block.content} 
              alt="Logo" 
              className="h-auto"
              style={{ maxWidth: block.properties.maxWidth || '150px' }}
            />
          </div>
        );

      case 'variable':
        return (
          <div className="cursor-pointer" onClick={onSelect}>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-mono text-sm">
              {`{{${block.content}}}`}
            </span>
          </div>
        );

      default:
        return <div>Bloc inconnu</div>;
    }
  };

  const renderProperties = () => {
    switch (block.type) {
      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label>Contenu</Label>
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Texte du titre"
              />
            </div>
            <div>
              <Label>Niveau</Label>
              <Select
                value={block.properties.level?.toString() || '1'}
                onValueChange={(value) => onUpdate({ properties: { ...block.properties, level: parseInt(value) } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Couleur</Label>
              <Input
                type="color"
                value={block.properties.color || '#333333'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, color: e.target.value } })}
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.properties.align || 'left'}
                onValueChange={(value) => onUpdate({ properties: { ...block.properties, align: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Contenu</Label>
              <Textarea
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Texte du paragraphe"
                rows={3}
              />
            </div>
            <div>
              <Label>Couleur</Label>
              <Input
                type="color"
                value={block.properties.color || '#333333'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, color: e.target.value } })}
              />
            </div>
            <div>
              <Label>Taille</Label>
              <Input
                value={block.properties.fontSize || '14px'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, fontSize: e.target.value } })}
                placeholder="14px"
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.properties.align || 'left'}
                onValueChange={(value) => onUpdate({ properties: { ...block.properties, align: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL de l'image</Label>
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Texte alternatif</Label>
              <Input
                value={block.properties.alt || ''}
                onChange={(e) => onUpdate({ properties: { ...block.properties, alt: e.target.value } })}
                placeholder="Description de l'image"
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.properties.align || 'center'}
                onValueChange={(value) => onUpdate({ properties: { ...block.properties, align: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texte du bouton</Label>
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Cliquez ici"
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={block.properties.url || ''}
                onChange={(e) => onUpdate({ properties: { ...block.properties, url: e.target.value } })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Couleur de fond</Label>
              <Input
                type="color"
                value={block.properties.backgroundColor || '#007bff'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, backgroundColor: e.target.value } })}
              />
            </div>
            <div>
              <Label>Couleur du texte</Label>
              <Input
                type="color"
                value={block.properties.textColor || '#ffffff'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, textColor: e.target.value } })}
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.properties.align || 'center'}
                onValueChange={(value) => onUpdate({ properties: { ...block.properties, align: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'separator':
        return (
          <div className="space-y-4">
            <div>
              <Label>Couleur</Label>
              <Input
                type="color"
                value={block.properties.color || '#e0e0e0'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, color: e.target.value } })}
              />
            </div>
          </div>
        );

      case 'logo':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL du logo</Label>
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Largeur max</Label>
              <Input
                value={block.properties.maxWidth || '150px'}
                onChange={(e) => onUpdate({ properties: { ...block.properties, maxWidth: e.target.value } })}
                placeholder="150px"
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.properties.align || 'center'}
                onValueChange={(value) => onUpdate({ properties: { ...block.properties, align: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'variable':
        return (
          <div className="space-y-4">
            <div>
              <Label>Variable</Label>
              <Select
                value={block.content}
                onValueChange={(value) => onUpdate({ content: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variables.map(variable => (
                    <SelectItem key={variable} value={variable}>
                      {variable}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`p-4 transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <div className="relative">
        {renderBlockContent()}
        
        {isSelected && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Popover open={showProperties} onOpenChange={setShowProperties}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Propriétés du bloc</h4>
                  {renderProperties()}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </Card>
  );
};