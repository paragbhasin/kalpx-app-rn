import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  PlaneLanding,
  Plus,
  Star,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/ui";
import { FacilitatorCard } from "./FacilitatorCard";
import retreatImg from "../../../../mobile/assets/retreat/retreat1.jpg";
import retreatImg2 from "../../../../mobile/assets/retreat/retreat2.jpg";

type TabId =
  | "summary"
  | "facilitator"
  | "packages"
  | "policies"
  | "tips"
  | "addons"
  | "address"
  | "reviews";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "summary", label: "Summary of Retreats" },
  { id: "facilitator", label: "Facilitator Information" },
  { id: "packages", label: "Package Details" },
  { id: "policies", label: "Policies" },
  { id: "tips", label: "Tips and Advisory" },
  { id: "addons", label: "Add Ons" },
  { id: "address", label: "Address Details" },
  { id: "reviews", label: "Reviews" },
];

const packages = [
  {
    name: "Advance Package",
    price: "₹10,000/-",
    popular: true,
    inclusions: [
      "Meals Included",
      "3 Days",
      "Breakfast, Lunch, Dinner Included",
      "For 1 person only",
    ],
  },
  {
    name: "Beginner Friendly",
    price: "₹3,300/-",
    popular: false,
    inclusions: [
      "Meals Included",
      "5 Days",
      "Breakfast, Lunch, Dinner Included",
      "For 2 person only",
    ],
  },
];

const policies = [
  "A deposit is required to confirm your booking.",
  "The remaining amount must be paid before the retreat start date.",
  "Cancellations made after this period may result in partial or no refund.",
];

const tips = [...policies];

const addons = [
  {
    name: "Airport Pickup",
    description: "Comfortable Airport Pickup",
    price: "₹4000/-",
    icon: <PlaneLanding size={16} />,
  },
  {
    name: "Gluten Free Meal",
    description: "Comfortable Airport Pickup",
    price: "₹4000/-",
    icon: <Plus size={16} />,
  },
];

const reviews = [
  {
    user: "Ramesh khair",
    date: "2 days ago",
    comment: "Amzing Experince enjoyed every day here. Teacher is very Good",
    images: [retreatImg, retreatImg2],
  },
];

