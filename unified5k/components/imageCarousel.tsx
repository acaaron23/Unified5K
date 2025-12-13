/**
 * IMAGE CAROUSEL - Photo slideshow with navigation
 * Displays race photos in a swipeable carousel
 * Includes previous/next buttons and position indicator
 * Used on race details page to show event photos
 *
 * Josh Ilano
 * Boston University
 * 7-16-2025
 */

import { Pressable, Text, View } from "react-native";
import { Image } from 'expo-image'; // Optimized image component
import { useState, useEffect } from 'react';

/**
 * Displays a carousel of images with navigation controls
 * @param imageResponse - Array of image URLs to display
 * Example:
 *  const imageUrls = [
    'https://picsum.photos/id/1011/500/300',
    'https://picsum.photos/id/1025/500/300',
    'https://picsum.photos/id/1035/500/300',
  ];
 * @returns ImageCarousel UI Element with prev/next buttons
 */
export default function ImageCarousel({imageResponse}: {imageResponse: string[]}) {

    const [index, setIndex] = useState(0); // Current image index - changes which photo is displayed


    return (
        <View
            style={{ // Carousel container - optimized for vertical phone layout
                position: 'relative',
                height: 280,
                width: '100%',
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: '#000',
                borderRadius: 12,
                overflow: 'hidden',
            }}
        >

            {/* Display current photo */}
            <Image
                source={imageResponse[index]}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
            />

            {/* Navigation controls at bottom of carousel */}
            <View style={{
                flexDirection: 'row',
                gap: 10,
                position: 'absolute',
                bottom: 16,
                alignItems: 'center',
            }}>
                {/* Previous button - wraps to last image if at start */}
                <Pressable
                    onPress={() => setIndex(((index - 1) + imageResponse.length) % imageResponse.length)}
                    style={{
                        borderRadius: 25,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{"<"}</Text>
                </Pressable>

                {/* Position indicator showing current/total images */}
                <View style={{
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                        {index}/{imageResponse.length - 1}
                    </Text>
                </View>

                {/* Next button - wraps to first image if at end */}
                <Pressable
                    onPress={() => setIndex((index + 1) % imageResponse.length)}
                    style={{
                        borderRadius: 25,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{">"}</Text>
                </Pressable>
            </View>
        </View>
    );

}