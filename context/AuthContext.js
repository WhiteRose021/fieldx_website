// context/AuthContext.js
"use client"

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Create the authentication context
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Computed admin status
  const isAdmin = user?.email === 'garvanitis@applink.gr';

  // Fetch user's plan data
  const fetchUserPlan = async (uid) => {
    if (!uid) return;
    
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserPlan(userDoc.data().plan || null);
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        fetchUserPlan(user.uid);
      } else {
        setUser(null);
        setUserPlan(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if there's a redirect URL in the query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      if (redirectUrl) {
        router.push(`/${redirectUrl}`);
      } else {
        router.push('/dashboard');
      }
      
      await fetchUserPlan(userCredential.user.uid);
      setLoading(false);
      return { user: userCredential.user, error: null };
    } catch (error) {
      setLoading(false);
      return { user: null, error: error.message };
    }
  };

  const register = async (email, password, firstName, lastName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        displayName: `${firstName || ''} ${lastName || ''}`.trim(),
        role: 'user',
        isActive: true,
        createdAt: serverTimestamp(),
        plan: null
      });
      
      router.push('/dashboard');
      setLoading(false);
      return { user: userCredential.user, error: null };
    } catch (error) {
      setLoading(false);
      return { user: null, error: error.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push('/');
      setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Update user's selected plan
  const updateUserPlan = async (planId) => {
    if (!user) return { success: false, error: "User not authenticated" };
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const planData = {
        id: planId,
        status: "awaiting",
        selectedAt: serverTimestamp()
      };
      
      await setDoc(userDocRef, {
        plan: planData
      }, { merge: true });
      
      // Update local state
      setUserPlan(planData);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating user plan:", error);
      return { success: false, error: error.message };
    }
  };

  // Special case for the developer account
  useEffect(() => {
    if (user?.email === 'garvanitis@applink.gr' && userPlan?.status === 'awaiting') {
      const timer = setTimeout(async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, {
            plan: {
              ...userPlan,
              status: "active"
            }
          }, { merge: true });
          
          setUserPlan(prev => ({
            ...prev,
            status: "active"
          }));
        } catch (error) {
          console.error("Error auto-approving plan:", error);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, userPlan]);

  // ADMIN FUNCTIONS

  // Get all users with their plans
  const getAllUsers = async () => {
    if (!isAdmin) return [];
    
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersWithPlans = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        
        const user = {
          uid: doc.id,
          email: userData.email || null,
          displayName: userData.displayName || null,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isActive: userData.isActive,
          role: userData.role,
          createdAt: userData.createdAt
        };
        
        const plan = userData.plan || null;
        
        usersWithPlans.push({
          user,
          plan
        });
      });
      
      return usersWithPlans;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };
  
  // Update user plan status (admin only)
  const updateUserPlanStatus = async (userId, planId, status) => {
    if (!isAdmin) return false;
    
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return false;
      }
      
      const userData = userDoc.data();
      const currentPlan = userData.plan || { id: planId, selectedAt: serverTimestamp() };
      
      await updateDoc(userDocRef, {
        plan: {
          ...currentPlan,
          id: planId,
          status: status
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error updating user plan status:", error);
      return false;
    }
  };
  
  // Get all contact inquiries (admin only)
  const getLeads = async () => {
    if (!isAdmin) return [];
    
    try {
      const leadsCollection = collection(db, "inquiries");
      const leadsSnapshot = await getDocs(leadsCollection);
      
      const leads = [];
      
      leadsSnapshot.forEach((doc) => {
        const data = doc.data();
        leads.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          surname: data.surname,
          company: data.company,
          phone: data.phone,
          description: data.description,
          planId: data.planId,
          status: data.status,
          createdAt: data.createdAt
        });
      });
      
      return leads;
    } catch (error) {
      console.error("Error fetching leads:", error);
      return [];
    }
  };
  
  // Update lead status (admin only)
  const updateLeadStatus = async (leadId, status) => {
    if (!isAdmin) return false;
    
    try {
      const leadDocRef = doc(db, "inquiries", leadId);
      await updateDoc(leadDocRef, { status });
      return true;
    } catch (error) {
      console.error("Error updating lead status:", error);
      return false;
    }
  };
  
  // Submit inquiry (for non-logged in users)
  const submitInquiry = async (email, name, surname, company, phone, description, planId) => {
    try {
      // Create new inquiry document
      const inquiriesCollection = collection(db, "inquiries");
      
      await addDoc(inquiriesCollection, {
        email,
        name,
        surname,
        company,
        phone,
        description,
        planId,
        status: 'new',
        createdAt: serverTimestamp()
      });
      
      return { success: true, message: 'Inquiry submitted successfully' };
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      userPlan, 
      isAdmin,
      login, 
      register, 
      logout,
      updateUserPlan,
      getAllUsers,
      updateUserPlanStatus,
      getLeads,
      updateLeadStatus,
      submitInquiry
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);