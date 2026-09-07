import React, { createContext, useContext, useState, useEffect } from "react";

export interface Profile {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  memberSince: string;
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  avatar: "",
  email: "",
  phone: "",
  city: "London",
  bio: "",
  memberSince: "",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      localStorage.removeItem("cinestar_profile");
      const saved = sessionStorage.getItem("cinestar_profile");
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to parse profile from sessionStorage", e);
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    sessionStorage.setItem("cinestar_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const handleAuthChange = () => {
      const activeEmail =
        sessionStorage.getItem("cinestar_active_user_email") ||
        localStorage.getItem("cinestar_active_user_email");
      if (!activeEmail) {
        setProfile(DEFAULT_PROFILE);
        sessionStorage.removeItem("cinestar_profile");
        localStorage.removeItem("cinestar_profile");
      }
    };
    window.addEventListener("cinestar_auth_changed", handleAuthChange);
    return () => window.removeEventListener("cinestar_auth_changed", handleAuthChange);
  }, []);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    sessionStorage.removeItem("cinestar_profile");
    localStorage.removeItem("cinestar_profile");
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
