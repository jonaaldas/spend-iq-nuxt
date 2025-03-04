export const useToast = () => {
  const success = (message: string) => {
    // In a real implementation, this would use a toast library
    console.log('Success:', message)
  }

  const error = (message: string) => {
    // In a real implementation, this would use a toast library
    console.error('Error:', message)
  }

  return {
    success,
    error,
  }
}
