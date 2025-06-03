import React from 'react';
import { TicketOption } from '../../../data/mockData';
import UploadTicketView from './view_components/UploadTicketView';

interface CustomButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface Props {
  ticketOptions: TicketOption[];
  newOption: string;
  editingOption: string | null;
  editText: string;
  onChangeNewOption: (value: string) => void;
  onAddOption: () => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onChangeEditText: (value: string) => void;
  onUploadOptions: () => void;
  customButtons?: CustomButton[];
}

const AdminTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  newOption,
  editingOption,
  editText,
  onChangeNewOption,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onSaveEdit,
  onCancelEdit,
  onChangeEditText,
  onUploadOptions,
  customButtons = [],
}) => {
  return (
    <UploadTicketView
      ticketOptions={ticketOptions}
      newOption={newOption}
      editingOption={editingOption}
      editText={editText}
      onChangeNewOption={onChangeNewOption}
      onAddOption={onAddOption}
      onEditOption={onEditOption}
      onDeleteOption={onDeleteOption}
      onSaveEdit={onSaveEdit}
      onCancelEdit={onCancelEdit}
      onChangeEditText={onChangeEditText}
      onUploadOptions={onUploadOptions}
      customButtons={customButtons}
    />
  );
};

export default AdminTicketOptionsView;