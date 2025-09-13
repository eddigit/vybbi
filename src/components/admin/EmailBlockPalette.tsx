import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Card } from "@/components/ui/card";
import { 
  Type, 
  AlignLeft, 
  Image, 
  MousePointer, 
  Minus, 
  Crown,
  Code
} from "lucide-react";
import { EmailBlockType } from './EmailBlock';

const blockTypes: Array<{
  type: EmailBlockType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}> = [
  {
    type: 'title',
    label: 'Titre',
    icon: Type,
    description: 'Titres H1, H2, H3'
  },
  {
    type: 'text',
    label: 'Texte',
    icon: AlignLeft,
    description: 'Paragraphe de texte'
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    description: 'Image avec lien optionnel'
  },
  {
    type: 'button',
    label: 'Bouton',
    icon: MousePointer,
    description: 'Bouton avec lien'
  },
  {
    type: 'separator',
    label: 'Séparateur',
    icon: Minus,
    description: 'Ligne de séparation'
  },
  {
    type: 'logo',
    label: 'Logo',
    icon: Crown,
    description: 'Logo de l\'entreprise'
  },
  {
    type: 'variable',
    label: 'Variable',
    icon: Code,
    description: 'Variable dynamique'
  }
];

export const EmailBlockPalette: React.FC = () => {
  return (
    <Droppable droppableId="palette" isDropDisabled={true}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="space-y-2"
        >
          {blockTypes.map((blockType, index) => (
            <Draggable
              key={blockType.type}
              draggableId={blockType.type}
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                >
                  <Card className="p-3 cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-primary/20 hover:border-l-primary">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <blockType.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{blockType.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {blockType.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};