import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelRequest } from './TravelRequestContext';
import BasicInfoSection from './BasicInfoSection';
import TravelDetailsSection from './TravelDetailsSection';
import AdditionalServicesSection from './AdditionalServicesSection';
// import PurposeSection from './PurposeSection';

const CreateRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { handleSubmit } = useTravelRequest();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection />
      <TravelDetailsSection />
      <AdditionalServicesSection />
      {/* <PurposeSection /> */}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/70 rounded-md"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
};

export default CreateRequestForm;