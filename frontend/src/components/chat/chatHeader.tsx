import { useQuery } from "@apollo/client";
import { GET_OFFERING_DETAILS } from "@/graphql/queries";

interface ChatHeaderProps {
  visitor: {
    visitor_fname: string;
    partner_fname?: string;
    email: string;
    phone?: string;
  };
  offeringId?: string;
}

export default function ChatHeader({ visitor, offeringId }: ChatHeaderProps) {
  const { data: offeringData } = useQuery(GET_OFFERING_DETAILS, {
    variables: { id: offeringId },
    skip: !offeringId,
  });

  const offering = offeringData?.findOfferingById;
  const coupleName = `${visitor?.visitor_fname || ""}${
    visitor?.partner_fname ? ` & ${visitor.partner_fname}` : ""
  }`.trim() || "Wedding Couple";

  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-orange/10 text-orange font-bold text-sm sm:text-base rounded-full flex-shrink-0 shadow-xs">
          {coupleName[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-title font-bold text-base sm:text-lg text-gray-900 truncate leading-tight">
              {coupleName}
            </h2>
            {offering && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs bg-orange/10 text-orange font-semibold rounded-full truncate max-w-[200px]">
                {offering.name}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {visitor.email}
            {visitor.phone ? ` • ${visitor.phone}` : ""}
            {offering && ` • ${offering.category}`}
          </p>
        </div>
      </div>

      {offering && (
        <span className="sm:hidden px-2.5 py-0.5 text-[11px] bg-orange/10 text-orange font-semibold rounded-full flex-shrink-0">
          {offering.name}
        </span>
      )}
    </div>
  );
}
