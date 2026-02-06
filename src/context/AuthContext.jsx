import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    // Fetch full user profile from Firestore
                    if (db) {
                        const userRef = doc(db, 'users', user.uid);
                        let userSnap = await getDoc(userRef);

                        if (!userSnap.exists()) {
                            const newProfile = {
                                uid: user.uid,
                                displayName: user.displayName,
                                email: user.email,
                                photoURL: user.photoURL,
                                createdAt: serverTimestamp(),
                                role: 'user'
                            };
                            await setDoc(userRef, newProfile);
                            setUserData(newProfile);
                        } else {
                            setUserData(userSnap.data());
                        }
                    }
                    setUser(user);
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (error) {
                console.error("Error in Auth State Transition:", error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);


    const signup = async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Create user doc in Firestore (though onAuthStateChanged also handles it, 
        // we might want specific fields immediately)
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
            uid: userCredential.user.uid,
            displayName: name,
            email: email,
            photoURL: null,
            createdAt: serverTimestamp(),
            role: 'user'
        });

        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, loginWithGoogle, login, signup, logout, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};
