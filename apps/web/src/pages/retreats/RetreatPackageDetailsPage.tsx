import {
  ArrowLeft,
  Bed,
  BedDouble,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Map,
  Mountain,
  Plus,
  Umbrella,
  User,
  Wifi,
  X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/ui";
import { RetreatCard } from "./RetreatCard";
import retreatImg from "../../../../mobile/assets/retreat/retreat1.jpg";
import retreatImg2 from "../../../../mobile/assets/retreat/retreat2.jpg";

const dummyRetreats = [
  {
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description: "A gentle 7-day wellness journey designed to help you pause...",
    cheapest_price_minor: 1000000,
    rating_avg: 4.9,
    rating_count: 223,
    location: { city: "Kerala" },
    formatted_date_range: "20-20 Dec 2025",
  },
  {
    title: "Sattva Renewal Retreat",
    description: "A calming wellness retreat focused on balance...",
    cheapest_price_minor: 333000,
    rating_avg: 4.8,
    rating_count: 2230,
    location: { city: "Kerala" },
    formatted_date_range: "20-20 Dec 2025",
  },
  {
    title: "Ayura Serenity Retreat",
    description: "A holistic Ayurvedic retreat offering guided healing...",
    cheapest_price_minor: 2000000,
    rating_avg: 4.9,
    rating_count: 2233,
    location: { city: "Kerala" },
    formatted_date_range: "20-20 Dec 2025",
  },
];

const accFeatures = [
  { label: "Single", icon: <Bed size={15} /> },
  { label: "Queen", icon: <BedDouble size={15} /> },
  { label: "1 Person Only", icon: <User size={15} /> },
  { label: "20 sq.ft", icon: <Map size={15} /> },
  { label: "Free WiFi", icon: <Wifi size={15} /> },
  { label: "Beach View", icon: <Umbrella size={15} /> },
  { label: "Mountain View", icon: <Mountain size={15} /> },
];

const specialFeatures = [
  "Daily yoga sessions at sunrise, sunset, indoors, and outdoors — guided by certified yoga teachers and Ayurveda doctors.",
  "Ayurveda healing through personalized diet consultations and rejuvenating therapies.",
  "Aqua yoga sessions promoting gentle, water-supported movement and deep relaxation.",
  "Therapeutic yoga designed to relieve stress, back pain, digestive imbalances, and restore natural vitality.",
];

export function RetreatPackageDetailsPage() {
  const navigate = useNavigate();
  const { slug, packageId } = useParams();
  const [retreat] = useState({ title: "Rejuvenating yoga & Ayurvedic Retreat" });
  const [activeDay, setActiveDay] = useState<number | null>(1);
  const [accImgIndex, setAccImgIndex] = useState(0);
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const packageData = useMemo(() => {
    const key = packageId ?? "beginner-friendly";
    if (key === "advance-package") {
      return { name: "Advance Package", price: "10,000", deposit: "1,000" };
    }
    return { name: "Beginner Friendly", price: "3,300", deposit: "1,000" };
  }, [packageId]);

  const accGallery = useMemo(() => [retreatImg, retreatImg2], []);
  const currentAccImg = accGallery[accImgIndex];

  function goToBooking() {
    navigate(`/en/retreats/${slug || "rejuvenating-yoga-ayurvedic-retreat"}/book`);
  }

  function nextAccImg() {
    setAccImgIndex((prev) => (prev + 1) % accGallery.length);
  }

  function prevAccImg() {
    setAccImgIndex((prev) => (prev === 0 ? accGallery.length - 1 : prev - 1));
  }

  function toggleDay(day: number) {
    setActiveDay((prev) => (prev === day ? null : day));
  }

  function getScheduleText(time: string) {
    if (time === "Morning") {
      return "Yoga and meditation at the Indrayani River, led by the Sattvic";
    }
    if (time === "Afternoon") {
      return "Cultural workshop — Warli art and rangoli to connect with Pune's heritage";
    }
    return "Saree draping and aarti at Morya Gosavi Temple, dedicated to the 14th-century saint-poet";
  }

  const content = !isDesktop ? (
    <div style={mobilePageStyle}>
      <header style={mobileHeaderStyle}>
        <div style={mobileHeaderTopStyle}>
          <button type="button" onClick={() => navigate(-1)} style={mobileBackButtonStyle}>
            <ArrowLeft size={18} color="#000" />
          </button>
          <h1 style={mobileHeaderTitleStyle}>
            {retreat.title || "Rejuvenating yoga & Ayurvedic Retreat"}
          </h1>
        </div>

        <div style={mobileStaticTabsStyle}>
          {["Package Details", "Address Details", "Policies", "Tips and Advisory"].map((tab, idx) => (
            <button
              key={tab}
              type="button"
              style={{
                ...mobileStaticTabStyle,
                color: idx === 0 ? "#D4A017" : "#707070",
                borderBottom: idx === 0 ? "2px solid #D4A017" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={mobilePackageHeaderRowStyle}>
          <h2 style={mobilePackageNameHeadingStyle}>{packageData.name}</h2>
          <button type="button" onClick={() => navigate(-1)} style={mobileCloseButtonStyle}>
            <X size={14} color="#9ca3af" />
          </button>
        </div>
      </header>

      <main>
        <section style={mobileSectionPadStyle}>
          <div style={mobilePriceCardStyle}>
            <div style={mobileSmallMetaStyle}>From 22 Dec - 24 Dec (3 days/ 2 nights)</div>
            <div style={mobilePriceStackStyle}>
              <h2 style={mobileTotalPriceStyle}>
                Total Price:
                <span style={mobilePriceAccentStyle}>₹{packageData.price}</span>
                <span style={mobilePerPersonStyle}>per person</span>
              </h2>
              <p style={mobileDepositStyle}>
                Deposit : <span style={mobileDepositValueStyle}>₹{packageData.deposit}</span>
              </p>
            </div>
          </div>
        </section>

        <section style={mobileSectionPadStyle}>
          <div style={sectionBlockStyle}>
            <h3 style={mobileBlockTitleStyle}>Accommodation</h3>
            <div style={mobileCarouselStyle}>
              <img src={currentAccImg} style={fullImageStyle} alt="" />
              <button type="button" onClick={prevAccImg} style={{ ...heroNavButtonStyle, left: 12 }}>
                <ChevronLeft size={12} color="#000" />
              </button>
              <button type="button" onClick={nextAccImg} style={{ ...heroNavButtonStyle, right: 12 }}>
                <ChevronRight size={12} color="#000" />
              </button>
              <div style={heroDotsStyle}>
                {accGallery.map((_, i) => (
                  <div key={i} style={mobileMiniDotStyle(accImgIndex === i)} />
                ))}
              </div>
            </div>
            <div style={mobileFeaturesGridStyle}>
              {accFeatures.map((feat) => (
                <FeatureRow key={feat.label} icon={feat.icon} label={feat.label} />
              ))}
            </div>
          </div>
        </section>

        <Divider />

        <section style={mobileSectionPadStyle}>
          <div style={sectionBlockStyle}>
            <div style={mobileSubSectionStyle}>
              <h3 style={mobileBlockTitleStyle}>Who is these Retreats for</h3>
              <div>
                <h4 style={mobileLabelStyle}>Suitable for</h4>
                <p style={mobileValueTextStyle}>Single</p>
              </div>
              <div>
                <h4 style={mobileLabelStyle}>Recommended For</h4>
                <p style={mobileValueTextStyle}>Beginner, Intermediate, Advance</p>
              </div>
            </div>

            <div style={mobileSubSectionStyle}>
              <h3 style={mobileBlockTitleStyle}>Food & Dining</h3>
              <div>
                <h4 style={mobileLabelStyle}>Meal Type</h4>
                <p style={mobileValueTextStyle}>Ayurveda, Satvic</p>
              </div>
              <div>
                <h4 style={{ ...mobileLabelStyle, marginBottom: 8 }}>Included Meal</h4>
                <ul style={mobileChecksListStyle}>
                  {["Breakfast", "Lunch", "Dinner"].map((m) => (
                    <li key={m} style={mobileCheckItemStyle}>
                      <CheckBoxIcon color="#43BC6C" type="check" />
                      <span style={mobileCheckTextStyle}>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        <section style={mobileSectionPadStyle}>
          <div style={sectionBlockStyle}>
            <h3 style={mobileBlockTitleStyle}>Amenities</h3>
            <div>
              <h4 style={mobileMutedHeadingStyle}>What is Included</h4>
              <ul style={mobileChecksListStyle}>
                {["Daily Yoga Session", "Airport Pickup", "Workshop Material"].map((inc) => (
                  <li key={inc} style={mobileCheckItemStyle}>
                    <CheckBoxIcon color="#43BC6C" type="check" />
                    <span style={mobileCheckTextStyle}>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ paddingTop: 8 }}>
              <h4 style={mobileMutedHeadingStyle}>What is Excluded</h4>
              <ul style={mobileChecksListStyle}>
                {["Airfare", "Laundry", "Personal Expenses"].map((exc) => (
                  <li key={exc} style={mobileCheckItemStyle}>
                    <CheckBoxIcon color="#FF4D4D" type="x" />
                    <span style={mobileCheckTextStyle}>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Divider />

        <section style={mobileSectionPadStyle}>
          <div style={sectionBlockStyle}>
            <h3 style={mobileBlockTitleStyle}>Cancellation Policy</h3>
            <ul style={mobileBulletsListStyle}>
              <li style={mobileBulletLineStyle}><span style={mobileBulletCharStyle}>•</span>Free Cancellation before start of 30 days</li>
              <li style={mobileBulletLineStyle}><span style={mobileBulletCharStyle}>•</span>20% Deducted if cancelled after 30 days</li>
            </ul>
          </div>
        </section>

        <Divider />

        <section style={mobileSectionPadStyle}>
          <div style={sectionBlockStyle}>
            <h3 style={mobileBlockTitleStyle}>What Makes This Retreat Special</h3>
            <ul style={mobileSpecialListStyle}>
              {specialFeatures.map((spec, i) => (
                <li key={i} style={mobileSpecialItemStyle}>
                  <span style={mobileTinyBulletStyle}>•</span>
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Divider />

        <section style={mobileSectionPadStyle}>
          <div style={sectionBlockStyle}>
            <div style={scheduleHeaderStyle}>
              <h3 style={mobileBlockTitleStyle}>Schedule</h3>
              <span style={scheduleDaysTextStyle}>3 Days Plan</span>
            </div>
            <div style={scheduleCardsWrapStyle}>
              {[1, 2, 3].map((day) => (
                <div key={day} style={scheduleCardStyle}>
                  <button type="button" onClick={() => toggleDay(day)} style={scheduleToggleStyle}>
                    <div>
                      <span style={scheduleDayTagStyle}>Day {day}</span>
                      <h4 style={scheduleCardTitleStyle}>Spiritual Immersion & Cultural</h4>
                    </div>
                    <ChevronDown
                      size={12}
                      color="#9ca3af"
                      style={{ transform: activeDay === day ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  {activeDay === day ? (
                    <div style={scheduleExpandedStyle}>
                      {["Morning", "Afternoon", "Evening"].map((time) => (
                        <TimelineRow key={time} time={time} text={getScheduleText(time)} isLast={time === "Evening"} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={mobileBottomBarStyle}>
          <div>
            <p style={mobileBottomLabelStyle}>Total Price</p>
            <p style={mobileBottomValueStyle}>₹12000</p>
          </div>
          <button type="button" onClick={goToBooking} style={mobileBottomButtonStyle}>
            Book Now
          </button>
        </div>
      </main>
    </div>
  ) : (
    <div style={desktopPageStyle}>
      <div style={desktopSubHeaderStyle}>
        <div style={desktopSubHeaderInnerStyle}>
          <div style={desktopBackRowStyle}>
            <button type="button" onClick={() => navigate(-1)} style={desktopBackButtonStyle}>
              <ArrowLeft size={20} color="#000" />
            </button>
            <span style={desktopBackTitleStyle}>{packageData.name} Package</span>
          </div>
        </div>
      </div>

      <div style={desktopMainWrapStyle}>
        <div style={desktopGridStyle}>
          <div style={desktopLeftColStyle}>
            <section style={desktopSectionStyle}>
              <div style={desktopSectionTitleWrapStyle}>
                <h2 style={desktopSectionTitleStyle}>Accommodation</h2>
              </div>
              <div style={desktopHeroCardStyle}>
                <img src={retreatImg} style={desktopHeroImageStyle} alt="Main" />
                <div style={desktopFeaturesGridStyle}>
                  {accFeatures.map((feat) => (
                    <FeatureRow key={feat.label} icon={feat.icon} label={feat.label} desktop />
                  ))}
                </div>
              </div>
            </section>

            <div style={desktopDoubleGridStyle}>
              <div style={desktopSectionStyle}>
                <h2 style={desktopSectionTitleStyle}>Who is these Retreats for</h2>
                <div style={desktopInfoStackStyle}>
                  <div>
                    <h4 style={desktopMutedCapsStyle}>Suitable for</h4>
                    <p style={desktopStrongValueStyle}>Couple, Single, child</p>
                  </div>
                  <div>
                    <h4 style={desktopMutedCapsStyle}>Recommended For</h4>
                    <p style={desktopStrongValueStyle}>Beginner, Intermediate, Advance</p>
                  </div>
                </div>
              </div>

              <div style={desktopSectionStyle}>
                <h2 style={desktopSectionTitleStyle}>Food & Dining</h2>
                <div style={desktopInfoStackStyle}>
                  <div>
                    <h4 style={desktopMutedCapsStyle}>Meal Type</h4>
                    <p style={desktopStrongValueStyle}>Ayurveda</p>
                  </div>
                  <div>
                    <h4 style={desktopMutedCapsStyle}>Included Meal</h4>
                    <div style={desktopMealWrapStyle}>
                      {["Breakfast", "Lunch", "Dinner"].map((m) => (
                        <div key={m} style={desktopMealItemStyle}>
                          <Check size={14} color="#43BC6C" />
                          <span style={desktopMealTextStyle}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr style={desktopHrStyle} />

            <section style={desktopSectionStyle}>
              <h2 style={desktopSectionTitleStyle}>Amenities</h2>
              <div style={desktopDoubleGridStyle}>
                <div style={desktopInfoStackStyle}>
                  <h4 style={{ ...desktopMutedCapsStyle, color: "#D4A017" }}>What is Included</h4>
                  <ul style={desktopChecksListStyle}>
                    {["Daily Yoga Session", "Airport Pickup", "Workshop Material"].map((inc) => (
                      <li key={inc} style={desktopCheckItemStyle}>
                        <Check size={14} color="#43BC6C" />
                        <span style={desktopCheckTextStyle}>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={desktopInfoStackStyle}>
                  <h4 style={{ ...desktopMutedCapsStyle, color: "#FF4D4D" }}>What is Excluded</h4>
                  <ul style={desktopChecksListStyle}>
                    {["Airfare", "Laundry", "Personal Expenses"].map((exc) => (
                      <li key={exc} style={desktopCheckItemStyle}>
                        <X size={14} color="#FF4D4D" />
                        <span style={desktopCheckTextStyle}>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <hr style={desktopHrStyle} />

            <section style={desktopSectionStyle}>
              <h2 style={desktopSectionTitleStyle}>What Makes This Retreat Special</h2>
              <ul style={desktopSpecialListStyle}>
                {specialFeatures.map((spec) => (
                  <li key={spec} style={desktopSpecialItemStyle}>
                    <div style={desktopSpecialBulletStyle} />
                    <p style={desktopSpecialTextStyle}>{spec}</p>
                  </li>
                ))}
              </ul>
            </section>

            <hr style={desktopHrStyle} />

            <section style={desktopSectionStyle}>
              <div style={scheduleHeaderStyle}>
                <h2 style={desktopSectionTitleStyle}>Schedule</h2>
                <span style={scheduleDesktopDaysTextStyle}>3 Days Plan</span>
              </div>
              <div style={scheduleCardsWrapStyle}>
                {[1, 2, 3].map((day) => (
                  <div key={day} style={desktopScheduleCardStyle}>
                    <button type="button" onClick={() => toggleDay(day)} style={desktopScheduleToggleStyle}>
                      <div>
                        <span style={scheduleDayDesktopTagStyle}>Day {day}</span>
                        <h4 style={desktopScheduleTitleStyle}>Spiritual Immersion & Cultural</h4>
                      </div>
                      <ChevronDown
                        size={14}
                        color="#9ca3af"
                        style={{ transform: activeDay === day ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    {activeDay === day ? (
                      <div style={desktopScheduleExpandedStyle}>
                        {["Morning", "Afternoon", "Evening"].map((time) => (
                          <TimelineRow key={time} time={time} text={getScheduleText(time)} isLast={time === "Evening"} desktop />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside style={desktopRightColStickyStyle}>
            <div style={desktopPriceCardStyle}>
              <div style={desktopPriceHeaderStyle}>
                <h3 style={desktopPriceHeadingStyle}>Deposit</h3>
                <span style={desktopPriceAmountStyle}>{packageData.deposit}/-</span>
              </div>

              <div style={desktopPricePolicyBlockStyle}>
                <h4 style={desktopPriceMiniHeadingStyle}>Cancellation Policies</h4>
                <div style={desktopPolicyStackStyle}>
                  <div style={desktopPolicyRowStyle}>
                    <Check size={14} color="#38d0ee" style={{ marginTop: 2 }} />
                    <span style={desktopPolicyTextStyle}>Free Cancellation before start of 30 days</span>
                  </div>
                  <div style={desktopPolicyRowStyle}>
                    <Check size={14} color="#38d0ee" style={{ marginTop: 2 }} />
                    <span style={desktopPolicyTextStyle}>20% Deducted if cancelled after 30 days</span>
                  </div>
                </div>
              </div>

              <div style={desktopBreakupStyle}>
                <PriceLine label="Package Price" value={`₹${packageData.price}/-`} />
                <div style={desktopAddonBreakupWrapStyle}>
                  <span style={desktopPriceMiniHeadingStyle}>Add Ons</span>
                  <div style={desktopAddonBreakupRowStyle}>
                    <div style={desktopAddonBreakupLeftStyle}>
                      <div style={desktopAddonCheckOnStyle}>
                        <Check size={10} color="#fff" />
                      </div>
                      <span style={desktopAddonBreakupTextStyle}>Airport Pickup</span>
                    </div>
                    <span style={desktopAddonBreakupValueStyle}>₹4,000/-</span>
                  </div>
                  <div style={desktopAddonBreakupRowStyle}>
                    <div style={desktopAddonBreakupLeftStyle}>
                      <div style={desktopAddonCheckOffStyle} />
                      <span style={desktopAddonBreakupTextStyle}>Gluten Free Meal</span>
                    </div>
                    <span style={desktopAddonBreakupValueStyle}>₹2,000/-</span>
                  </div>
                </div>
                <PriceLine label="Taxes" value="₹330/-" />
                <div style={desktopTotalRowStyle}>
                  <span style={desktopTotalLabelStyle}>Total Price</span>
                  <span style={desktopTotalValueStyle}>₹9,630/-</span>
                </div>
              </div>

              <button type="button" onClick={goToBooking} style={desktopPrimaryCtaStyle}>
                Book Now
              </button>
            </div>

            <div style={desktopOtherPackagesCardStyle}>
              <h3 style={desktopPriceHeadingStyle}>See other packages</h3>
              <div style={desktopOtherPackagesStackStyle}>
                {[
                  {
                    name: "Beginner Friendly",
                    price: "₹3300/-",
                    inclusions: [
                      "3 day accommodation",
                      "Meals Included",
                      "2 Days/2 Nights",
                    ],
                  },
                  {
                    popularity: true,
                    name: "Advance Package",
                    price: "₹10000/-",
                    inclusions: [
                      "5 days accommodation",
                      "Meals Included",
                      "4 Days/4 nights",
                    ],
                  },
                ].map((pkg) => (
                  <div key={pkg.name} style={desktopOtherPkgItemStyle}>
                    {pkg.popularity ? <div style={desktopOtherPkgBadgeStyle}>Most Popular</div> : null}
                    <div style={desktopOtherPkgHeaderStyle}>
                      <h4 style={desktopOtherPkgTitleStyle}>{pkg.name}</h4>
                      <span style={desktopOtherPkgPriceStyle}>{pkg.price}</span>
                    </div>
                    <ul style={desktopOtherPkgListStyle}>
                      {pkg.inclusions.map((inc) => (
                        <li key={inc} style={desktopOtherPkgListItemStyle}>
                          <Check size={11} color="#43BC6C" style={{ marginTop: 2 }} />
                          <span style={desktopOtherPkgTextStyle}>{inc}</span>
                        </li>
                      ))}
                    </ul>
                    <button type="button" style={desktopOtherPkgButtonStyle}>
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div style={desktopRetreatsFooterStyle}>
          <h2 style={desktopSectionTitleStyle}>See other retreats</h2>
          <div style={desktopRetreatsGridStyle}>
            {dummyRetreats.map((retreat, idx) => (
              <RetreatCard key={idx} retreat={retreat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return <AppShell>{content}</AppShell>;
}

function FeatureRow({
  icon,
  label,
  desktop = false,
}: {
  icon: ReactNode;
  label: string;
  desktop?: boolean;
}) {
  return (
    <div style={{ ...featureRowStyle, gap: desktop ? 12 : 12 }}>
      <div style={featureIconStyle}>{icon}</div>
      <span style={desktop ? desktopFeatureTextStyle : featureTextStyle}>{label}</span>
    </div>
  );
}

function CheckBoxIcon({
  color,
  type,
}: {
  color: string;
  type: "check" | "x";
}) {
  return (
    <div style={{ ...smallCheckWrapStyle, borderColor: color }}>
      {type === "check" ? <Check size={10} color={color} /> : <X size={10} color={color} />}
    </div>
  );
}

function TimelineRow({
  time,
  text,
  isLast,
  desktop = false,
}: {
  time: string;
  text: string;
  isLast: boolean;
  desktop?: boolean;
}) {
  return (
    <div style={{ ...timelineRowStyle, paddingLeft: desktop ? 40 : 24 }}>
      <div
        style={{
          ...timelineDotStyle,
          width: desktop ? 16 : 12,
          height: desktop ? 16 : 12,
          left: 0,
          top: desktop ? 6 : 6,
        }}
      />
      {!isLast ? (
        <div
          style={{
            ...timelineLineStyle,
            left: desktop ? 7 : 5.5,
            top: desktop ? 20 : 16,
            height: desktop ? "calc(100% + 32px)" : "calc(100% + 8px)",
          }}
        />
      ) : null}
      <h5 style={desktop ? timelineTimeDesktopStyle : timelineTimeStyle}>{time}</h5>
      <p style={desktop ? timelineBodyDesktopStyle : timelineBodyStyle}>{text}</p>
    </div>
  );
}

function Divider() {
  return <div style={dividerStyle} />;
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={desktopPriceLineStyle}>
      <span style={desktopPriceLineLabelStyle}>{label}</span>
      <span style={desktopPriceLineValueStyle}>{value}</span>
    </div>
  );
}

const mobilePageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
};

const mobileHeaderStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "#fff",
  borderBottom: "1px solid #f3f4f6",
  padding: "8px 8px 0",
};

const mobileHeaderTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
};

const mobileBackButtonStyle: CSSProperties = {
  display: "flex",
  height: 40,
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const mobileHeaderTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const mobileStaticTabsStyle: CSSProperties = {
  display: "flex",
  gap: 32,
  overflowX: "auto",
  scrollbarWidth: "none",
  borderBottom: "1px solid #f9fafb",
};

const mobileStaticTabStyle: CSSProperties = {
  padding: "12px 0",
  fontSize: 14,
  fontWeight: 700,
  whiteSpace: "nowrap",
  background: "transparent",
  borderLeft: "none",
  borderRight: "none",
  borderTop: "none",
  cursor: "pointer",
};

const mobilePackageHeaderRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 0",
};

const mobilePackageNameHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: "#000",
};

const mobileCloseButtonStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#f9fafb",
  color: "#9ca3af",
  border: "none",
  cursor: "pointer",
};

const mobileSectionPadStyle: CSSProperties = {
  padding: 16,
};

const mobilePriceCardStyle: CSSProperties = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid #EEEEEE",
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileSmallMetaStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 700,
};

const mobilePriceStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const mobileTotalPriceStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  color: "#000",
};

const mobilePriceAccentStyle: CSSProperties = {
  color: "#D4A017",
  marginLeft: 4,
};

const mobilePerPersonStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  marginLeft: 4,
};

const mobileDepositStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const mobileDepositValueStyle: CSSProperties = {
  color: "#707070",
};

const sectionBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileBlockTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const mobileCarouselStyle: CSSProperties = {
  position: "relative",
  height: 220,
  borderRadius: 16,
  overflow: "hidden",
  background: "#f3f4f6",
};

const fullImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const heroNavButtonStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.8)",
  color: "#000",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  border: "none",
  cursor: "pointer",
};

const heroDotsStyle: CSSProperties = {
  position: "absolute",
  bottom: 12,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 6,
};

const mobileMiniDotStyle = (active: boolean): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: active ? "#fff" : "rgba(255,255,255,0.4)",
});

const mobileFeaturesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  rowGap: 16,
  paddingTop: 8,
};

const featureRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const featureIconStyle: CSSProperties = {
  color: "#707070",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const featureTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
};

const desktopFeatureTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 700,
};

const dividerStyle: CSSProperties = {
  height: 6,
  background: "#f9fafb",
  margin: "24px 0",
};

const mobileSubSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileLabelStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
};

const mobileValueTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const mobileChecksListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const mobileCheckItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const smallCheckWrapStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: "1px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const mobileCheckTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const mobileMutedHeadingStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 14,
  fontWeight: 700,
  color: "#707070",
};

const mobileBulletsListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const mobileBulletLineStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const mobileBulletCharStyle: CSSProperties = {
  color: "#000",
};

const mobileSpecialListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileSpecialItemStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
};

const mobileTinyBulletStyle: CSSProperties = {
  color: "#000",
  fontSize: 8,
  marginTop: 6,
};

const scheduleHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const scheduleDaysTextStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#707070",
};

const scheduleCardsWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const scheduleCardStyle: CSSProperties = {
  border: "1px solid #EEEEEE",
  borderRadius: 16,
  overflow: "hidden",
};

const scheduleToggleStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  background: "rgba(249,250,251,0.5)",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
};

const scheduleDayTagStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#D4A017",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: 4,
};

const scheduleCardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
};

const scheduleExpandedStyle: CSSProperties = {
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const timelineRowStyle: CSSProperties = {
  position: "relative",
};

const timelineDotStyle: CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
  border: "2px solid #D4A017",
  background: "#fff",
  zIndex: 10,
};

const timelineLineStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  background: "#F1EAD9",
};

const timelineTimeStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 13,
  fontWeight: 700,
  color: "#D4A017",
};

const timelineBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
};

const timelineTimeDesktopStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 14,
  fontWeight: 800,
  color: "#D4A017",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const timelineBodyDesktopStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
};

const mobileBottomBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 16px",
  marginBottom: 16,
  marginTop: 12,
};

const mobileBottomLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#9ca3af",
  fontWeight: 700,
  textTransform: "uppercase",
};

const mobileBottomValueStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 16,
  color: "#1f2937",
  fontWeight: 800,
};

const mobileBottomButtonStyle: CSSProperties = {
  background: "#D4A017",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 12,
  border: "none",
  cursor: "pointer",
};

const desktopPageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "rgba(253,252,249,0.3)",
};

const desktopSubHeaderStyle: CSSProperties = {
  background: "#fff",
  borderBottom: "1px solid #f3f4f6",
};

const desktopSubHeaderInnerStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "20px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const desktopBackRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 24,
};

const desktopBackButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#000",
};

const desktopBackTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const desktopMainWrapStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "20px 8px",
};

const desktopGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: 40,
  alignItems: "start",
};

const desktopLeftColStyle: CSSProperties = {
  gridColumn: "span 8 / span 8",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const desktopRightColStickyStyle: CSSProperties = {
  gridColumn: "span 4 / span 4",
  position: "sticky",
  top: 96,
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopSectionTitleWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopSectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const desktopHeroCardStyle: CSSProperties = {
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  border: "1px solid #f3f4f6",
  background: "#fff",
};

const desktopHeroImageStyle: CSSProperties = {
  width: "100%",
  height: 450,
  objectFit: "cover",
  display: "block",
};

const desktopFeaturesGridStyle: CSSProperties = {
  padding: 32,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  rowGap: 24,
};

const desktopDoubleGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 40,
  paddingTop: 16,
};

const desktopInfoStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopMutedCapsStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 12,
  fontWeight: 800,
  color: "#909090",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const desktopStrongValueStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#000",
  fontWeight: 800,
};

const desktopMealWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
};

const desktopMealItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const desktopMealTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#000",
  fontWeight: 700,
};

const desktopHrStyle: CSSProperties = {
  width: "100%",
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "8px 0 4px",
};

const desktopChecksListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopCheckItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const desktopCheckTextStyle: CSSProperties = {
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
};

const desktopSpecialListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const desktopSpecialItemStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
};

const desktopSpecialBulletStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#D4A017",
  marginTop: 10,
  flexShrink: 0,
};

const desktopSpecialTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.8,
};

const scheduleDesktopDaysTextStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#707070",
};

const desktopScheduleCardStyle: CSSProperties = {
  border: "1px solid #f3f4f6",
  borderRadius: 24,
  background: "#F8F8F8",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const desktopScheduleToggleStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  textAlign: "left",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const scheduleDayDesktopTagStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "#D4A017",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: 4,
};

const desktopScheduleTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#000",
};

const desktopScheduleExpandedStyle: CSSProperties = {
  padding: "8px 32px 32px",
  display: "flex",
  flexDirection: "column",
  gap: 32,
};

const desktopPriceCardStyle: CSSProperties = {
  padding: 20,
  borderRadius: 8,
  border: "1px solid #f3f4f6",
  background: "#fff",
  boxShadow: "0 24px 48px rgba(229,231,235,0.5)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopPriceHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
};

const desktopPriceHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#000",
};

const desktopPriceAmountStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: "#D4A017",
};

const desktopPricePolicyBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopPriceMiniHeadingStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#000",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const desktopPolicyStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const desktopPolicyRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
};

const desktopPolicyTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
};

const desktopBreakupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopPriceLineStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const desktopPriceLineLabelStyle: CSSProperties = {
  fontSize: 15,
  color: "#707070",
  fontWeight: 700,
};

const desktopPriceLineValueStyle: CSSProperties = {
  fontSize: 15,
  color: "#000",
  fontWeight: 800,
};

const desktopAddonBreakupWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const desktopAddonBreakupRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const desktopAddonBreakupLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const desktopAddonCheckOnStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 4,
  background: "#D4A017",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
};

const desktopAddonCheckOffStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 4,
  border: "2px solid #e5e7eb",
};

const desktopAddonBreakupTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const desktopAddonBreakupValueStyle: CSSProperties = {
  fontSize: 14,
  color: "#000",
  fontWeight: 700,
};

const desktopTotalRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 8,
};

const desktopTotalLabelStyle: CSSProperties = {
  fontSize: 18,
  color: "#000",
  fontWeight: 800,
};

const desktopTotalValueStyle: CSSProperties = {
  fontSize: 18,
  color: "#000",
  fontWeight: 800,
};

const desktopPrimaryCtaStyle: CSSProperties = {
  width: "100%",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 8,
  padding: "12px 16px",
  fontWeight: 800,
  fontSize: 18,
  boxShadow: "0 24px 48px rgba(212,160,23,0.3)",
  border: "none",
  cursor: "pointer",
};

const desktopOtherPackagesCardStyle: CSSProperties = {
  padding: 20,
  borderRadius: 8,
  border: "1px solid #f3f4f6",
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopOtherPackagesStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopOtherPkgItemStyle: CSSProperties = {
  padding: 12,
  borderRadius: 24,
  border: "1px solid #f3f4f6",
  position: "relative",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const desktopOtherPkgBadgeStyle: CSSProperties = {
  position: "absolute",
  top: -1,
  right: 7,
  background: "#D4A017",
  color: "#fff",
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const desktopOtherPkgHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

const desktopOtherPkgTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 800,
  color: "#000",
};

const desktopOtherPkgPriceStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: "#D4A017",
};

const desktopOtherPkgListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const desktopOtherPkgListItemStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
};

const desktopOtherPkgTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
};

const desktopOtherPkgButtonStyle: CSSProperties = {
  width: "100%",
  padding: "8px 16px",
  background: "#fff",
  border: "2px solid #F1EAD9",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 800,
  color: "#D4A017",
  cursor: "pointer",
};

const desktopRetreatsFooterStyle: CSSProperties = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopRetreatsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 40,
};
