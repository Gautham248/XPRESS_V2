import React from 'react';
import { TicketOption } from '../../../data/mockData';
import SelectedView from './view_components/SelectedView';

interface Props {
  ticketOptions: TicketOption[];
  onDownloadTickets: () => void;
}

const EmployeeTicketOptionsView: React.FC<Props> = ({
  ticketOptions,
  onDownloadTickets,
}) => {
  return (
    <SelectedView
      ticketOptions={ticketOptions}
      onDownloadTickets={onDownloadTickets}
      buttons={['downloadTickets']}
    />
  );
};

export default EmployeeTicketOptionsView;