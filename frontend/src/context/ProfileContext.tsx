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
}

const DEFAULT_PROFILE: Profile = {
  name: "Alex Rivera",
  avatar: "",
  email: "alex.rivera@example.com",
  phone: "+1 (555) 012-3456",
  city: "London",
  bio: "Movie lover and CineStar Elite member since 2022.",
  memberSince: "2022",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("cinestar_profile");
    if (saved) {
      try {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse profile from localStorage", e);
      }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem("cinestar_profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
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
