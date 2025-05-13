import React from 'react';
import { TravelRequestProvider } from './TravelRequestContext';
import CreateRequestForm from './CreateRequestForm';

const CreateRequest: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Create Travel Request</h2>
      </div>
      
      <TravelRequestProvider>
        <CreateRequestForm />
      </TravelRequestProvider>
    </div>
  );
};

export default CreateRequest;