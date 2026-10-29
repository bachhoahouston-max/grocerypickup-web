import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoIosArrowForward } from "react-icons/io";

export const EXPLORE_HOUSTON_URL = "/explore-houston";

const StoreCommunityIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    {/* awning */}
    <path d="M8 10h48l4 12H4z" fill="#F97316" />
    <path d="M14 10h6l-2 12h-8zM26 10h6v12h-7zM38 10h6l2 12h-7zM50 10h6l4 12h-8z" fill="#FDE7D2" />
    <path d="M4 22h56v3a6 6 0 0 1-12 0 6 6 0 0 1-12 0 6 6 0 0 1-12 0 6 6 0 0 1-12 0 6 6 0 0 1-8 0z" fill="#EA580C" />
    {/* shop body */}
    <rect x="8" y="27" width="48" height="31" rx="2" fill="none" stroke="#2E7D32" strokeWidth="4" />
    {/* people */}
    <circle cx="32" cy="37" r="5" fill="#2E7D32" />
    <path d="M23 56a9 9 0 0 1 18 0z" fill="#2E7D32" />
    <circle cx="19" cy="41" r="4" fill="#2E7D32" />
    <path d="M12 56a7 7 0 0 1 13-3.5V56z" fill="#2E7D32" />
    <circle cx="45" cy="41" r="4" fill="#2E7D32" />
    <path d="M52 56a7 7 0 0 0-13-3.5V56z" fill="#2E7D32" />
  </svg>
);

export default function ExploreHoustonBanner() {
  const { t } = useTranslation();

  return (
    <div className="px-4 md:px-0 my-3 md:my-6">
      <Link
        href={EXPLORE_HOUSTON_URL}
        className="group flex items-center gap-3 md:gap-6 rounded-2xl border border-[#cfe8cf] bg-[#e8f6e6] px-3 py-3 md:px-8 md:py-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <StoreCommunityIcon className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0" />
        <div className="self-stretch w-px bg-[#bcdcbc]" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[17px] md:text-[26px] font-bold text-[#1f3d1f] leading-tight">
            {t("Explore Houston")}
          </h2>
          <p className="text-[12px] md:text-[16px] text-gray-600 leading-snug mt-0.5">
            {t("Local businesses and places recommended by the community")}
          </p>
        </div>
        <span className="flex items-center gap-1 flex-shrink-0 rounded-full bg-custom-green text-white text-[13px] md:text-[16px] font-semibold px-4 py-2 md:px-7 md:py-3 transition-transform group-hover:translate-x-0.5">
          {t("Explore")}
          <IoIosArrowForward className="w-4 h-4" />
        </span>
      </Link>
    </div>
  );
}
