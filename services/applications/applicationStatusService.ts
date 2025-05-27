import { 
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/main';
import { Application, ApplicationStatus } from './applicationBaseService';

/**
 * Approve an application and assign a room
 */
export const approveApplication = async (id: string, roomId: string, reason?: string) => {
  try {
    console.log(`Approving application ${id} and assigning room ${roomId}`);
    
    // Update application status
    const { data: updatedApp, error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'approved' as ApplicationStatus,
        admin_notes: reason || 'Application approved'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application status:', updateError);
      toast.error('Failed to approve application: ' + updateError.message);
      throw updateError;
    }

    // Create room assignment
    if (updatedApp) {
      const { error: assignmentError } = await supabase
        .from('room_assignments')
        .insert({
          room_id: roomId,
          student_id: updatedApp.student_id,
          application_id: id,
          check_in_date: new Date().toISOString().split('T')[0]
        });

      if (assignmentError) {
        console.error('Error creating room assignment:', assignmentError);
        toast.error('Failed to assign room: ' + assignmentError.message);
        throw assignmentError;
      }

      // Update room status
      const { error: roomUpdateError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', roomId);

      if (roomUpdateError) {
        console.error('Error updating room status:', roomUpdateError);
        toast.error('Failed to update room status: ' + roomUpdateError.message);
        throw roomUpdateError;
      }
      
      // Create notification for the student
      await supabase.from('notifications').insert({
        user_id: updatedApp.student_id,
        title: 'Application Approved',
        content: `Your accommodation application has been approved and you have been assigned a room.`,
        type: 'application_status',
        read: false
      });
    }

    console.log('Successfully approved application and assigned room');
    toast.success('Application approved and room assigned!');
    return updatedApp;
  } catch (error) {
    console.error('Error approving application:', error);
    throw error;
  }
};

/**
 * Reject an application with a reason
 */
export const rejectApplication = async (id: string, reason: string) => {
  try {
    console.log(`Rejecting application ${id} with reason: ${reason}`);
    
    const { data, error } = await supabase
      .from('applications')
      .update({
        status: 'denied' as ApplicationStatus,
        admin_notes: reason || 'Application rejected'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application: ' + error.message);
      throw error;
    }

    // Create notification for the student
    if (data) {
      await supabase.from('notifications').insert({
        user_id: data.student_id,
        title: 'Application Denied',
        content: `Your accommodation application has been denied. Reason: ${reason || 'No reason provided'}`,
        type: 'application_status',
        read: false
      });
    }

    console.log('Successfully rejected application');
    toast.success('Application rejected!');
    return data;
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }
};

export const applicationStatusService = {
  // Get count of applications by status
  async getApplicationCountByStatus(status: ApplicationStatus): Promise<number> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('status', '==', status)
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.size;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get count of applications by student
  async getApplicationCountByStudent(studentId: string): Promise<number> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('student_id', '==', studentId)
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.size;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get count of applications by block
  async getApplicationCountByBlock(blockId: string): Promise<number> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('preferred_block_id', '==', blockId)
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.size;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get count of applications by date range
  async getApplicationCountByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('created_at', '>=', startTimestamp),
        where('created_at', '<=', endTimestamp)
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.size;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};
