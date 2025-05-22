import { TravelRequest, TimelineEvent, getStatusColor, mockTravelRequests } from '../mockData';

describe('mockData', () => {
  describe('getStatusColor', () => {
    it('should return correct color classes for different statuses', () => {
      expect(getStatusColor('Pending')).toBe('bg-yellow-100 text-yellow-800');
      expect(getStatusColor('Manager Approved')).toBe('bg-purple-100 text-purple-800');
      expect(getStatusColor('Tickets Dispatched')).toBe('bg-green-100 text-green-800');
      expect(getStatusColor('Rejected')).toBe('bg-red-100 text-red-800');
      expect(getStatusColor('Unknown Status')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('TravelRequest Data Structure', () => {
    const sampleRequest = mockTravelRequests[0];

    it('should have all required fields', () => {
      expect(sampleRequest).toHaveProperty('id');
      expect(sampleRequest).toHaveProperty('travelerName');
      expect(sampleRequest).toHaveProperty('travelType');
      expect(sampleRequest).toHaveProperty('departureDate');
      expect(sampleRequest).toHaveProperty('returnDate');
      expect(sampleRequest).toHaveProperty('status');
      expect(sampleRequest).toHaveProperty('estimatedCost');
    });

    it('should have valid travel type', () => {
      expect(['Domestic', 'International']).toContain(sampleRequest.travelType);
    });

    it('should have valid status', () => {
      const validStatuses = [
        'Pending',
        'Approved',
        'Rejected',
        'Completed',
        'Manager Approved',
        'Tickets Dispatched',
        'Tickets Selected',
        'DU Head Approved',
        'In-transit',
        'Returned',
        'Closed'
      ];
      expect(validStatuses).toContain(sampleRequest.status);
    });

    it('should have valid dates', () => {
      const departureDate = new Date(sampleRequest.departureDate);
      const returnDate = new Date(sampleRequest.returnDate);
      expect(departureDate).toBeInstanceOf(Date);
      expect(returnDate).toBeInstanceOf(Date);
      expect(returnDate >= departureDate).toBeTruthy();
    });

    it('should have valid estimated cost', () => {
      expect(typeof sampleRequest.estimatedCost).toBe('number');
      expect(sampleRequest.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Timeline Events', () => {
    const sampleRequest = mockTravelRequests[0];

    it('should have valid timeline events', () => {
      expect(Array.isArray(sampleRequest.timeline)).toBeTruthy();
      sampleRequest.timeline?.forEach((event: TimelineEvent) => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('actor');
        expect(event).toHaveProperty('description');
      });
    });

    it('should have chronologically ordered timeline events', () => {
      const events = sampleRequest.timeline || [];
      for (let i = 1; i < events.length; i++) {
        const prevDate = new Date(events[i - 1].date);
        const currentDate = new Date(events[i].date);
        expect(currentDate >= prevDate).toBeTruthy();
      }
    });
  });

  describe('Mock Travel Requests', () => {
    it('should have unique IDs', () => {
      const ids = mockTravelRequests.map(request => request.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have valid priority levels', () => {
      mockTravelRequests.forEach(request => {
        expect(['Low', 'Medium', 'High']).toContain(request.priority);
      });
    });

    it('should have valid transportation types', () => {
      mockTravelRequests.forEach(request => {
        expect(['Flight', 'Train', 'Car Rental', 'Other']).toContain(request.transportationType);
      });
    });

    it('should have valid accommodation types', () => {
      mockTravelRequests.forEach(request => {
        expect(['Hotel', 'Airbnb', 'None', 'Other']).toContain(request.accommodationType);
      });
    });
  });
});