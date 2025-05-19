import { useState } from 'react';
import { ButtonConfig } from '../ConfirmationModal';
 
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>();
  const [content, setContent] = useState<React.ReactNode>('');
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
 
  const openModal = (
    content: React.ReactNode,
    onConfirm?: () => void,
    title?: string
  ) => {
    setTitle(title);
    setContent(content);
    setButtons([
      {
        text: 'Cancel',
        bgColor: 'bg-gray-300',
        textColor: 'text-black',
        onClick: () => setIsOpen(false),
      },
      {
        text: 'Confirm',
        bgColor: 'bg-blue-600',
        onClick: () => {
          setIsOpen(false);
          onConfirm?.();
        },
      },
    ]);
    setIsOpen(true);
  };
 
  const closeModal = () => setIsOpen(false);
 
  return {
    isOpen,
    title,
    content,
    buttons,
    openModal,
    closeModal,
  };
};