import { 
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/main';
import { Application, ApplicationStatus } from './applicationBaseService';

export const applicationMutationService = {
  // Update application status
  async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus,
    reviewNotes?: string,
    reviewerId?: string
  ): Promise<void> {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      const now = Timestamp.now();
      
      const updateData: Partial<Application> = {
        status,
        updated_at: now,
        reviewed_at: now
      };

      if (reviewNotes) {
        updateData.review_notes = reviewNotes;
      }

      if (reviewerId) {
        updateData.reviewed_by = reviewerId;
      }

      await updateDoc(applicationRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update application details
  async updateApplicationDetails(
    applicationId: string,
    updates: Partial<Omit<Application, 'id' | 'created_at' | 'status' | 'reviewed_at' | 'reviewed_by' | 'review_notes'>>
  ): Promise<void> {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      const now = Timestamp.now();
      
      await updateDoc(applicationRef, {
        ...updates,
        updated_at: now
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};
