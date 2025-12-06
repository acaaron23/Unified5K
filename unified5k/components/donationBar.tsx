import { Text, View, TouchableOpacity } from "react-native";
import {useFonts} from 'expo-font';

export default function DonationBar({currentAmount, totalAmount}: {currentAmount: number, totalAmount: number}) {

    const [fontsLoaded] = useFonts({
        "Poppins": require('../assets/fonts/Poppins-Regular.ttf'),
        "Poppins-Bold": require('../assets/fonts/Poppins-SemiBold.ttf'),
       "Poppins-SemiBold": require('../assets/fonts/Poppins-SemiBold.ttf'),
    });


    if (currentAmount <= totalAmount) {
        return (

            <View
                style={{ 
                    height: 140,
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: '#4A90E2',
                    width: '90%',
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                    backgroundColor: '#fff',
                }}
            >

                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}>

                    <Text style={{ fontFamily: 'Poppins', fontSize: 15, flex: 1, color: '#000' }} >
                        {"$" + currentAmount.toLocaleString() + " out of $" + totalAmount.toLocaleString() + "\ngoal reached"}
                    </Text>

                    <TouchableOpacity
                        style={{
                            backgroundColor: '#4A90E2',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8,
                        }}
                        onPress={() => {}} // lambda function such that it will go to donate page
                    >
                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Donate</Text>
                    </TouchableOpacity>
                </View>




                <View  // the background
                    style={{
                        width: '100%',
                        height: 28,
                        borderWidth: 2,
                        borderColor: '#4A90E2',
                        borderRadius: 14,
                        backgroundColor: '#E8F4FC',
                        overflow: 'hidden',
                    }}>

                    <View  // the progress bar itself
                        style={{
                            width: `${(currentAmount / totalAmount) * 100}%`,
                            height: '100%',
                            backgroundColor: '#6BA7C5',
                            borderRadius: 12,
                            position: 'absolute'
                        }}>
                    </View>

                </View>




            </View>
        );
    }
}