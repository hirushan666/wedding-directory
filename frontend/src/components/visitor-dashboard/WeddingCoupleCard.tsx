import React from 'react';
import ProfilePicture from './ProfilePicture';
import { WeddingCoupleProps } from '@/types/weddingCoupleCardTypes';

const WeddingCoupleCard: React.FC<WeddingCoupleProps> = ({
  profilePic,
  setProfilePic,
  weddingDate,
  brideName,
  groomName,
}) => {
  // Calculate how many days are left until the wedding
  const calculateDaysLeft = () => {
    if (!weddingDate) return 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const timeDifference = wedding.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeft = calculateDaysLeft();

  const formattedWeddingDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full bg-white dark:bg-darkSurface shadow-sm rounded-2xl sm:rounded-3xl p-6 sm:p-7 border-2 border-orange/20">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        {/* Couple Names - Left column */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center px-2">
          {groomName && brideName ? (
            <>
              <span className="text-[11px] font-semibold text-orange uppercase tracking-wider block mb-1 font-body">
                The marriage of
              </span>
              <div className="flex flex-col items-center md:items-start">
                <h2 className="text-3xl lg:text-4xl font-marck text-gray-900 dark:text-zinc-100 capitalize tracking-wide break-words max-w-full">
                  {groomName}
                </h2>
                <span className="text-xs font-semibold text-orange my-1 tracking-widest uppercase font-body">
                  and
                </span>
                <h2 className="text-3xl lg:text-4xl font-marck text-gray-900 dark:text-zinc-100 capitalize tracking-wide break-words max-w-full">
                  {brideName}
                </h2>
              </div>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-orange uppercase tracking-wider block mb-1 font-body">
                Wedding Planning
              </span>
              <h2 className="text-3xl lg:text-4xl font-marck text-gray-900 dark:text-zinc-100 capitalize tracking-wide break-words max-w-full">
                {groomName || brideName ? `${groomName || brideName}'s Wedding` : "Our Wedding"}
              </h2>
            </>
          )}
        </div>

        {/* Countdown Container - Center column */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-orange/[0.04] dark:bg-orange/[0.08] border border-orange/20 rounded-2xl px-6 py-4 w-full max-w-[240px] shadow-xs">
            {weddingDate ? (
              <>
                <p className="text-gray-500 dark:text-zinc-400 text-xs font-medium mb-1 font-body">
                  Days until the wedding
                </p>
                <div className="text-3xl lg:text-4xl font-bold font-title text-orange">
                  {daysLeft}{" "}
                  <span className="text-sm font-normal text-gray-600 dark:text-zinc-400 font-body">
                    {daysLeft === 1 ? "day" : "days"}
                  </span>
                </div>
                {formattedWeddingDate && (
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 font-body">
                    Date: {formattedWeddingDate}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300 font-body py-2">
                Wedding date is not set
              </p>
            )}
          </div>
        </div>

        {/* Profile Picture Upload - Right column */}
        <div className="flex justify-center md:justify-end">
          <ProfilePicture profilePic={profilePic} setProfilePic={setProfilePic} />
        </div>
      </div>
    </div>
  );
};

export default WeddingCoupleCard;

