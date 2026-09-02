import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CHAT } from "@/graphql/queries";
import { SEND_MESSAGE } from "@/graphql/mutations";
import { useChatSocket } from "@/hooks/useChatSocket";

interface PackageReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: {
        id: string;
        name: string;
        description?: string;
        features?: string[];
        pricing: number;
        bookedDates?: string[] | Date[];
    };
    onPay: (date: Date) => void;
    visitorId?: string;
    offeringId?: string;
}

const PackageReservationModal: React.FC<PackageReservationModalProps> = ({
    isOpen,
    onClose,
    pkg,
    onPay,
    visitorId,
    offeringId,
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [note, setNote] = useState("");

    const { sendMessage: sendSocketMessage } = useChatSocket(visitorId, 'visitor');

    const [getChat] = useLazyQuery(GET_CHAT, { fetchPolicy: 'network-only' });
    const [sendMessageMutation] = useMutation(SEND_MESSAGE);

    if (!isOpen) return null;

    // Convert bookedDates to Date objects
    const bookedDates = (pkg.bookedDates || []).map(d =>
        typeof d === 'string' ? parseISO(d) : d
    );

    const isDateDisabled = (date: Date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
        return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
    };

    const handlePay = async () => {
        if (!selectedDate) return;

        // Send the note to the vendor before redirecting to payment
        if (note.trim() && visitorId && offeringId) {
            try {
                const { data } = await getChat({ variables: { visitorId, offeringId } });
                const chatId = data?.getChat?.chatId;
                if (chatId) {
                    const formattedMessage =
                        `📦 Payment Note — ${pkg.name} | Booking: ${format(selectedDate, 'MMM d, yyyy')}\n\n${note.trim()}`;
                    try {
                        await sendSocketMessage({ chatId, content: formattedMessage, senderId: visitorId, senderType: 'visitor' });
                    } catch {
                        await sendMessageMutation({
                            variables: { chatId, content: formattedMessage, visitorSenderId: visitorId }
                        });
                    }
                }
            } catch {
                // Note failed silently — don't block payment
            }
        }

        onPay(selectedDate);
    };

    const advanceAmount = pkg.pricing * 0.2;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 z-10 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Package</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Package Details */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-orange/5 to-orange/10 border border-orange/20 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                                {pkg.description && (
                                    <p className="text-gray-600 leading-relaxed mb-4">{pkg.description}</p>
                                )}

                                {pkg.features && pkg.features.length > 0 && (
                                    <div className="space-y-3 mt-4 pt-4 border-t border-orange/10">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Included Features</h4>
                                        {pkg.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start">
                                                <svg
                                                    className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-gray-700 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Note to vendor - sent automatically on Pay */}
                            {visitorId && offeringId && (
                                <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                                    <p className="text-sm font-semibold text-gray-600">Add a note</p>
                                    
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Write a message to the vendor (optional)"
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Column - Calendar & Payment */}
                        <div className="flex flex-col h-full">
                            <p className="text-gray-600 mb-4">
                                Select a date for <span className="font-semibold text-orange">{pkg.name}</span>
                            </p>

                            <div className="flex justify-center border rounded-lg p-4 mb-6 bg-gray-50">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={isDateDisabled}
                                    className="rounded-md border bg-white shadow-sm"
                                />
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="bg-orange/10 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-600">Package Price</span>
                                        <span className="font-semibold">LKR {pkg.pricing.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-orange font-bold text-lg">
                                        <span>Advance (20%)</span>
                                        <span>LKR {advanceAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePay}
                                    disabled={!selectedDate}
                                    className="w-full bg-orange hover:bg-orange-600 text-white font-bold py-6 text-lg rounded-full"
                                >
                                    {selectedDate ?
                                        `Pay Advance for ${format(selectedDate, 'MMM d, yyyy')}` :
                                        'Select a Date to Continue'
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageReservationModal;
