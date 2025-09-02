import type { Profile } from '~/types/database'; // Assuming a types file will be created later

export const useCurrentUser = () => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();

  // Create a reactive state for the user's profile
  const profile = useState<Profile | null>('user-profile', () => null);

  // Fetch the profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      profile.value = data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      profile.value = null;
    }
  };

  // Watch for changes in the authenticated user
  watch(
    user,
    (newUser) => {
      if (newUser) {
        // User is logged in, fetch their profile
        fetchProfile(newUser.id);
      } else {
        // User is logged out, clear the profile
        profile.value = null;
      }
    },
    { immediate: true } // Run the watcher immediately on component mount
  );

  return {
    user,
    profile,
    fetchProfile,
  };
};
