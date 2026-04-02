'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ContentBlock, TabItem } from './content-blocks';
import ContentBlockEditor from './ContentBlockEditor';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FiTrash2, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface TabBlockEditorProps {
  block: ContentBlock & { type: 'tabs'; tabs: TabItem[] };
  onChange: (updatedTabs: TabItem[], pendingUploads?: any[], pendingDeletions?: any[]) => void;
}

export default function TabBlockEditor({
  block,
  onChange,
}: TabBlockEditorProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    block.defaultTab || block.tabs[0]?.id || ''
  );
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [tabs, setTabs] = useState<TabItem[]>(block.tabs);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleAddTab = () => {
    const newTab: TabItem = {
      id: uuidv4(),
      label: `Tab ${tabs.length + 1}`,
      contentBlocks: [],
    };
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTabId(newTab.id);
    onChange(updatedTabs);
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabs.length === 1) {
      alert('You must have at least one tab');
      return;
    }
    if (confirm('Are you sure you want to delete this tab and all its content?')) {
      const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(updatedTabs);
      if (activeTabId === tabId) {
        setActiveTabId(updatedTabs[0]?.id || '');
      }
      onChange(updatedTabs);
    }
  };

  const handleStartRename = (tabId: string, currentLabel: string) => {
    setEditingTabId(tabId);
    setEditingLabel(currentLabel);
  };

  const handleSaveRename = (tabId: string) => {
    if (editingLabel.trim()) {
      const updatedTabs = tabs.map((tab) =>
        tab.id === tabId ? { ...tab, label: editingLabel.trim() } : tab
      );
      setTabs(updatedTabs);
      setEditingTabId(null);
      onChange(updatedTabs);
    }
  };

  const handleMoveTab = (tabId: string, direction: 'up' | 'down') => {
    const currentIndex = tabs.findIndex((t) => t.id === tabId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= tabs.length) return;

    const updatedTabs = [...tabs];
    [updatedTabs[currentIndex], updatedTabs[newIndex]] = [
      updatedTabs[newIndex],
      updatedTabs[currentIndex],
    ];
    setTabs(updatedTabs);
    onChange(updatedTabs);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || source.index === destination.index) {
      return;
    }

    const updatedTabs = [...tabs];
    const [movedTab] = updatedTabs.splice(source.index, 1);
    updatedTabs.splice(destination.index, 0, movedTab);

    setTabs(updatedTabs);
    onChange(updatedTabs);
  };

  const handleContentBlocksChange = (
    newBlocks: ContentBlock[],
    changes?: any
  ) => {
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTabId ? { ...tab, contentBlocks: newBlocks } : tab
    );
    setTabs(updatedTabs);

    // Pass changes from nested editor to parent
    onChange(updatedTabs, changes?.pendingUploads || [], changes?.pendingDeletions || []);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Tabs Editor</h3>

        {/* Tab List with Drag-and-Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tabs-list" type="TAB">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'space-y-2 p-2 rounded border',
                  snapshot.isDraggingOver ? 'bg-accent' : 'bg-background'
                )}
              >
                {tabs.map((tab, index) => (
                  <Draggable key={tab.id} draggableId={tab.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded border',
                          snapshot.isDragging
                            ? 'bg-primary/10 border-primary'
                            : 'bg-background border-border',
                          activeTabId === tab.id && 'ring-2 ring-primary'
                        )}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                          title="Drag to reorder tabs"
                        >
                          ⋮⋮
                        </div>

                        {/* Tab Label */}
                        <div className="flex-1 min-w-0">
                          {editingTabId === tab.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value)}
                                placeholder="Tab name"
                                className="text-sm"
                                autoFocus
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveRename(tab.id)}
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTabId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTabId(tab.id)}
                              onDoubleClick={() =>
                                handleStartRename(tab.id, tab.label)
                              }
                              className="text-sm font-medium text-left hover:underline truncate"
                            >
                              {tab.label} ({tab.contentBlocks.length} blocks)
                            </button>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {editingTabId !== tab.id && (
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveTab(tab.id, 'up')}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <FiChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMoveTab(tab.id, 'down')}
                              disabled={index === tabs.length - 1}
                              title="Move down"
                            >
                              <FiChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleStartRename(tab.id, tab.label)
                              }
                              title="Rename tab"
                            >
                              ✎
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTab(tab.id)}
                              title="Delete tab"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Tab Button */}
        <Button
          type="button"
          onClick={handleAddTab}
          className="w-full"
          variant="outline"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Tab
        </Button>
      </div>

      {/* Content Editor for Active Tab */}
      {activeTab && (
        <div className="space-y-3 border-t pt-4">
          <h4 className="text-sm font-semibold">Content: {activeTab.label}</h4>
          <ContentBlockEditor
            contentBlocks={activeTab.contentBlocks}
            onChange={handleContentBlocksChange}
          />
        </div>
      )}
    </div>
  );
}
