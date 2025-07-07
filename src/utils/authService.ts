// // utils/authService.ts
// export const authenticateUser = async (name: string, phone: string) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         tableCode: 2336,
//         userName: name || 'Guest',
//       });
//     }, 1000);
//   });
// };

// Simple mock implementation for authenticateUser
export async function authenticateUser(name: string, phone: string) {
  // Replace this with real authentication logic as needed
  return { name, phone, authenticated: true };
}