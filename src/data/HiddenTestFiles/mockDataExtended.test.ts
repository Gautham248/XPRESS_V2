import { 
  dashboardStats, 
  upcomingTrips, 
  travelExpensesByMonth, 
  topDestinations,
  mockTravelRequests
} from '../mockData';

describe('Extended Mock Data Tests', () => {
  describe('Dashboard Statistics', () => {
    it('should have all required dashboard stats', () => {
      expect(dashboardStats).toHaveLength(4);
      dashboardStats.forEach(stat => {
        expect(stat).toHaveProperty('label');
        expect(stat).toHaveProperty('value');
        expect(stat).toHaveProperty('changePercent');
        expect(stat).toHaveProperty('icon');
      });
    });

    it('should have valid numeric values', () => {
      dashboardStats.forEach(stat => {
        expect(typeof stat.value).toBe('number');
        expect(typeof stat.changePercent).toBe('number');
        expect(stat.value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Upcoming Trips', () => {
    it('should have valid trip data', () => {
      upcomingTrips.forEach(trip => {
        expect(trip).toHaveProperty('id');
        expect(trip).toHaveProperty('destination');
        expect(trip).toHaveProperty('dates');
        expect(trip).toHaveProperty('traveler');
        expect(trip).toHaveProperty('status');
      });
    });

    it('should match with main travel requests', () => {
      upcomingTrips.forEach(trip => {
        const matchingRequest = mockTravelRequests.find(req => req.id === trip.id);
        expect(matchingRequest).toBeTruthy();
        expect(matchingRequest?.destination).toBe(trip.destination);
        expect(matchingRequest?.travelerName).toBe(trip.traveler);
        expect(matchingRequest?.status).toBe(trip.status);
      });
    });
  });

  describe('Travel Expenses', () => {
    it('should have valid monthly expense data', () => {
      travelExpensesByMonth.forEach(expense => {
        expect(expense).toHaveProperty('month');
        expect(expense).toHaveProperty('domestic');
        expect(expense).toHaveProperty('international');
        expect(expense.domestic).toBeGreaterThanOrEqual(0);
        expect(expense.international).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have expenses for all months', () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const expenseMonths = travelExpensesByMonth.map(e => e.month);
      expect(expenseMonths).toEqual(expect.arrayContaining(months));
    });

    it('should have reasonable expense ratios', () => {
      travelExpensesByMonth.forEach(expense => {
        const totalExpense = expense.domestic + expense.international;
        expect(totalExpense).toBeGreaterThan(0);
        expect(expense.domestic / totalExpense).toBeLessThanOrEqual(1);
        expect(expense.international / totalExpense).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Top Destinations', () => {
    it('should have valid destination data', () => {
      topDestinations.forEach(dest => {
        expect(dest).toHaveProperty('destination');
        expect(dest).toHaveProperty('count');
        expect(dest).toHaveProperty('percentOfTotal');
      });
    });

    it('should have valid percentage calculations', () => {
      const totalPercentage = topDestinations.reduce(
        (sum, dest) => sum + dest.percentOfTotal, 
        0
      );
      expect(Math.round(totalPercentage)).toBeLessThanOrEqual(100);
    });

    it('should have counts matching percentages', () => {
      const totalCount = topDestinations.reduce(
        (sum, dest) => sum + dest.count, 
        0
      );
      topDestinations.forEach(dest => {
        const calculatedPercentage = (dest.count / totalCount) * 100;
        expect(Math.abs(calculatedPercentage - dest.percentOfTotal)).toBeLessThan(0.1);
      });
    });
  });

  describe('Travel Request Business Rules', () => {
    it('should have valid status transitions', () => {
      mockTravelRequests.forEach(request => {
        const timeline = request.timeline || [];
        if (request.status === 'Closed') {
          expect(timeline.some(e => e.type === 'closed')).toBeTruthy();
        }
        if (request.status === 'Tickets Dispatched') {
          expect(timeline.some(e => e.type === 'ticketsSelected')).toBeTruthy();
        }
      });
    });

    it('should have matching manager and reporting manager', () => {
      mockTravelRequests.forEach(request => {
        expect(request.managerName).toBe(request.reportingManager);
      });
    });

    it('should have valid project codes', () => {
      mockTravelRequests.forEach(request => {
        expect(request.projectCode).toMatch(/^PRJ\d{3}$/);
      });
    });

    it('should have valid department codes', () => {
      const validDepartments = ['MKT', 'SLS', 'IT', 'HR', 'PRD', 'BIZ', 'ENG'];
      mockTravelRequests.forEach(request => {
        const deptPrefix = request.departmentCode.split('-')[0];
        expect(validDepartments).toContain(deptPrefix);
      });
    });
  });
});