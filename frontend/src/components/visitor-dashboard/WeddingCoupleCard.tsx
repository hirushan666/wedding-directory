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
    <div className="w-full bg-white shadow-md rounded-2xl p-6 border border-amber-100/60">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        {/* Couple Names - Left column */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center px-2">
          <p className="text-gray-500 mb-2 text-xs font-merriweather uppercase tracking-wider">
            The marriage of
          </p>
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl lg:text-4xl font-marck text-gray-900 capitalize tracking-wide break-words max-w-full">
              {brideName || 'Bride'}
            </h2>
            <span className="text-xs font-merriweather uppercase font-semibold text-orange my-1 tracking-widest">
              and
            </span>
            <h2 className="text-3xl lg:text-4xl font-marck text-gray-900 capitalize tracking-wide break-words max-w-full">
              {groomName || 'Groom'}
            </h2>
          </div>
        </div>

        {/* Countdown Container - Center column */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-lightYellow/90 border border-orange/20 rounded-2xl px-6 py-4 w-full max-w-[240px] shadow-sm">
            <p className="text-gray-600 text-xs font-merriweather mb-1">
              Days until the wedding
            </p>
            <div className="text-3xl lg:text-4xl font-bold font-title text-orange">
              {daysLeft} <span className="text-xl font-normal font-merriweather text-gray-700">{daysLeft === 1 ? 'day' : 'days'}</span>
            </div>
            {formattedWeddingDate && (
              <p className="text-[11px] text-gray-400 mt-1 font-body">
                {formattedWeddingDate}
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

