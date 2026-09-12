"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VENDOR_APPROVAL_REQUESTS } from "@/graphql/queries";
import { RESPOND_PACKAGE_APPROVAL_REQUEST } from "@/graphql/mutations";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  MessageSquare,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";
import { formatCoupleName } from "@/utils/formatCoupleName";

interface ApprovalRequest {
  id: string;
  bookingDate: string;
  userNote?: string;
  status: string;
  vendorMessage?: string;
  approvedAt?: string;
  expiresAt?: string;
  isExpired: boolean;
  secondsRemaining?: number;
  createdAt: string;
  visitor?: {
    id: string;
    email: string;
    visitor_fname?: string;
    visitor_lname?: string;
    partner_fname?: string;
    phone?: string;
    profile_pic_url?: string;
  };
  package?: {
    id: string;
    name: string;
    pricing: number;
    offering?: {
      id: string;
      name: string;
    };
  };
}

const VendorApprovalRequests: React.FC = () => {
  const { vendor } = useVendorAuth();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [activeActionModal, setActiveActionModal] = useState<{
    request: ApprovalRequest;
    action: "approve" | "reject";
  } | null>(null);
  const [vendorMessage, setVendorMessage] = useState("");

  const { data, loading, error, refetch } = useQuery(
    GET_VENDOR_APPROVAL_REQUESTS,
    {
      variables: { vendorId: vendor?.id },
      skip: !vendor?.id,
      fetchPolicy: "cache-and-network",
    }
  );

  const [respondRequest, { loading: isResponding }] = useMutation(
    RESPOND_PACKAGE_APPROVAL_REQUEST,
    {
      onCompleted: () => {
        toast.success(
          activeActionModal?.action === "approve"
            ? "Request approved! The couple has 24 hours to pay advance."
            : "Request rejected."
        );
        setActiveActionModal(null);
        setVendorMessage("");
        refetch();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to respond to request");
      },
    }
  );

  const requests: ApprovalRequest[] = data?.getVendorApprovalRequests || [];
  const pendingCount = requests.filter(
    (r) => (r.status || "").toLowerCase() === "pending"
  ).length;
  const approvedCount = requests.filter(
    (r) => (r.status || "").toLowerCase() === "approved" && !r.isExpired
  ).length;

  const filteredRequests = requests.filter((r) => {
    const status = (r.status || "").toLowerCase();
    if (filter === "pending") return status === "pending";
    if (filter === "approved") return status === "approved" && !r.isExpired;
    return true;
  });

  const handleConfirmAction = async () => {
    if (!activeActionModal || !vendor?.id) return;
    await respondRequest({
      variables: {
        input: {
          requestId: activeActionModal.request.id,
          vendorId: vendor.id,
          action: activeActionModal.action,
          vendorMessage: vendorMessage.trim() || undefined,
        },
      },
    });
  };

  const formatRemaining = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "Expired";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m left`;
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[360px]">
        <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
          <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span>Loading approval requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center text-red-500 text-sm">
        Error loading approval requests: {error.message}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col h-full">
      {/* Header & Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-title text-xl sm:text-2xl font-bold text-gray-900">
              Approval Requests
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                {pendingCount} new
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            Review couples requesting prior approval for your wedding packages
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200/80">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "pending"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "approved"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No approval requests found</p>
          <p className="text-xs text-gray-400 max-w-xs mt-1">
            When couples select packages that require your prior approval, their date requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[580px] pr-1">
          {filteredRequests.map((req) => {
            const visitorName = formatCoupleName(req.visitor, "Couple");
            const status = (req.status || "").toLowerCase();

            return (
              <div
                key={req.id}
                className="border border-gray-200/80 rounded-2xl p-5 hover:border-orange/30 transition-all bg-white shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Requester & Details */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-orange/10 text-orange flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {visitorName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {visitorName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {req.visitor?.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} /> {req.visitor.email}
                            </span>
                          )}
                          {req.visitor?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {req.visitor.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                      <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Requested Package:</span>
                        <span className="font-bold text-gray-900">
                          {req.package?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-700">
                        <span className="font-medium">Pricing / Advance:</span>
                        <span>
                          LKR {req.package?.pricing.toLocaleString()} (Advance 20%:{" "}
                          <strong>
                            LKR {((req.package?.pricing || 0) * 0.2).toLocaleString()}
                          </strong>
                          )
                        </span>
                      </div>
                    </div>

                    {req.userNote && (
                      <div className="text-xs bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl text-amber-900 flex items-start gap-2">
                        <MessageSquare size={14} className="mt-0.5 flex-shrink-0 text-amber-700" />
                        <div>
                          <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-700">
                            Couple's Note:
                          </span>
                          <span>"{req.userNote}"</span>
                        </div>
                      </div>
                    )}

                    {req.vendorMessage && (
                      <div className="text-xs bg-blue-50/60 border border-blue-200/70 p-2.5 rounded-xl text-blue-900">
                        <span className="font-semibold block text-[11px] uppercase tracking-wider text-blue-700">
                          Your Note to Couple:
                        </span>
                        <span>"{req.vendorMessage}"</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Date & Status / Actions */}
                  <div className="flex flex-col md:items-end justify-between gap-3 md:min-w-[200px]">
                    <div className="bg-blue-50/80 border border-blue-200 px-3.5 py-2 rounded-xl text-center md:text-right">
                      <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                        Requested Event Date
                      </span>
                      <span className="text-sm font-bold text-blue-950 flex items-center gap-1.5 md:justify-end mt-0.5">
                        <CalendarIcon size={14} className="text-blue-600" />
                        {format(new Date(req.bookingDate), "EEEE, MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Clock size={12} /> Pending Your Review
                        </span>
                      )}
                      {status === "approved" && !req.isExpired && (
                        <div className="flex flex-col md:items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={12} /> Approved (Awaiting Payment)
                          </span>
                          <span className="text-[11px] font-semibold text-amber-600">
                            {formatRemaining(req.secondsRemaining)}
                          </span>
                        </div>
                      )}
                      {status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          <XCircle size={12} /> Declined
                        </span>
                      )}
                      {status === "purchased" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                          <CheckCircle2 size={12} /> Paid & Confirmed
                        </span>
                      )}
                      {(status === "expired" || (status === "approved" && req.isExpired)) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          <Clock size={12} /> 24h Window Expired
                        </span>
                      )}
                    </div>

                    {/* Action buttons for pending requests */}
                    {status === "pending" && (
                      <div className="flex items-center gap-2 pt-2 w-full md:w-auto">
                        <button
                          onClick={() =>
                            setActiveActionModal({ request: req, action: "approve" })
                          }
                          className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() =>
                            setActiveActionModal({ request: req, action: "reject" })
                          }
                          className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal (Approve or Reject with optional note) */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => {
                setActiveActionModal(null);
                setVendorMessage("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeActionModal.action === "approve"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {activeActionModal.action === "approve" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>
              <h3 className="font-title text-lg font-bold text-gray-900">
                {activeActionModal.action === "approve"
                  ? "Approve Booking Request"
                  : "Decline Booking Request"}
              </h3>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {activeActionModal.action === "approve" ? (
                <>
                  Approving this request for{" "}
                  <strong>
                    {format(
                      new Date(activeActionModal.request.bookingDate),
                      "MMM d, yyyy"
                    )}
                  </strong>{" "}
                  will notify the couple and unlock a <strong>24-hour payment window</strong> for them to pay the advance.
                </>
              ) : (
                <>
                  Are you sure you want to decline this request for{" "}
                  <strong>
                    {format(
                      new Date(activeActionModal.request.bookingDate),
                      "MMM d, yyyy"
                    )}
                  </strong>
                  ? The couple will be notified.
                </>
              )}
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-gray-700 block">
                Message to Couple (Optional)
              </label>
              <textarea
                value={vendorMessage}
                onChange={(e) => setVendorMessage(e.target.value)}
                placeholder={
                  activeActionModal.action === "approve"
                    ? "e.g. We are excited to be part of your special day! Looking forward to your confirmation."
                    : "e.g. Unfortunately we are unavailable on this date, but we have availability the following week."
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveActionModal(null);
                  setVendorMessage("");
                }}
                disabled={isResponding}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isResponding}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 ${
                  activeActionModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isResponding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : activeActionModal.action === "approve" ? (
                  "Confirm Approval"
                ) : (
                  "Confirm Decline"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApprovalRequests;
