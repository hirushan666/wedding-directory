import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { X, ShieldCheck, Lock, Loader2 } from "lucide-react";
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
    requiresReservation?: boolean;
    bookedDates?: string[] | Date[];
  };
  onPay: (date: Date) => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendMessage: sendSocketMessage } = useChatSocket(
    visitorId,
    "visitor",
  );

  const [getChat] = useLazyQuery(GET_CHAT, { fetchPolicy: "network-only" });
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  if (!isOpen) return null;

  // Convert bookedDates to Date objects
  const bookedDates = (pkg.bookedDates || []).map((d) =>
    typeof d === "string" ? parseISO(d) : d,
  );

  const isDateDisabled = (date: Date) => {
    // Past dates are always disabled
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    // For normal packages, do not block any booked dates
    if (!pkg.requiresReservation) return false;
    return bookedDates.some((bookedDate) => isSameDay(bookedDate, date));
  };

  const handlePay = async () => {
    if (!selectedDate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Send the note to the vendor before redirecting to payment
      if (note.trim() && visitorId && offeringId) {
        try {
          const { data } = await getChat({
            variables: { visitorId, serviceId: offeringId },
          });
          const chatId = data?.getChat?.chatId;

          if (chatId) {
            const formattedMessage = `📦 Payment Note — ${pkg.name} | Booking: ${format(selectedDate, "MMM d, yyyy")}\n\n${note.trim()}`;

            try {
              await sendSocketMessage({
                chatId,
                content: formattedMessage,
                senderId: visitorId,
                senderType: "visitor",
              });
            } catch {
              await sendMessageMutation({
                variables: {
                  chatId,
                  content: formattedMessage,
                  visitorSenderId: visitorId,
                },
              });
            }
          }
        } catch {
          // Note failed silently — don't block payment
        }
      }

      await onPay(selectedDate);
      // Keep isSubmitting = true while browser navigates to PayHere
    } catch {
      setIsSubmitting(false);
    }
  };

  const advanceAmount = pkg.pricing * 0.2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-darkSurface rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative border border-transparent dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Redirecting Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/95 dark:bg-darkSurface/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 md:p-8 text-center animate-in fade-in duration-200">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-orange/10 flex items-center justify-center text-orange animate-pulse">
                <ShieldCheck className="w-10 h-10 text-orange" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-darkElevated shadow-md flex items-center justify-center border border-gray-100 dark:border-zinc-700">
                <Loader2 className="w-4 h-4 text-orange animate-spin" />
              </div>
            </div>

            <h3 className="text-2xl font-bold font-title text-gray-900 dark:text-zinc-100 mb-6">
              Redirecting to PayHere...
            </h3>

            <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-darkElevated px-4 py-2 rounded-full border border-gray-200/80 dark:border-zinc-700 font-body">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>256-bit SSL Encrypted Secure Checkout</span>
            </div>

            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-5 font-body">
              Please do not refresh or close this window...
            </p>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 font-title">
              {pkg.requiresReservation ? "Book Reservation Package" : "Book Package"}
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-darkElevated text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Package Details */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange/5 to-orange/10 dark:from-orange/10 dark:to-orange/5 border border-orange/20 dark:border-zinc-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100 mb-2 font-title">
                  {pkg.name}
                </h3>
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                      pkg.requiresReservation
                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    }`}
                  >
                    {pkg.requiresReservation ? "Requires Reservation" : "Normal Package"}
                  </span>
                </div>
                {pkg.description && (
                  <p className="text-gray-600 dark:text-zinc-300 leading-relaxed mb-4 text-sm font-body">
                    {pkg.description}
                  </p>
                )}

                {pkg.features && pkg.features.length > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-orange/10 dark:border-zinc-700">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                      Included Features
                    </h4>
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
                        <span className="text-gray-700 dark:text-zinc-300 text-sm font-body">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note to vendor - sent automatically on Pay */}
              {visitorId && offeringId && (
                <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
                    Add a note
                  </p>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write a message to the vendor (optional)"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 dark:border-zinc-700 dark:bg-darkElevated px-3 py-2 text-sm text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
              )}
            </div>

            {/* Right Column - Calendar & Payment */}
            <div className="flex flex-col h-full">
              <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 font-body">
                Select Event Date
              </p>

              <div className="border border-gray-200 dark:border-zinc-700 rounded-xl p-4 mb-6 bg-white dark:bg-darkElevated shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="w-full p-0"
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-4",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-gray-500 dark:text-zinc-400 rounded-md flex-1 font-normal text-xs text-center",
                    row: "flex w-full mt-2",
                    cell: "flex-1 text-center text-sm p-0 relative flex items-center justify-center bg-transparent focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 md:h-10 md:w-10 p-0 font-normal rounded-lg text-gray-800 dark:text-zinc-100 transition-colors [&:not([aria-selected])]:hover:bg-gray-100 dark:[&:not([aria-selected])]:hover:bg-zinc-800/80 cursor-pointer aria-selected:opacity-100",
                    day_selected: "!bg-orange !text-white font-bold hover:!bg-orange-600 hover:!text-white focus:!bg-orange focus:!text-white dark:!bg-orange dark:!text-white dark:hover:!bg-orange-600 shadow-sm",
                    day_today: "border-2 border-orange/80 dark:border-orange font-bold text-orange dark:text-orange bg-orange/5 dark:bg-orange/10 aria-selected:!bg-orange aria-selected:!text-white aria-selected:!border-orange",
                    day_disabled: "text-gray-300 dark:text-zinc-600 opacity-40 hover:bg-transparent dark:hover:bg-transparent cursor-not-allowed pointer-events-none",
                  }}
                />
              </div>

              <div className="mt-auto space-y-4">
                <div className="bg-orange/10 dark:bg-orange/15 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-zinc-400">Package Price</span>
                    <span className="font-semibold text-gray-900 dark:text-zinc-100">
                      LKR {pkg.pricing.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-orange font-bold text-lg">
                    <span>Advance (20%)</span>
                    <span>LKR {advanceAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={!selectedDate || isSubmitting}
                  className="w-full bg-orange hover:bg-orange-600 text-white font-bold py-6 text-lg rounded-full flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Redirecting to PayHere...</span>
                    </>
                  ) : selectedDate ? (
                    `Pay Advance for ${format(selectedDate, "MMM d, yyyy")}`
                  ) : (
                    "Select a Date to Continue"
                  )}
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
