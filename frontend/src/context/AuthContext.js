import React,
{
    createContext,
    useState,
    useEffect
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in storage on app startup
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                if (storedToken) {
                    // TODO: Here you might want to validate the token with the backend
                    setToken(storedToken);
                    // You would also fetch the user profile here
                }
            } catch (e) {
                console.error('Failed to load token from storage', e);
            } finally {
                setLoading(false);
            }
        };

        loadToken();
    }, []);

    const login = async (idToken) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/google/token', { idToken });
            const { token: receivedToken, user: receivedUser } = res.data;

            setToken(receivedToken);
            setUser(receivedUser);

            await AsyncStorage.setItem('userToken', receivedToken);
            // You might want to store user info in async storage as well
            await AsyncStorage.setItem('userInfo', JSON.stringify(receivedUser));

            return true;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
