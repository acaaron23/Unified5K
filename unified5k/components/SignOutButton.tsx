/**
 * Sign Out Button Component - User logout button
 * Signs out user via Clerk and redirects to home
 */

import { useClerk } from '@clerk/clerk-expo' // Clerk auth
import { useRouter } from 'expo-router' // Navigation
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
    const { signOut } = useClerk() // Clerk sign out method
    const router = useRouter() // Navigation

    // Handle sign out and redirect
    const handleSignOut = async () => {
        try {
            await signOut()
            router.replace('/')
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <TouchableOpacity onPress={handleSignOut}>
            <Text>Sign out</Text>
        </TouchableOpacity>
    )
}