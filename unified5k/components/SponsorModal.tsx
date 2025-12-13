/**
 * SPONSOR MODAL - Contact form for sponsorship inquiries
 * Allows users to send sponsor/vendor inquiry emails
 * Three types: Community, Corporate, and Vendor sponsorships
 * Opens default email client with pre-filled message
 */

import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, Pressable,
    KeyboardAvoidingView, Platform, Linking, TouchableWithoutFeedback,
} from 'react-native';

// Sponsorship inquiry types
type InquiryType = 'community' | 'corporate' | 'vendor';

// Component props
type Props = {
    visible: boolean; // Modal visibility
    onClose: () => void; // Close handler
    defaultType?: InquiryType; // Pre-select sponsor type
    toEmail?: string; // Recipient email address
};

export default function SponsorModal({
    visible,
    onClose,
    defaultType = 'community',
    toEmail = 'brendan@adaptx.org', // Default recipient
}: Props) {
    const [name, setName] = useState(''); // Sender name
    const [email, setEmail] = useState(''); // Sender email
    const [msg, setMsg] = useState(''); // Inquiry message
    const [type, setType] = useState<InquiryType>(defaultType); // Selected sponsor type

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setType(defaultType);
            setName('');
            setEmail('');
            setMsg('');
        }
    }, [visible, defaultType]);

    // Send email via mailto link
    const send = async () => {
        if (!email.trim() || !name.trim()) return; // Validate required fields

        // Format tier name for email
        const tier =
            type === 'community' ? 'Community'
                : type === 'corporate' ? 'Corporate'
                    : 'Vendor';

        // Build email subject and body
        const subject = `Sponsorship Inquiry - ${tier}`;
        const body =
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Type: ${tier}\n\n` +
            `Message:\n${msg}`;

        // Open email client with pre-filled message
        const url = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        try { await Linking.openURL(url); onClose(); } catch { }
    };

    // Segmented button for sponsor type selection
    const SegBtn = ({ label, value }: { label: string; value: InquiryType }) => {
        const active = type === value; // Check if this option is selected
        return (
            <Pressable
                onPress={() => setType(value)}
                className={`flex-1 h-10 items-center justify-center ${active ? 'bg-sky-700' : 'bg-white'}`}
                style={{
                    // Round outer edges of segmented control
                    borderTopLeftRadius: value === 'community' ? 12 : 0,
                    borderBottomLeftRadius: value === 'community' ? 12 : 0,
                    borderTopRightRadius: value === 'vendor' ? 12 : 0,
                    borderBottomRightRadius: value === 'vendor' ? 12 : 0,
                }}
            >
                <Text className={`font-bold ${active ? 'text-white' : 'text-black'}`}>{label}</Text>
            </Pressable>
        );
    };

    // Modal title based on selected type
    const prettyTitle =
        type === 'community' ? 'Become a Community Sponsor'
            : type === 'corporate' ? 'Become a Corporate Sponsor'
                : 'Become a Vendor';

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            {/* Adjust layout for keyboard on iOS */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Dimmed background - tap to close */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    }} />
                </TouchableWithoutFeedback>

                {/* Modal content card */}
                <View className="flex-1 items-center justify-center px-5" style={{ pointerEvents: 'box-none' }}>
                    <View className="w-full rounded-2xl bg-sky-100 px-5 py-16" style={{ borderWidth: 2, borderColor: '#1BA8D8' }}>
                        <Text className="text-center text-xl font-extrabold mb-4 text-black">{prettyTitle}</Text>

                        {/* Name input field */}
                        <View className="rounded-xl bg-white mb-3" style={{ borderWidth: 2, borderColor: '#1BA8D8' }}>
                            <TextInput
                                placeholder="Name"
                                value={name}
                                onChangeText={setName}
                                className="px-4 py-3 text-base font-semibold text-black"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Email input field */}
                        <View className="rounded-xl bg-white mb-3" style={{ borderWidth: 2, borderColor: '#1BA8D8' }}>
                            <TextInput
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                className="px-4 py-3 text-base font-semibold text-black"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Sponsor type selector: Community | Corporate | Vendor */}
                        <View className="flex-row items-center border-2 border-sky-500 rounded-2xl overflow-hidden mb-3">
                            <SegBtn label="Community" value="community" />
                            <SegBtn label="Corporate" value="corporate" />
                            <SegBtn label="Vendor" value="vendor" />
                        </View>

                        {/* Message textarea */}
                        <View className="rounded-xl bg-white" style={{ minHeight: 120, borderWidth: 2, borderColor: '#1BA8D8' }}>
                            <TextInput
                                placeholder="Message"
                                value={msg}
                                onChangeText={setMsg}
                                multiline
                                className="px-4 py-3 text-base flex-1 font-semibold text-black"
                                textAlignVertical="top"
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Send button - disabled until name and email filled */}
                        <Pressable
                            onPress={send}
                            disabled={!name.trim() || !email.trim()}
                            className={`mt-4 rounded-xl py-4 items-center ${!name.trim() || !email.trim() ? 'bg-sky-300' : 'bg-sky-500'}`}
                        >
                            <Text className="text-white font-bold">Send</Text>
                        </Pressable>

                        {/* Cancel button */}
                        <Pressable onPress={onClose} className="mt-2 items-center">
                            <Text className="text-black font-bold">Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
