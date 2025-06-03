import React from 'react';
import { TicketOption } from '../../../data/mockData';
import SelectTicketView from './view_components/SelectTicketView';

interface Props {
  ticketOptions: TicketOption[];
  onSelectOption: (id: string) => void;
  onEditOption: (option: TicketOption) => void;
  onDeleteOption: (id: string) => void;
  onUploadOptions: () => void;
}

const ManagerTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  onSelectOption,
  onUploadOptions,
}) => {
  return (
    <SelectTicketView
      ticketOptions={ticketOptions}
      onSelectOption={onSelectOption}
      onUploadOptions={onUploadOptions}
    />
  );
};

export default ManagerTicketOptionsView;