"use client";

import Header from "@/components/shared/Headers/Header";
import React, { useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { useParams } from "next/navigation";
import {
  FIND_MY_VENDOR_BY_ID,
  FIND_SERVICE_BY_ID,
  FIND_PACKAGES_BY_OFFERING,
  GET_VISITOR_PAYMENTS,
  GET_VENDOR_BOOKED_DATES,
} from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import SocialIcons from "@/components/vendor-dashboard/dahboard-services/socialIcons";
import { FiEdit, FiMessageCircle } from "react-icons/fi";
import Reviews from "@/components/vendor-dashboard/dahboard-services/reviews/Reviews";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import Link from "next/link";
import LoaderQuantum from "@/components/shared/Loaders/LoaderQuantum";
import Comments from "@/components/vendor-dashboard/dahboard-services/reviews/Comments";
import WriteReview from "@/components/vendor-dashboard/dahboard-services/reviews/WriteReview";
import { useAuth } from "@/contexts/VisitorAuthContext";
import { ADD_TO_MY_VENDORS, REMOVE_FROM_MY_VENDORS, TRACK_PACKAGE_VIEW } from "@/graphql/mutations";
import toast from "react-hot-toast";
import { FaHeart } from "react-icons/fa";
import QuoteRequestWidget from "@/components/chat/QuoteRequestWidget";
import GoogleMapComponent from "@/components/vendor-dashboard/dahboard-services/Map";
import PortfolioImages from "@/components/vendor-dashboard/dahboard-services/PortfolioImages";
import request from "@/utils/request";
import PackageReservationModal from "@/components/shared/PackageReservationModal";
import { ensureSessionId } from "@/utils/session";
import ChatModal from "@/components/chat/ChatModal";

// Add this interface before the Service component
interface Package {
  id: string;
  name: string;
  description: string;
  pricing: number;
  features: string[];
  visible: boolean;
  requiresReservation: boolean;
  bookedDates?: string[];
}

interface PayHerePaymentResponse {
  actionUrl: string;
  payment: Record<string, string | boolean>;
}

const Service: React.FC = () => {
  const { vendor } = useVendorAuth();
  const { visitor } = useAuth();
  const params = useParams();
  const { id } = params;
  // const router = useRouter();

  const { loading, data } = useQuery(FIND_SERVICE_BY_ID, {
    variables: { id },
  });

  const queryError = useQuery(FIND_SERVICE_BY_ID, { variables: { id } }).error;

  const { data: packagesData } = useQuery(FIND_PACKAGES_BY_OFFERING, {
    variables: { offeringId: id },
    fetchPolicy: "cache-and-network",
  });

  // Get visitor's payments to check booked packages
  const { data: paymentsData } = useQuery(GET_VISITOR_PAYMENTS, {
    variables: { visitorId: visitor?.id },
    skip: !visitor?.id,
    fetchPolicy: "cache-and-network",
  });

  // Get vendor's booked dates for the calendar - MUST be at top level with all hooks
  const { data: bookedDatesData } = useQuery(GET_VENDOR_BOOKED_DATES, {
    variables: { vendorId: data?.findOfferingById?.vendor?.id },
    skip: !data?.findOfferingById?.vendor?.id,
    fetchPolicy: "cache-and-network",
  });

  // Check if offering is in visitor's my vendors
  const { loading: myVendorLoading, data: myVendorData } = useQuery(
    FIND_MY_VENDOR_BY_ID,
    {
      variables: {
        visitorId: visitor?.id,
        offeringId: id,
      },
      skip: !visitor,
    }
  );

  const [isInMyVendors, setIsInMyVendors] = useState(false);
  const [addToMyVendors] = useMutation(ADD_TO_MY_VENDORS);
  const [removeFromMyVendors] = useMutation(REMOVE_FROM_MY_VENDORS);
  const [trackPackageView] = useMutation(TRACK_PACKAGE_VIEW);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch client IP address on mount
  useEffect(() => {
    fetch('/api/client-ip')
      .then(res => res.json())
      .then(data => setClientIp(data.ip))
      .catch(() => setClientIp(null));
  }, []);

  // Track package views when packages are loaded
  useEffect(() => {
    if (packagesData?.findPackagesByOffering && !vendor && clientIp) {
      // Only track views for non-vendor visitors and when IP is available
      const sessionId = ensureSessionId();
      
      console.log('Tracking package views:', {
        packagesCount: packagesData.findPackagesByOffering.length,
        visitorId: visitor?.id,
        sessionId,
        ipAddress: clientIp,
      });
      
      // Track each package view (fire and forget)
      packagesData.findPackagesByOffering.forEach((pkg: Package) => {
        console.log('Tracking view for package:', pkg.id);
        trackPackageView({
          variables: {
            packageId: pkg.id,
            visitorId: visitor?.id || null,
            sessionId,
            ipAddress: clientIp,
          },
        })
          .then((result) => {
            console.log('Successfully tracked view for package:', pkg.id, result);
          })
          .catch((err) => {
            console.error("Failed to track package view:", pkg.id, err);
          });
      });
    }
  }, [packagesData, visitor, vendor, trackPackageView, clientIp]);

  // Check if a package is already booked by the visitor
  const isPackageBooked = (packageId: string) => {
    if (!paymentsData?.visitorPayments) return { booked: false, expired: false, bookingDate: null };
    
    const payment = paymentsData.visitorPayments.find(
      (p: any) => p.package.id === packageId && (p.status === 'completed' || p.status === 'pending')
    );
    
    if (!payment) return { booked: false, expired: false, bookingDate: null };
    
    // If there's a booking date, check if it has passed
    if (payment.bookingDate) {
      const bookingDate = new Date(payment.bookingDate);
      const now = new Date();
      const expired = bookingDate < now;
      return { booked: true, expired, bookingDate: bookingDate };
    }
    
    // If no booking date (standard package), it's booked and never expires
    return { booked: true, expired: false, bookingDate: null };
  };

  const handleBookingClick = (pkg: Package) => {
    if (!visitor) {
      toast.error("Please login as a user to book");
      return;
    }

    // Check if this package is already booked and not expired
    const bookingStatus = isPackageBooked(pkg.id);
    if (bookingStatus.booked && !bookingStatus.expired) {
      toast.error("You have already booked this package. You cannot book it again until your booking expires.");
      return;
    }

    setSelectedPackage(pkg);
  };

  // Update isInMyVendors when myVendorData changes
  useEffect(() => {
    if (myVendorData?.findMyVendorById) {
      setIsInMyVendors(true);
    }
  }, [myVendorData]);

  if (loading || myVendorLoading) return <LoaderQuantum />;
  if (queryError) return <p>Error: {queryError.message}</p>;

  const offering = data?.findOfferingById;
  const isVendorsOffering = offering?.vendor.id === vendor?.id;

  const handleHeartClick = async () => {
    if (!visitor) {
      toast.error("Please login as a user to save to your vendors");
      return;
    }

    if (!id) {
      toast.error("Service does not exist");
      return;
    }

    try {
      if (isInMyVendors) {
        const { data } = await removeFromMyVendors({
          variables: {
            visitorId: visitor.id,
            offeringId: id,
          },
        });

        if (data?.removeFromMyVendors) {
          setIsInMyVendors(false);
          toast.success("Removed from your vendors");
        } else {
          throw new Error("Failed to remove from vendors");
        }
      } else {
        const { data } = await addToMyVendors({
          variables: {
            visitorId: visitor.id,
            offeringId: id,
          },
        });

        if (data?.addToMyVendors) {
          setIsInMyVendors(true);
          toast.success(
            <div>
              Saved to your vendors! <br />
              <Link
                href={`/visitor-dashboard/my-vendors/${id}`}
                className="underline"
              >
                View your vendors
              </Link>
            </div>,
            {
              duration: 8000,
            }
          );
        } else {
          throw new Error("Failed to add to vendors");
        }
      }
    } catch {
      toast.error("Couldn't save to your favorites");
    }
  };

  const handlePayAdvance = async (amount: number, packageId: string, bookingDate?: Date) => {
    try {
      if (!visitor) {
        toast.error("Please login as a user to pay advance");
        return;
      }

      if (amount <= 0) {
        toast.error("Amount is too small for processing");
        return;
      }

      const { data } = await request.post<PayHerePaymentResponse>(
        "/api/payhere/create-payment",
        {
          amount,
          packageId,
          visitorId: visitor.id,
          vendorId: offering.vendor.id,
          offeringId: offering.id,
          bookingDate: bookingDate ? bookingDate.toISOString() : undefined,
          customer: {
            email: visitor.email,
            city: offering.vendor.city,
          },
        }
      );

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.actionUrl;

      Object.entries(data.payment).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Payment processing failed. Please try again.";
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <div className="bg-lightYellow font-body">
      <Header />
      <div className="container mx-auto justify-center py-2">
        <Link href="/vendor-dashboard">
          <button className="text-black font-body hover:text-gray-500 mr-2">
            &larr;
          </button>
          back
        </Link>

        {/* Replace the Portfolio Image Section with the new component */}
        <PortfolioImages
          banner={offering?.banner}
          photoShowcase={offering?.photo_showcase?.slice(0, 4) || []}
          hasMoreMedia={
            (offering?.photo_showcase && offering.photo_showcase.length > 4) ||
            offering?.video_showcase?.length > 0
          }
          totalMediaCount={
            (offering?.photo_showcase?.length || 0) +
            (offering?.video_showcase?.length || 0)
          }
          portfolioLink={`/services/${id}/gallery`}
        />

        {/* Add "See More" button if there are additional media items */}
        {((offering?.photo_showcase && offering.photo_showcase.length > 4) ||
          offering?.video_showcase?.length > 0) && (
            <div className="flex justify-center mt-2 mb-4"></div>
          )}

        <div className="flex flex-row gap-x-5 mt-4">
          <div className="w-3/4">
            {/* General Section */}
            <div className="bg-white rounded-2xl p-4 mb-4">
              <div className="flex flex-row">
                <div className="w-8/12 flex flex-col justify-between">
                  <div className="text-xl">
                    {offering?.vendor.busname || "Vendor name not available"}
                  </div>
                  <div className="flex flex-row text-3xl font-bold">
                    {offering?.name}
                    <div className="flex flex-row justify-center items-center">
                      {isVendorsOffering ? (
                        <Link href={`/services/edit/${offering?.id}`}>
                          <FiEdit className="text-2xl text-orange hover:text-black ml-1" />
                        </Link>
                      ) : (
                        <button onClick={handleHeartClick}>
                          {isInMyVendors ? (
                            <FaHeart className="text-red-500 hover:text-red-600 hover:cursor-pointer" />
                          ) : (
                            <CiHeart className="hover:text-red-500 hover:cursor-pointer" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>{offering?.vendor.city}</div>
                  
                  {/* Chat Button - Only show for visitors (not vendors viewing their own) */}
                  {!isVendorsOffering && visitor && (
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="mt-4 bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange/90 transition-colors flex items-center gap-2 w-fit"
                    >
                      <FiMessageCircle className="text-xl" />
                      Chat with Vendor
                    </button>
                  )}
                </div>
                <SocialIcons offering={offering} />
              </div>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-2xl p-4 flex flex-col">
              <div className="mb-3 text-2xl font-bold">About the Vendor</div>
              <div>
                <p>{offering.vendor.about || "About not available"}</p>
              </div>
              <hr className="border-t border-gray-300 my-4" />

              <div className="mb-3 text-2xl font-bold">Details</div>
              <div>
                <p>{offering.description || "Description not available"}</p>
              </div>
              <hr className="border-t border-gray-300 my-4" />

              {/* Packages Section */}
              {packagesData?.findPackagesByOffering.some(
                (pkg: Package) => pkg.visible
              ) && (
                  <>
                    <div className="mb-6 text-2xl font-bold flex items-center justify-between">
                      <span>Packages</span>
                      {isVendorsOffering && (
                        <Link href={`/services/edit/${offering?.id}`}>
                          <button className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-white hover:text-orange hover:border-2 hover:border-orange transition-colors font-bold">
                            Edit Packages
                          </button>
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {packagesData?.findPackagesByOffering
                        .filter((pkg: Package) => pkg.visible)
                        .map((pkg: Package) => (
                          <div
                            key={pkg.id}
                            className="bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden transition-all hover:shadow-lg flex flex-col h-full"
                          >
                            <div className="p-4 text-center bg-gray-50 border-b border-gray-200">
                              <h3 className="text-xl font-bold text-gray-800">
                                {pkg.name}
                              </h3>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                              <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-orange">
                                  <span className="text-sm align-top text-gray-600">
                                    LKR
                                  </span>{" "}
                                  {pkg.pricing.toLocaleString()}
                                </div>
                                <p className="text-gray-600 mt-2">
                                  {pkg.description}
                                </p>
                              </div>
                              <div className="space-y-3 mb-6 min-h-[100px]">
                                {pkg.features.map(
                                  (feature: string, idx: number) => (
                                    <div key={idx} className="flex items-start">
                                      <svg
                                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="text-gray-700">
                                        {feature}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="pt-4 border-t border-gray-100 mt-auto">
                                {(() => {
                                  const bookingStatus = isPackageBooked(pkg.id);
                                  
                                  if (bookingStatus.booked && !bookingStatus.expired) {
                                    return (
                                      <div className="w-full py-3 px-4 rounded-[22px] font-bold bg-green-100 text-green-800 border-2 border-green-500 flex flex-col items-center">
                                        <span className="flex items-center gap-2">
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          You Booked This Package
                                        </span>
                                        {bookingStatus.bookingDate && (
                                          <span className="text-sm font-normal mt-1">
                                            Booking Date: {bookingStatus.bookingDate.toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }

                                  if (bookingStatus.expired) {
                                    return (
                                      <div className="space-y-2">
                                        <div className="text-sm text-yellow-600 text-center mb-2">
                                          Previous booking expired. You can book again.
                                        </div>
                                        <button
                                          onClick={() => {
                                            if (!visitor) {
                                              toast.error("Please login as a user to pay advance");
                                              return;
                                            }

                                            if (pkg.requiresReservation) {
                                              handleBookingClick(pkg);
                                            } else {
                                              const advanceAmount: number = pkg.pricing * 0.2;
                                              handlePayAdvance(advanceAmount, pkg.id);
                                            }
                                          }}
                                          className={`w-full py-3 px-4 rounded-[22px] font-bold text-white hover:border-2 transition-colors flex flex-col items-center ${pkg.requiresReservation
                                            ? "bg-blue-600 hover:bg-white hover:text-blue-600 hover:border-blue-600"
                                            : "bg-orange hover:bg-white hover:text-orange hover:border-orange"
                                          }`}
                                        >
                                          {pkg.requiresReservation ? (
                                            <span>Book Again</span>
                                          ) : (
                                            <>
                                              <span>Pay 20% Advance</span>
                                              <span className="font-normal">
                                                LKR {(pkg.pricing * 0.2).toLocaleString()}
                                              </span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <button
                                      onClick={() => {
                                        if (!visitor) {
                                          toast.error("Please login as a user to pay advance");
                                          return;
                                        }

                                        if (pkg.requiresReservation) {
                                          handleBookingClick(pkg);
                                        } else {
                                          const advanceAmount: number = pkg.pricing * 0.2;
                                          handlePayAdvance(advanceAmount, pkg.id);
                                        }
                                      }}
                                      className={`w-full py-3 px-4 rounded-[22px] font-bold text-white hover:border-2 transition-colors flex flex-col items-center ${pkg.requiresReservation
                                        ? "bg-blue-600 hover:bg-white hover:text-blue-600 hover:border-blue-600"
                                        : "bg-orange hover:bg-white hover:text-orange hover:border-orange"
                                      }`}
                                    >
                                      {pkg.requiresReservation ? (
                                        <span>See Details & Book</span>
                                      ) : (
                                        <>
                                          <span>Pay 20% Advance</span>
                                          <span className="font-normal">
                                            LKR {(pkg.pricing * 0.2).toLocaleString()}
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <hr className="border-t border-gray-300 my-6" />
                  </>
                )}

              <div className="mb-3 text-2xl font-bold">Reviews</div>
              <div>
                <Reviews serviceId={offering?.id} />
              </div>

              {!isVendorsOffering ? (
                <div>
                  <WriteReview serviceId={offering?.id} vendorName={offering?.vendor?.busname} />
                </div>
              ) : null}

              <div>
                <Comments serviceId={offering?.id} />
              </div>
              <hr className="border-t border-gray-300 my-4" />
              <div className="mb-3 text-2xl font-bold">Contact</div>
              <div className="flex flex-col gap-y-1">
                <div>Email: {offering.bus_email || "Email not available"}</div>
                <div>
                  Phone number:{" "}
                  {offering.bus_phone || "Phone number not available"}
                </div>
              </div>
              <hr className="border-t border-gray-300 my-4" />
              <div className="mb-3 text-2xl font-bold">Location</div>
              <div className="mb-3 text-2xl font-bold">
                <GoogleMapComponent serviceId={offering?.id} />
              </div>
            </div>
          </div>

          <div className="w-1/4 sticky top-20">
            <QuoteRequestWidget
              vendorId={offering?.vendor?.id}
              offeringId={
                typeof params.id === "string" ? params.id : params.id[0]
              }
            />
          </div>
        </div>
      </div>

      {selectedPackage && (
        <PackageReservationModal
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          pkg={{
            ...selectedPackage,
            bookedDates: bookedDatesData?.getVendorBookedDates || []
          }}
          onPay={(date) => {
            const advanceAmount = selectedPackage.pricing * 0.2;
            handlePayAdvance(advanceAmount, selectedPackage.id, date);
          }}
          visitorId={visitor?.id}
          offeringId={offering?.id}
        />
      )}

      {/* Chat Modal */}
      {visitor && offering && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          visitorId={visitor.id}
          offeringId={offering.id}
          vendorName={offering.vendor?.busname || "Vendor"}
          offeringName={offering.name || "Service"}
        />
      )}
    </div>
  );
};

export default Service;
