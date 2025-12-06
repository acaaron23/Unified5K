/**
 * Josh Ilano
 * Boston University
 * 7-16-2025
 */


import { Pressable, Text, View } from "react-native";
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';

/**
 * 
 * @param imageResponse 
 * Example:  
 *  const imageUrls = [
    'https://picsum.photos/id/1011/500/300',
    'https://picsum.photos/id/1025/500/300',
    'https://picsum.photos/id/1035/500/300',
    'https://picsum.photos/id/1043/500/300',
    'https://picsum.photos/id/1062/500/300',
    'https://picsum.photos/id/1074/500/300',
  ];
 * 
 * 
 * @returns ImageCarousel UI Element
 */
export default function ImageCarousel({imageResponse}: {imageResponse: string[]}) {

    const [index, setIndex] = useState(0); // on change of index, a different image will appear


    return (
        <View
            style={{ // the UI is currently only intended for vertical phones, change as needed in future
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

            <Image // content image
                source={imageResponse[index]}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
            />

            <View style={{
                flexDirection: 'row',
                gap: 10,
                position: 'absolute',
                bottom: 16,
                alignItems: 'center',
            }}>
                <Pressable // Left button to return to previous image
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

                <View style={{ // button to display status of selection
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
                        {index}/{imageResponse.length - 1}
                    </Text>
                </View>


                <Pressable // Right button to progress to next image
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