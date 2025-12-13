/**
 * Blog Post Card Component - Displays blog post with title and image
 */

import { ExternalPathString, Link } from "expo-router" // Navigation
import { Image, View } from "react-native"
import { Text } from "react-native-paper" // Material UI

export type BlogPostCardProps = {
    url: string, // Blog post URL
    image: string, // Blog image URL
    title: string // Blog post title
}

export function BlogPostCard({ url, image, title }: BlogPostCardProps) {
    return <View style={{ alignSelf: "baseline", flexDirection: "column", gap: 8, backgroundColor: "transparent" }}>
        <Text variant="displaySmall" style={{ marginLeft: 8 }}>{title}</Text>
        <Link href={url as ExternalPathString}><Image style={{
            borderRadius: 8, height: 180, width: 325
        }} source={{
            uri: image,
        }}></Image></Link>
    </View>
}