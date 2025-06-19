export const feedbackService = {
  async submitFeedback({ message, email }: { message: string; email?: string }) {
    // Simulación de envío de feedback
    return { success: true }
  },
} 