export const getCurrentUser = async () => { 
    return { 
        id: 'stub-user-id', 
        name: 'Usuario Simulado',
        email: 'test@example.com',
        role: 'admin',
        onboardingCompleted: true
    }; 
};
