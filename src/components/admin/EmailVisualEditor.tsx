import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Edit3, Eye, Save, AlertCircle, Type, Palette, Bold, Italic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailVisualEditorProps {
  htmlContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isLoading?: boolean;
  templateType: string;
  variables: string[];
}

interface EditableElement {
  element: HTMLElement;
  originalContent: string;
  hasVariables: boolean;
}

export const EmailVisualEditor: React.FC<EmailVisualEditorProps> = ({
  htmlContent,
  onContentChange,
  onSave,
  isLoading = false,
  templateType,
  variables
}) => {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableElements, setEditableElements] = useState<EditableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Parse HTML content and identify editable zones
  const parseEditableElements = () => {
    if (!previewRef.current) return;

    const elements: EditableElement[] = [];
    const walker = document.createTreeWalker(
      previewRef.current,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as HTMLElement;
          // Look for text-containing elements (p, h1-h6, td, div, span, etc.)
          const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TD', 'TH', 'DIV', 'SPAN', 'A'];
          if (textTags.includes(element.tagName) && element.textContent?.trim()) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const element = node as HTMLElement;
      const content = element.textContent || '';
      const hasVariables = /\{\{\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\}\}/.test(content);
      
      // Only add elements that have meaningful text content
      if (content.trim().length > 0) {
        elements.push({
          element,
          originalContent: element.innerHTML,
          hasVariables
        });
      }
    }

    setEditableElements(elements);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    if (newEditMode) {
      // Entering edit mode
      setTimeout(() => {
        makeElementsEditable();
        addEditableIndicators();
      }, 100);
    } else {
      // Exiting edit mode
      removeEditableIndicators();
      makeElementsNonEditable();
      setSelectedElement(null);
      
      // Check for changes and update parent
      if (previewRef.current) {
        const newContent = previewRef.current.innerHTML;
        if (newContent !== htmlContent) {
          onContentChange(newContent);
          setHasUnsavedChanges(true);
          toast({
            title: "Modifications détectées",
            description: "N'oubliez pas de sauvegarder vos changements.",
          });
        }
      }
    }
  };

  // Make elements editable
  const makeElementsEditable = () => {
    editableElements.forEach(({ element }) => {
      element.contentEditable = 'true';
      element.style.cursor = 'text';
      element.style.minHeight = '1em';
      
      // Add event listeners
      element.addEventListener('focus', handleElementFocus);
      element.addEventListener('blur', handleElementBlur);
      element.addEventListener('input', handleElementInput);
    });
  };

  // Remove editable functionality
  const makeElementsNonEditable = () => {
    editableElements.forEach(({ element }) => {
      element.contentEditable = 'false';
      element.style.cursor = 'default';
      
      // Remove event listeners
      element.removeEventListener('focus', handleElementFocus);
      element.removeEventListener('blur', handleElementBlur);
      element.removeEventListener('input', handleElementInput);
    });
  };

  // Add visual indicators for editable elements
  const addEditableIndicators = () => {
    editableElements.forEach(({ element, hasVariables }) => {
      element.classList.add('vybbi-editable');
      if (hasVariables) {
        element.classList.add('vybbi-has-variables');
      }
    });
  };

  // Remove visual indicators
  const removeEditableIndicators = () => {
    editableElements.forEach(({ element }) => {
      element.classList.remove('vybbi-editable', 'vybbi-has-variables', 'vybbi-selected');
    });
  };

  // Handle element focus
  const handleElementFocus = (e: Event) => {
    const element = e.target as HTMLElement;
    setSelectedElement(element);
    element.classList.add('vybbi-selected');
  };

  // Handle element blur
  const handleElementBlur = (e: Event) => {
    const element = e.target as HTMLElement;
    element.classList.remove('vybbi-selected');
    setSelectedElement(null);
  };

  // Handle element input changes
  const handleElementInput = (e: Event) => {
    const element = e.target as HTMLElement;
    
    // Protect variables from being accidentally deleted
    const content = element.innerHTML;
    const protectedContent = protectVariables(content);
    
    if (protectedContent !== content) {
      element.innerHTML = protectedContent;
      // Restore cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    setHasUnsavedChanges(true);
  };

  // Protect variables from accidental deletion/modification
  const protectVariables = (content: string): string => {
    // Find all variables and wrap them in protected spans
    return content.replace(
      /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g,
      '<span class="vybbi-variable" contenteditable="false">{{$1}}</span>'
    );
  };

  // Format selected text
  const formatText = (command: string, value?: string) => {
    if (!selectedElement) {
      toast({
        variant: "destructive",
        title: "Aucun élément sélectionné",
        description: "Sélectionnez d'abord un élément de texte à formater.",
      });
      return;
    }

    document.execCommand(command, false, value);
    setHasUnsavedChanges(true);
  };

  // Initialize on mount
  useEffect(() => {
    if (previewRef.current && htmlContent) {
      previewRef.current.innerHTML = htmlContent;
      setTimeout(() => {
        parseEditableElements();
      }, 100);
    }
  }, [htmlContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isEditMode) {
        removeEditableIndicators();
        makeElementsNonEditable();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-mode"
                  checked={isEditMode}
                  onCheckedChange={toggleEditMode}
                />
                <Label htmlFor="edit-mode" className="flex items-center gap-2">
                  {isEditMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isEditMode ? 'Mode Édition' : 'Mode Aperçu'}
                </Label>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 border-l pl-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => formatText('bold')}
                    disabled={!selectedElement}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => formatText('italic')}
                    disabled={!selectedElement}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Modifications non sauvegardées
                </Badge>
              )}
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {isEditMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Édition activé:</strong> Cliquez sur les textes pour les modifier directement. 
            Les variables <Badge variant="secondary" className="mx-1">{"{{variable}}"}</Badge> sont protégées contre la suppression accidentelle.
          </AlertDescription>
        </Alert>
      )}

      {/* Variables disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Variables disponibles pour ce type de template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" title="Cliquer pour copier">
                {`{{${variable}}}`}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-card">
            <div
              ref={previewRef}
              className="email-preview"
              style={{ 
                minHeight: '400px',
                fontFamily: 'Arial, sans-serif'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS for editor indicators */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .vybbi-editable {
            outline: 2px dashed transparent !important;
            transition: all 0.2s ease !important;
          }
          
          .vybbi-editable:hover {
            outline: 2px dashed #3b82f6 !important;
            background-color: rgba(59, 130, 246, 0.05) !important;
          }
          
          .vybbi-selected {
            outline: 2px solid #3b82f6 !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
          }
          
          .vybbi-has-variables {
            position: relative;
          }
          
          .vybbi-has-variables::before {
            content: '🔧';
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 12px;
            background: #f59e0b;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
          }
          
          .vybbi-variable {
            background: #fef3c7 !important;
            color: #92400e !important;
            padding: 1px 4px !important;
            border-radius: 3px !important;
            font-weight: bold !important;
            user-select: none !important;
          }
          
          .email-preview * {
            max-width: 100% !important;
          }
        `
      }} />
    </div>
  );
};