export function RetreatDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [imgIndex, setImgIndex] = useState(0);
  const [retreat] = useState({
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description:
      "This retreat is designed to offer a structured and comfortable experience focused on mindful living and personal wellness journey that helps you to find peace and rejuvenation.",
  });
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const gallery = useMemo(
    () => [retreatImg, retreatImg2, retreatImg, retreatImg2, retreatImg, retreatImg2],
    [],
  );
  const currentImage = gallery[imgIndex];

  function nextImage() {
    setImgIndex((prev) => (prev + 1) % gallery.length);
  }

  function prevImage() {
    setImgIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  }

  function scrollToSection(id: TabId) {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (!element) return;
    const headerHeight = 120;
    const offset =
      element.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }

  function goToPackageDetails(packageName: string) {
    const packageId = packageName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/en/retreats/${slug || "rejuvenating-yoga-ayurvedic-retreat"}/package/${packageId}`);
  }

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY + 150;
      for (const tab of tabs) {
        const element = document.getElementById(tab.id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const absoluteBottom = rect.bottom + window.scrollY;
        if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
          setActiveTab(tab.id);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const content = isDesktop ? (
    <div style={desktopWrapStyle}>
      <div style={desktopSpaceStyle}>
        <div style={desktopTopGalleryStyle}>
          <div style={desktopMainImageCellStyle}>
            <img src={gallery[0]} style={galleryImageStyle} alt="Main" />
          </div>
          <div style={desktopRightGalleryColStyle}>
            <div style={desktopSmallImageStyle}>
              <img src={gallery[1] || gallery[0]} style={galleryImageStyle} alt="Top Right" />
            </div>
            <div style={{ ...desktopSmallImageStyle, marginTop: 8 }}>
              <img src={gallery[2] || gallery[0]} style={galleryImageStyle} alt="Bottom Right" />
            </div>
          </div>
        </div>

        <div style={desktopBottomGalleryStyle}>
          {[gallery[3], gallery[4]].map((img, idx) => (
            <div key={idx} style={desktopBottomGalleryCellStyle}>
              <img src={img || gallery[0]} style={galleryImageStyle} alt={`Bottom ${idx + 1}`} />
            </div>
          ))}
          <div style={{ ...desktopBottomGalleryCellStyle, position: "relative" }}>
            <img src={gallery[5] || gallery[0]} style={galleryImageStyle} alt="Bottom 3" />
            <div style={overlayCountStyle}>10+</div>
          </div>
        </div>

        <div style={desktopContentGridStyle}>
          <div style={desktopLeftColumnStyle}>
            <section style={sectionStackStyle}>
              <h1 style={desktopPageTitleStyle}>
                {retreat.title || "Rejuvenating yoga & Ayurvedic Retreat"}
              </h1>
              <p style={desktopLeadStyle}>
                A gentle 7-day wellness journey designed to help you pause,
                reset your mind, and reconnect with yourself. Through mindful
                practices, guided reflection, and moments of intentional rest,
                this retreat supports clarity, balance, and inner calm at a
                natural, unhurried pace.
              </p>
            </section>

            <section style={sectionStackStyle}>
              <h2 style={sectionHeadingStyle}>Your Guides on This Journey</h2>
              <div style={desktopGuidesRowStyle}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={desktopGuideCardWrapStyle}>
                    <FacilitatorCard />
                  </div>
                ))}
              </div>
            </section>

            <section style={sectionStackStyle}>
              <h2 style={sectionHeadingStyle}>Address</h2>
              <div style={addressCardStyle}>
                <div style={addressMapStyle}>
                  <img
                    src="https://maps.googleapis.com/maps/api/staticmap?center=11.53,76.04&zoom=13&size=1000x400&key=MAPS_KEY"
                    style={galleryImageStyle}
                    alt="Map"
                  />
                </div>
                <div style={addressBodyStyle}>
                  <p style={addressTextStyle}>
                    KalpX Wellness Retreat, Vythiri Forest Road, Wayanad, Kerala
                    – 673576, India
                  </p>
                  <div style={addressInfoGridStyle}>
                    <div>
                      <h4 style={miniCapsStyle}>Nearest Airport</h4>
                      <p style={miniBodyStyle}>Kerala Airport</p>
                    </div>
                    <div>
                      <h4 style={miniCapsStyle}>Tips and Noted</h4>
                      <p style={miniBodyStyle}>
                        1. Bus Location is near from Airport about 2km
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div style={desktopTwoSectionWrapStyle}>
              <section style={sectionStackStyle}>
                <h2 style={sectionHeadingStyle}>Policies</h2>
                <ul style={simpleListStyle}>
                  {policies.map((p) => (
                    <li key={p} style={listItemStyle}>
                      <Check size={14} color="#43BC6C" style={{ marginTop: 2 }} />
                      <span style={listTextStyle}>{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section style={sectionStackStyle}>
                <h2 style={sectionHeadingStyle}>Tips & Advisory</h2>
                <ul style={simpleListStyle}>
                  {tips.map((t) => (
                    <li key={t} style={tipItemStyle}>
                      <div style={tipBulletStyle} />
                      <span style={listTextStyle}>{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section style={sectionStackStyle}>
              <h2 style={sectionHeadingStyle}>Add ons</h2>
              <div style={addonsListStyle}>
                {addons.map((addon) => (
                  <div key={addon.name} style={desktopAddonStyle}>
                    <div style={desktopAddonLeftStyle}>
                      <div style={desktopAddonIconTileStyle}>{addon.icon}</div>
                      <div>
                        <h4 style={desktopAddonNameStyle}>{addon.name}</h4>
                        <p style={desktopAddonDescStyle}>{addon.description}</p>
                      </div>
                    </div>
                    <div style={desktopAddonPriceStyle}>{addon.price}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={sectionStackStyle}>
              <h2 style={sectionHeadingStyle}>Reviews</h2>
              <div style={desktopReviewsStackStyle}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={desktopReviewCardStyle}>
                    <div style={desktopReviewTopStyle}>
                      <div style={desktopReviewPersonStyle}>
                        <div style={desktopReviewInitialStyle}>R</div>
                        <div>
                          <h4 style={desktopReviewNameStyle}>Ramesh khair</h4>
                          <p style={desktopReviewTimeStyle}>2 days ago</p>
                        </div>
                      </div>
                      <div style={desktopReviewStarsStyle}>
                        {Array.from({ length: 5 }).map((__, index) => (
                          <Star key={index} size={12} color="#D4A017" fill="#D4A017" />
                        ))}
                      </div>
                    </div>
                    <p style={desktopReviewTextStyle}>
                      Amzing Experince enjoyed every day here. Teacher is very Good
                    </p>
                    <div style={desktopReviewImagesStyle}>
                      {[gallery[0], gallery[1]].map((img, idx) => (
                        <img key={idx} src={img || gallery[0]} style={desktopReviewImageStyle} alt="" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside style={desktopRightColumnStyle}>
            <div style={desktopSidebarStickyStyle}>
              <div style={desktopSidebarCardStyle}>
                <h2 style={desktopSidebarHeadingStyle}>Packages</h2>
                {packages.map((pkg) => (
                  <div key={pkg.name} style={desktopPackageCardStyle}>
                    {pkg.popular ? <div style={desktopPopularBadgeStyle}>Most Popular</div> : null}
                    <div style={desktopPackageHeaderStyle}>
                      <h3 style={desktopPackageTitleStyle}>{pkg.name}</h3>
                      <span style={desktopPackagePriceStyle}>{pkg.price}</span>
                    </div>
                    <ul style={desktopPackageListStyle}>
                      {pkg.inclusions.map((inc) => (
                        <li key={inc} style={desktopPackageItemStyle}>
                          <Check size={12} color="#43BC6C" style={{ marginTop: 2 }} />
                          <span style={desktopPackageTextStyle}>{inc}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      style={desktopBookButtonStyle}
                      onClick={() => goToPackageDetails(pkg.name)}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  ) : (
    <div style={mobilePageStyle}>
      <section style={mobileHeroSectionStyle}>
        <button type="button" onClick={() => navigate(-1)} style={heroBackButtonStyle}>
          <ArrowLeft size={18} color="#fff" />
        </button>

        <div style={mobileHeroImageWrapStyle}>
          <img src={currentImage} style={mobileHeroImageStyle} alt="Retreat Hero" />
          <button type="button" onClick={prevImage} style={{ ...heroNavButtonStyle, left: 16 }}>
            <ChevronLeft size={12} color="#000" />
          </button>
          <button type="button" onClick={nextImage} style={{ ...heroNavButtonStyle, right: 16 }}>
            <ChevronRight size={12} color="#000" />
          </button>
          <div style={heroDotsStyle}>
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIndex(i)}
                style={mobileDotStyle(imgIndex === i)}
              />
            ))}
          </div>
        </div>
      </section>

      <main style={mobileMainWrapStyle}>
        <h1 style={mobileMainTitleStyle}>
          {retreat.title || "Rejuvenating yoga & Ayurvedic Retreat"}
        </h1>

        <div style={mobileTabsShellStyle}>
          <div style={mobileTabsRowStyle}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                style={{
                  ...mobileTabButtonStyle,
                  color: activeTab === tab.id ? "#000" : "#707070",
                }}
              >
                {tab.label}
                {activeTab === tab.id ? <div style={mobileActiveLineStyle} /> : null}
              </button>
            ))}
          </div>
        </div>

        <div style={mobileSectionsStackStyle}>
          <section id="summary" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Summary of Retreats</h2>
            <div style={mobileSummaryTextWrapStyle}>
              <p style={mobileSummaryTextStyle}>
                {retreat.description ||
                  "This retreat is designed to offer a structured and comfortable experience focused on mindful living and personal wellness journey that helps you to find peace and rejuvenation."}
                <span style={mobileMoreStyle}>More</span>
              </p>
            </div>
          </section>

          <section id="facilitator" style={mobileSectionStyle}>
            <div style={mobileSectionHeaderRowStyle}>
              <h2 style={mobileFacilitatorTitleStyle}>Your Guides On This Journey</h2>
              <button type="button" style={mobileViewAllStyle}>
                View all
              </button>
            </div>
            <FacilitatorCard />
          </section>

          <section id="packages" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Package Details</h2>
            <div style={mobilePackagesGridStyle}>
              {packages.map((pkg) => (
                <div key={pkg.name} style={mobilePackageCardStyle}>
                  {pkg.popular ? <div style={mobilePopularBadgeStyle}>Most Popular</div> : null}
                  <div style={mobilePackageHeaderStyle}>
                    <h3 style={mobilePackageTitleStyle}>{pkg.name}</h3>
                    <span style={mobilePackagePriceStyle}>{pkg.price}</span>
                  </div>
                  <ul style={mobilePackageListStyle}>
                    {pkg.inclusions.map((inc) => (
                      <li key={inc} style={mobilePackageItemStyle}>
                        <div style={mobilePackageCheckWrapStyle}>
                          <Check size={10} color="#43BC6C" />
                        </div>
                        <span style={mobilePackageTextStyle}>{inc}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    style={mobileBookButtonStyle}
                    onClick={() => goToPackageDetails(pkg.name)}
                  >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
          </section>

          <section id="policies" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Policies</h2>
            <ul style={mobilePolicyListStyle}>
              {policies.map((policy) => (
                <li key={policy} style={mobilePolicyItemStyle}>
                  <div style={mobilePolicyCheckWrapStyle}>
                    <Check size={10} color="#43BC6C" />
                  </div>
                  <span style={mobilePolicyTextStyle}>{policy}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="tips" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Tips & Advisory</h2>
            <ul style={mobileTipsListStyle}>
              {tips.map((tip) => (
                <li key={tip} style={mobileTipItemStyle}>
                  <div style={mobileTipBulletStyle} />
                  <span style={mobileTipTextStyle}>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="addons" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Add Ons</h2>
            <div style={mobileAddonsGridStyle}>
              {addons.map((addon) => (
                <div key={addon.name} style={mobileAddonCardStyle}>
                  <div style={mobileAddonLeftStyle}>
                    <div style={mobileAddonIconWrapStyle}>{addon.icon}</div>
                    <div>
                      <h4 style={mobileAddonTitleStyle}>{addon.name}</h4>
                      <p style={mobileAddonDescStyle}>{addon.description}</p>
                    </div>
                  </div>
                  <div style={mobileAddonPriceStyle}>{addon.price}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="address" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Address Details</h2>
            <div style={mobileAddressGridStyle}>
              <div style={mobileAddressMapStyle}>
                <img
                  src="https://maps.googleapis.com/maps/api/staticmap?center=11.53,76.04&zoom=13&size=800x400&key=YOUR_API_KEY_HERE"
                  style={galleryImageStyle}
                  alt="Map"
                />
              </div>
              <div style={mobileAddressCardStyle}>
                <div style={mobileAddressTopStyle}>
                  <MapPin size={18} color="#D4A017" />
                  <p style={mobileAddressTextStyle}>
                    KalpX Wellness Retreat, Vythiri, Wayanad, Kerala - 673576
                  </p>
                </div>
                <div style={mobileAddressDividerStyle} />
                <h4 style={mobileAirportHeadingStyle}>Nearest Airport</h4>
                <p style={mobileAirportTextStyle}>Calicut International Airport (CCJ)</p>
                <p style={mobileAirportSubStyle}>Distance: 85km</p>
              </div>
            </div>
          </section>

          <section id="reviews" style={mobileSectionStyle}>
            <h2 style={mobileSectionHeadingStyle}>Reviews</h2>
            <div style={mobileReviewsGridStyle}>
              {reviews.map((review, i) => (
                <div key={i} style={mobileReviewCardStyle}>
                  <div style={mobileReviewTopStyle}>
                    <div style={mobileReviewPersonStyle}>
                      <div style={mobileReviewInitialStyle}>{review.user.charAt(0)}</div>
                      <div>
                        <h4 style={mobileReviewNameStyle}>{review.user}</h4>
                        <p style={mobileReviewDateStyle}>{review.date}</p>
                      </div>
                    </div>
                    <div style={mobileReviewStarsStyle}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={11} color="#D4A017" fill="#D4A017" />
                      ))}
                    </div>
                  </div>
                  <p style={mobileReviewCommentStyle}>{review.comment}</p>
                  {review.images?.length ? (
                    <div style={mobileReviewImagesStyle}>
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} style={mobileReviewImageStyle} alt="" />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );

  return <AppShell>{content}</AppShell>;
}

const desktopWrapStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
};

const desktopSpaceStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "20px 0",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopTopGalleryStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: 16,
};

const desktopMainImageCellStyle: CSSProperties = {
  gridColumn: "span 7 / span 7",
  height: 450,
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const desktopRightGalleryColStyle: CSSProperties = {
  gridColumn: "span 5 / span 5",
  display: "grid",
  gridTemplateRows: "1fr 1fr",
  height: "100%",
};

const desktopSmallImageStyle: CSSProperties = {
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(238,238,238,1)",
  height: 220,
};

const desktopBottomGalleryStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: 16,
  height: 250,
};

const desktopBottomGalleryCellStyle: CSSProperties = {
  gridColumn: "span 4 / span 4",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(238,238,238,1)",
};

const galleryImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const overlayCountStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 30,
  fontWeight: 700,
  cursor: "pointer",
};

const desktopContentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: 48,
  alignItems: "start",
};

const desktopLeftColumnStyle: CSSProperties = {
  gridColumn: "span 8 / span 8",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopRightColumnStyle: CSSProperties = {
  gridColumn: "span 4 / span 4",
  position: "sticky",
  top: 40,
  alignSelf: "start",
};

const sectionStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopPageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 800,
  color: "#000",
};

const desktopLeadStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.8,
  maxWidth: 960,
};

const sectionHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const desktopGuidesRowStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  overflowX: "auto",
  paddingBottom: 16,
  scrollbarWidth: "none",
};

const desktopGuideCardWrapStyle: CSSProperties = {
  minWidth: 350,
};

const addressCardStyle: CSSProperties = {
  borderRadius: 32,
  overflow: "hidden",
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const addressMapStyle: CSSProperties = {
  height: 200,
  background: "#f9fafb",
};

const addressBodyStyle: CSSProperties = {
  padding: 32,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  background: "#fff",
};

const addressTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.4,
};

const addressInfoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 32,
};

const miniCapsStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 12,
  fontWeight: 800,
  color: "#000",
  textTransform: "uppercase",
};

const miniBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const desktopTwoSectionWrapStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 48,
};

const simpleListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const listItemStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const tipItemStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const tipBulletStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#D4A017",
  marginTop: 8,
  flexShrink: 0,
};

const listTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const addonsListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const desktopAddonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 24,
  background: "#FDFCF9",
  border: "1px solid #F1EAD9",
  borderRadius: 16,
};

const desktopAddonLeftStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
};

const desktopAddonIconTileStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid #F1EAD9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#D4A017",
  flexShrink: 0,
};

const desktopAddonNameStyle: CSSProperties = {
  margin: "0 0 2px",
  fontSize: 15,
  fontWeight: 800,
  color: "#000",
};

const desktopAddonDescStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#707070",
  fontWeight: 500,
};

const desktopAddonPriceStyle: CSSProperties = {
  padding: "6px 16px",
  borderRadius: 999,
  border: "1px solid #D4A017",
  color: "#D4A017",
  fontWeight: 700,
  fontSize: 13,
};

const desktopReviewsStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopReviewCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 32,
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopReviewTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const desktopReviewPersonStyle: CSSProperties = {
  display: "flex",
  gap: 16,
};

const desktopReviewInitialStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#fcf8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#D4A017",
  fontWeight: 700,
  fontSize: 20,
};

const desktopReviewNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 800,
  color: "#000",
};

const desktopReviewTimeStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "#909090",
  fontWeight: 500,
};

const desktopReviewStarsStyle: CSSProperties = {
  display: "flex",
  gap: 4,
  color: "#D4A017",
};

const desktopReviewTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
};

const desktopReviewImagesStyle: CSSProperties = {
  display: "flex",
  gap: 16,
};

const desktopReviewImageStyle: CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: 16,
  objectFit: "cover",
};

const desktopSidebarStickyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopSidebarCardStyle: CSSProperties = {
  padding: 32,
  borderRadius: 32,
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 32,
};

const desktopSidebarHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const desktopPackageCardStyle: CSSProperties = {
  padding: 24,
  borderRadius: 16,
  border: "1px solid #f3f4f6",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopPopularBadgeStyle: CSSProperties = {
  position: "absolute",
  top: -12,
  right: 16,
  background: "#D4A017",
  color: "#fff",
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const desktopPackageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const desktopPackageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 800,
  color: "#000",
};

const desktopPackagePriceStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 800,
  color: "#D4A017",
};

const desktopPackageListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const desktopPackageItemStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
};

const desktopPackageTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
};

const desktopBookButtonStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  border: "none",
  cursor: "pointer",
};

const mobilePageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
};

const mobileHeroSectionStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: 225,
};

const heroBackButtonStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  left: 16,
  zIndex: 50,
  display: "flex",
  height: 40,
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.2)",
  color: "#fff",
  backdropFilter: "blur(8px)",
  border: "none",
  cursor: "pointer",
};

const mobileHeroImageWrapStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
};

const mobileHeroImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transition: "opacity 0.5s ease",
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
  zIndex: 10,
  border: "none",
  cursor: "pointer",
};

const heroDotsStyle: CSSProperties = {
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 8,
  zIndex: 10,
};

const mobileDotStyle = (active: boolean): CSSProperties => ({
  width: active ? 16 : 8,
  height: 8,
  borderRadius: 999,
  transition: "all 0.2s ease",
  background: active ? "#fff" : "rgba(255,255,255,0.5)",
  border: "none",
  cursor: "pointer",
});

const mobileMainWrapStyle: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "24px 8px",
  display: "flex",
  flexDirection: "column",
  gap: 32,
};

const mobileMainTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#000",
};

const mobileTabsShellStyle: CSSProperties = {
  position: "sticky",
  top: "var(--header-height)",
  zIndex: 30,
  background: "#fff",
  borderBottom: "1px solid #f3f4f6",
  marginLeft: -16,
  marginRight: -16,
  paddingLeft: 16,
  paddingRight: 16,
  overflowX: "auto",
  scrollbarWidth: "none",
};

const mobileTabsRowStyle: CSSProperties = {
  display: "flex",
  gap: 32,
  minWidth: "max-content",
};

const mobileTabButtonStyle: CSSProperties = {
  padding: "12px 0",
  fontSize: 14,
  fontWeight: 700,
  position: "relative",
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const mobileActiveLineStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 3,
  background: "#D4A017",
  borderRadius: 999,
};

const mobileSectionsStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileSectionStyle: CSSProperties = {
  scrollMarginTop: 128,
};

const mobileSectionHeadingStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const mobileSummaryTextWrapStyle: CSSProperties = {
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
  maxWidth: 960,
};

const mobileSummaryTextStyle: CSSProperties = {
  margin: 0,
};

const mobileMoreStyle: CSSProperties = {
  color: "#D4A017",
  fontWeight: 700,
  cursor: "pointer",
  marginLeft: 4,
};

const mobileSectionHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const mobileFacilitatorTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const mobileViewAllStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#707070",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const mobilePackagesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 24,
};

const mobilePackageCardStyle: CSSProperties = {
  position: "relative",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #EEEEEE",
  background: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
};

const mobilePopularBadgeStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  background: "#D4A017",
  color: "#fff",
  padding: "6px 16px",
  borderBottomLeftRadius: 12,
  borderTopRightRadius: 12,
  fontSize: 11,
  fontWeight: 700,
  zIndex: 10,
};

const mobilePackageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
  paddingRight: 16,
};

const mobilePackageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 19,
  fontWeight: 700,
  color: "#000",
};

const mobilePackagePriceStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#D4A017",
};

const mobilePackageListStyle: CSSProperties = {
  margin: "0 0 32px",
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  flex: 1,
};

const mobilePackageItemStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const mobilePackageCheckWrapStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "rgba(67,188,108,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
};

const mobilePackageTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const mobileBookButtonStyle: CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: 12,
  background: "#D4A017",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  boxShadow: "0 8px 18px rgba(212,160,23,0.15)",
  border: "none",
  cursor: "pointer",
};

const mobilePolicyListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  maxWidth: 640,
};

const mobilePolicyItemStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const mobilePolicyCheckWrapStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "1px solid #43BC6C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
};

const mobilePolicyTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
};

const mobileTipsListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  maxWidth: 640,
};

const mobileTipItemStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
};

const mobileTipBulletStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#D4A017",
  flexShrink: 0,
  marginTop: 8,
};

const mobileTipTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
};

const mobileAddonsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
};

const mobileAddonCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  borderRadius: 16,
  background: "#FDFCF9",
  border: "1px solid #F1EAD9",
  gap: 16,
};

const mobileAddonLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const mobileAddonIconWrapStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid #F1EAD9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#D4A017",
  flexShrink: 0,
};

const mobileAddonTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const mobileAddonDescStyle: CSSProperties = {
  margin: "2px 0 0",
  fontSize: 12,
  color: "#909090",
  fontWeight: 500,
};

const mobileAddonPriceStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "2px solid rgba(212,160,23,0.2)",
  color: "#D4A017",
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
};

const mobileAddressGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 24,
};

const mobileAddressMapStyle: CSSProperties = {
  position: "relative",
  height: 300,
  borderRadius: 24,
  overflow: "hidden",
  background: "#f3f4f6",
  boxShadow: "inset 0 2px 10px rgba(0,0,0,0.04)",
};

const mobileAddressCardStyle: CSSProperties = {
  padding: 24,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #EEEEEE",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const mobileAddressTopStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  marginBottom: 16,
};

const mobileAddressTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.4,
};

const mobileAddressDividerStyle: CSSProperties = {
  borderTop: "1px solid #f3f4f6",
  marginBottom: 16,
};

const mobileAirportHeadingStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 12,
  fontWeight: 700,
  color: "#909090",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const mobileAirportTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "#000",
};

const mobileAirportSubStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#707070",
};

const mobileReviewsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 32,
};

const mobileReviewCardStyle: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  border: "1px solid #EEEEEE",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const mobileReviewTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const mobileReviewPersonStyle: CSSProperties = {
  display: "flex",
  gap: 16,
};

const mobileReviewInitialStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#FDFCF9",
  border: "1px solid #F1EAD9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  fontWeight: 700,
  color: "#D4A017",
};

const mobileReviewNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const mobileReviewDateStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "#909090",
  fontWeight: 700,
};

const mobileReviewStarsStyle: CSSProperties = {
  display: "flex",
  gap: 2,
  color: "#D4A017",
};

const mobileReviewCommentStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
};

const mobileReviewImagesStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  paddingTop: 8,
};

const mobileReviewImageStyle: CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: 12,
  objectFit: "cover",
  border: "2px solid #fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};
