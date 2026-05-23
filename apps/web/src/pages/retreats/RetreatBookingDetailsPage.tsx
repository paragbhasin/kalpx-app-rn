import { Award, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Globe, MapPin, MessageCircle, Pencil, Plus, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/ui";
import retreatImg from "../../../../mobile/assets/retreat/retreat1.webp";
import hostImg from "../../../../mobile/assets/retreat/retreat2.webp";
import { FacilitatorCard } from "./FacilitatorCard";

const policies = [
  "A deposit is required to confirm your booking.",
  "The remaining amount must be paid before the retreat start date.",
  "Cancellations made after this period may result in partial or no refund.",
];

const pkgFeatures = [
  "Meals Included",
  "5 Days",
  "Brekfast, Lunch, Dinner Included",
  "Starting from 22 Dec - 26 Dec 2025",
];

const addons = [
  { name: "Airport Pickup", selected: true },
  { name: "Gluten Free Meal", selected: false },
];

export function RetreatBookingDetailsPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [currentImg, setCurrentImg] = useState(0);
  const [status] = useState("Confirmed");
  const [balanceLeft] = useState(8430);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [isEditingParticipant, setIsEditingParticipant] = useState(false);
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const images = useMemo(() => [retreatImg, retreatImg, retreatImg], []);
  const gallery = useMemo(
    () => [retreatImg, retreatImg, retreatImg, retreatImg, retreatImg, retreatImg],
    [],
  );

  function nextImg() {
    setCurrentImg((prev) => (prev + 1) % images.length);
  }

  function prevImg() {
    setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  const content = isDesktop ? (
    <main style={desktopMainStyle}>
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
          <div style={desktopBottomGalleryCellStyle}>
            <img src={gallery[3] || gallery[0]} style={galleryImageStyle} alt="Bottom 1" />
          </div>
          <div style={desktopBottomGalleryCellStyle}>
            <img src={gallery[4] || gallery[0]} style={galleryImageStyle} alt="Bottom 2" />
          </div>
          <div style={{ ...desktopBottomGalleryCellStyle, position: "relative" }}>
            <img src={gallery[5] || gallery[0]} style={galleryImageStyle} alt="Bottom 3" />
            <div style={overlayCountStyle}>10+</div>
          </div>
        </div>

        <div style={desktopContentGridStyle}>
          <div style={desktopLeftColumnStyle}>
            <section style={sectionStackStyle}>
              <h1 style={desktopPageTitleStyle}>Rejuvenating yoga & Ayurvedic Retreat</h1>
              <p style={desktopLeadStyle}>
                A gentle 7-day wellness journey designed to help you pause, reset
                your mind, and reconnect with yourself. Through mindful practices,
                guided reflection, and moments of intentional rest, this retreat
                supports clarity, balance, and inner calm at a natural, unhurried
                pace.
              </p>
            </section>

            <section style={sectionStackStyle}>
              <h2 style={sectionHeadingStyle}>Meet your host</h2>
              <div style={hostWrapStyle}>
                <div style={hostCardStyle}>
                  <div style={hostLeftColStyle}>
                    <img src={hostImg} style={hostAvatarStyle} alt="" />
                    <h3 style={hostNameStyle}>Riya Dyne</h3>
                    <p style={hostRoleStyle}>Meditation Teacher</p>
                  </div>

                  <div style={hostRightColStyle}>
                    <HostMeta icon={<Star size={14} color="#D4A017" fill="#D4A017" />} text="4.9" />
                    <hr style={hostHrStyle} />
                    <HostMeta icon={<MessageCircle size={14} color="#D4A017" />} text="76 Reviews" />
                    <hr style={hostHrStyle} />
                    <HostMeta icon={<Award size={14} color="#D4A017" />} text="10+ Exp" />
                  </div>
                </div>

                <div style={hostExtraStyle}>
                  <div style={hostTagRowStyle}>
                    {["Ayurvedi", "Meditation", "Yoga"].map((tag) => (
                      <span key={tag} style={hostTagStyle}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={hostLanguageRowStyle}>
                    <Globe size={14} color="#D4A017" />
                    <span style={hostLanguageTextStyle}>English, Hindi</span>
                  </div>
                  <p style={hostDescriptionStyle}>
                    Retreats are curated by certified wellness specialists with
                    10+ years of experience in yoga, meditation, and holistic
                    healing practices.
                  </p>
                </div>
              </div>
            </section>

            <section style={sectionStackStyle}>
              <h2 style={addressHeadingStyle}>Address</h2>
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
                    KalpX Wellness Retreat, Vythiri Forest Road, Wayanad, Kerala – 673576, India
                  </p>
                  <div style={addressInfoGridStyle}>
                    <div>
                      <h4 style={miniCapsStyle}>Nearest Airport</h4>
                      <p style={miniBodyStyle}>Kerala Airport</p>
                    </div>
                    <div>
                      <h4 style={miniCapsStyle}>Tips and Noted</h4>
                      <p style={miniBodyStyle}>1. Bus Location is near from Airport about 2km</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div style={desktopTwoSectionWrapStyle}>
              <section style={sectionStackStyle}>
                <h2 style={sectionHeadingStyle}>Policies</h2>
                <div style={policyListStyle}>
                  {policies.map((p) => (
                    <div key={p} style={policyRowStyle}>
                      <div style={policyIconWrapStyle}>
                        <Check size={10} color="#43BC6C" />
                      </div>
                      <p style={policyTextStyle}>{p}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section style={sectionStackStyle}>
                <h2 style={sectionHeadingStyle}>Tips & Advisory</h2>
                <ul style={tipsListStyle}>
                  {policies.map((p) => (
                    <li key={`tip-${p}`} style={tipsItemStyle}>
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section style={sectionStackStyle}>
              <h2 style={sectionHeadingStyle}>Add ons</h2>
              <div style={addonsListStyle}>
                {addons.map((addon) => (
                  <div key={addon.name} style={addonRowStyle}>
                    <div style={addonLeftStyle}>
                      <div style={addonIconTileStyle(addon.selected)}>
                        {addon.selected ? (
                          <Check size={14} color={addon.selected ? "#fff" : "#D4A017"} />
                        ) : (
                          <Plus size={14} color="#D4A017" />
                        )}
                      </div>
                      <div>
                        <h4 style={addonNameStyle}>{addon.name}</h4>
                        <p style={addonSubStyle}>Comfortable Airport Pickup</p>
                      </div>
                    </div>
                    <div style={addonPriceStyle}>₹4000/-</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={reviewsWrapStyle}>
              <h2 style={sectionHeadingStyle}>Reviews</h2>
              <div style={reviewsListStyle}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={reviewBlockStyle}>
                    <div style={reviewTopStyle}>
                      <div style={reviewPersonStyle}>
                        <div style={reviewInitialStyle}>R</div>
                        <div>
                          <h4 style={reviewNameStyle}>Ramesh khair</h4>
                          <p style={reviewTimeStyle}>2 days ago</p>
                        </div>
                      </div>
                      <div style={reviewStarsStyle}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={12} color="#D4A017" fill="#D4A017" />
                        ))}
                      </div>
                    </div>
                    <p style={reviewTextStyle}>
                      Amzing Experince enjoyed every day here. Teacher is very Good
                    </p>
                    <div style={reviewImagesStyle}>
                      <img src={images[0]} style={reviewThumbStyle} alt="" />
                      <img src={images[1]} style={reviewThumbStyle} alt="" />
                    </div>
                    {i < 3 ? <div style={reviewDividerStyle} /> : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={desktopRightColumnStyle}>
            <div style={stickyColumnStyle}>
              <div style={sidebarCardStyle}>
                <div style={sidebarInnerStyle}>
                  <h3 style={sidebarHeadingStyle}>Selected Package</h3>
                  <div style={selectedPkgBoxStyle}>
                    <div style={selectedPkgHeaderStyle}>
                      <h4 style={pkgTitleStyle}>Beginner Friendly</h4>
                      <span style={pkgPriceStyle}>₹3300/-</span>
                    </div>
                    <ul style={selectedPkgListStyle}>
                      {[
                        "3-day accommodation",
                        "Meals Included",
                        "3 Days/ 2 Nights",
                        "Breakfast, Lunch, Dinner Included",
                        "Starting from 22 Dec - 26 Dec 2025",
                      ].map((f) => (
                        <li key={f} style={selectedPkgItemStyle}>
                          <Check size={12} color="#43BC6C" />
                          <span style={selectedPkgItemTextStyle}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button type="button" style={selectedPkgButtonStyle}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              <div style={sidebarCardStyle}>
                <div style={sidebarInnerStyle}>
                  <h3 style={sidebarHeadingStyle}>Price Breakup</h3>
                  <div style={priceBreakdownStackStyle}>
                    <PriceRow label="Package Price" value="₹3300/-" />
                    <div style={priceSectionStyle}>
                      <span style={miniCapsDarkStyle}>Add Ons</span>
                      <div style={priceAddonRowStyle}>
                        <div style={priceAddonLeftStyle}>
                          <input type="checkbox" checked readOnly style={miniCheckboxStyle} />
                          <span style={priceAddonTextStyle}>Airport Pickup</span>
                        </div>
                        <span style={priceAddonValueStyle}>₹4000/-</span>
                      </div>
                      <div style={priceAddonRowStyle}>
                        <div style={priceAddonLeftStyle}>
                          <input type="checkbox" checked readOnly style={miniCheckboxStyle} />
                          <span style={priceAddonTextStyle}>Gluten Free Meal</span>
                        </div>
                        <span style={priceAddonValueStyle}>₹2000/-</span>
                      </div>
                    </div>
                    <PriceRow label="Deposit Paid" value="₹1,000/-" italic />
                    <PriceRow label="Taxes" value="₹330/-" />
                    <div style={totalPriceBoxStyle}>
                      <span style={totalLabelStyle}>Total Price</span>
                      <span style={totalValueStyle}>₹8430/-</span>
                    </div>
                  </div>
                  <div style={sidebarButtonsWrapStyle}>
                    <button type="button" style={makePaymentButtonStyle}>
                      Make Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/en/retreats/cancellation/${bookingId || "1"}`)}
                      style={cancelButtonStyle}
                    >
                      Cancel booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  ) : (
    <div style={mobilePageStyle}>
      <div style={mobileHeroStyle}>
        <button type="button" onClick={() => navigate(-1)} style={heroBackButtonStyle}>
          <ChevronLeft size={18} color="#fff" />
        </button>
        <img src={images[currentImg]} style={mobileHeroImageStyle} alt="" />
        <button type="button" onClick={prevImg} style={{ ...heroNavButtonStyle, left: 16 }}>
          <ChevronLeft size={12} color="#000" />
        </button>
        <button type="button" onClick={nextImg} style={{ ...heroNavButtonStyle, right: 16 }}>
          <ChevronRight size={12} color="#000" />
        </button>
        <div style={heroDotsStyle}>
          {images.map((_, i) => (
            <div key={i} style={heroDotStyle(currentImg === i)} />
          ))}
        </div>
      </div>

      <main style={mobileContentWrapStyle}>
        <h1 style={mobileHeadingStyle}>Rejuvenating yoga & Ayurvedic Retreat</h1>

        <section style={mobileSectionCardStyle}>
          <div style={mobileSectionHeaderStyle}>
            <h3 style={mobileSectionCapsStyle}>Summary of Retreats</h3>
          </div>
          <p style={mobileSummaryTextStyle(isSummaryExpanded)}>
            This retreat is designed to offer a structured and comfortable
            experience focused on mindful living. It combines traditional
            Ayurveda with modern luxury.
          </p>
          <button
            type="button"
            onClick={() => setIsSummaryExpanded((prev) => !prev)}
            style={mobileSummaryToggleStyle}
          >
            {isSummaryExpanded ? "Less Details" : "View Details"}
            <ChevronDown
              size={10}
              color="#1877F2"
              style={{
                transform: isSummaryExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {isSummaryExpanded ? (
            <div style={expandedSummaryStyle}>
              <div style={mobileInnerSectionStyle}>
                <div style={mobileSectionRowHeaderStyle}>
                  <h4 style={mobileSubHeadingStyle}>Your Guides on This Journey</h4>
                  <button type="button" style={mobileGhostActionStyle}>
                    View all
                  </button>
                </div>
                <FacilitatorCard />
              </div>

              <div style={mobileInnerSectionStyle}>
                <h4 style={mobileSubHeadingStyle}>Address</h4>
                <div style={mobileMapStyle}>
                  <img
                    src="https://maps.googleapis.com/maps/api/staticmap?center=11.53,76.04&zoom=13&size=600x300&key=MAPS_KEY"
                    style={galleryImageStyle}
                    alt="Map"
                  />
                </div>
                <p style={mobileBodyCopyStyle}>
                  KalpX Wellness Retreat, Vythiri Forest Road, Wayanad, Kerala - 673576, India
                </p>
                <div style={mobileInfoStackStyle}>
                  <div>
                    <h5 style={mobileMiniHeadingStyle}>Nearest Airport</h5>
                    <p style={mobileSmallCopyStyle}>Kerala Airport</p>
                  </div>
                  <div>
                    <h5 style={mobileMiniHeadingStyle}>Tips and Noted</h5>
                    <p style={mobileSmallCopyStyle}>
                      1. Bus Location is near from Airport about 2km
                    </p>
                  </div>
                </div>
              </div>

              <div style={mobileInnerSectionStyle}>
                <h4 style={mobileSubHeadingStyle}>Policies</h4>
                <ul style={mobilePolicyListStyle}>
                  {policies.map((p) => (
                    <li key={p} style={mobilePolicyItemStyle}>
                      <div style={mobilePolicyIconStyle}>
                        <Check size={10} color="#43BC6C" />
                      </div>
                      <span style={mobilePolicyTextStyle}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={mobileInnerSectionStyle}>
                <h4 style={mobileSubHeadingStyle}>Add Ons</h4>
                {addons.map((addon) => (
                  <div key={addon.name} style={mobileAddonRowStyle}>
                    <div style={mobileAddonLeftStyle}>
                      <div style={mobileAddonIconStyle}>
                        {addon.selected ? (
                          <Check size={10} color="#4b5563" />
                        ) : (
                          <Plus size={10} color="#4b5563" />
                        )}
                      </div>
                      <div>
                        <h5 style={mobileAddonNameStyle}>{addon.name}</h5>
                        <p style={mobileAddonSubStyle}>Comfortable Airport Pickup</p>
                      </div>
                    </div>
                    <div style={mobileAddonPriceStyle}>₹4000/-</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section style={mobileSectionCardStyle}>
          <div style={mobileSectionRowHeaderStyle}>
            <h3 style={mobileSectionCapsStyle}>Packages Selected</h3>
            <button type="button" onClick={() => setIsEditingPackage((prev) => !prev)} style={mobileEditButtonStyle}>
              <Pencil size={11} color="#707070" />
              Change
            </button>
          </div>

          <div style={mobilePackageStackStyle}>
            <div style={selectedMobilePackageStyle}>
              <div style={mobilePkgTitleRowStyle}>
                <div style={mobilePkgChoiceWrapStyle}>
                  <div style={mobilePkgRadioStyle}>
                    <div style={mobilePkgRadioInnerStyle} />
                  </div>
                  <h4 style={mobilePkgTitleStyle}>Beginner Friendly</h4>
                </div>
              </div>
              <p style={mobilePkgPriceStyle}>₹3300/-</p>
              <ul style={mobilePkgListStyle}>
                {pkgFeatures.map((f) => (
                  <li key={f} style={mobilePkgItemStyle}>
                    <Check size={12} color="#43BC6C" />
                    <span style={mobilePkgTextStyle}>{f}</span>
                  </li>
                ))}
              </ul>
              <button type="button" style={mobilePkgViewStyle}>
                View Details
              </button>
            </div>

            {isEditingPackage ? (
              <>
                <div style={editingPkgStyle}>
                  <div style={mobilePkgTitleRowStyle}>
                    <div style={mobilePkgChoiceWrapStyle}>
                      <div style={mobilePkgRadioInactiveStyle} />
                      <h4 style={mobilePkgTitleStyle}>Advance Package</h4>
                    </div>
                  </div>
                  <p style={editingPkgPriceStyle}>₹3300/-</p>
                  <ul style={mobilePkgListStyle}>
                    {pkgFeatures.map((f) => (
                      <li key={f} style={mobilePkgItemStyle}>
                        <Check size={12} color="#d1d5db" />
                        <span style={mobilePkgTextStyle}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" style={mobilePackageLinkStyle}>
                    View Details
                  </button>
                </div>

                <div style={mobileSaveRowStyle}>
                  <button type="button" onClick={() => setIsEditingPackage(false)} style={mobilePrimarySaveStyle}>
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditingPackage(false)} style={mobileSecondarySaveStyle}>
                    Cancel
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section style={mobileSectionCardStyle}>
          <div style={mobileSectionRowHeaderStyle}>
            <h3 style={mobileSectionCapsStyle}>Participant Details</h3>
            <button type="button" onClick={() => setIsEditingParticipant((prev) => !prev)} style={mobileEditButtonStyle}>
              <Pencil size={11} color="#707070" />
              Change
            </button>
          </div>

          {!isEditingParticipant ? (
            <div style={participantCardStyle}>
              <img
                src="https://ui-avatars.com/api/?name=Vikram+Mishra&background=F1EAD9&color=D4A017"
                style={participantAvatarStyle}
                alt=""
              />
              <div>
                <h4 style={participantNameStyle}>Vikram Mishra</h4>
                <p style={participantTextStyle}>+91 9345344562</p>
                <p style={participantTextStyle}>vikrammishra@gmail.com</p>
              </div>
            </div>
          ) : (
            <div style={participantEditCardStyle}>
              {["First Name", "Last Name", "Email Id", "Mobile Number"].map((field) => (
                <div key={field} style={participantFieldWrapStyle}>
                  <label style={participantFieldLabelStyle}>{field}</label>
                  <input
                    type="text"
                    placeholder={`Enter your ${field.toLowerCase()}`}
                    style={participantInputStyle}
                  />
                </div>
              ))}
              <div style={mobileSaveRowStyle}>
                <button type="button" onClick={() => setIsEditingParticipant(false)} style={mobilePrimarySaveStyle}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditingParticipant(false)} style={mobileSecondarySaveStyle}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section style={mobileSectionCardStyle}>
          <div style={mobileSectionRowHeaderStyle}>
            <h3 style={mobileSectionCapsStyle}>Retreats Dates</h3>
            <button type="button" style={mobileEditButtonStyle}>
              <Pencil size={11} color="#707070" />
              Change
            </button>
          </div>
          <div style={datesCardStyle}>
            <div style={datesTopRowStyle}>
              <div style={dateColumnStyle}>
                <span style={dateTopLabelStyle}>Check in</span>
                <p style={dateStrongStyle}>22 Dec 2025</p>
                <p style={dateSmallStyle}>at 12.00 am</p>
              </div>
              <div style={dateArrowWrapStyle}>
                <ChevronRight size={14} color="#d1d5db" />
              </div>
              <div style={{ ...dateColumnStyle, textAlign: "right" }}>
                <span style={dateTopLabelStyle}>Check out</span>
                <p style={dateStrongStyle}>25 Dec 2025</p>
                <p style={dateSmallStyle}>at 12.00 am</p>
              </div>
            </div>
            <div style={datesBottomStyle}>
              <span style={datesBottomTextStyle}>3 Days/ 2 Nights</span>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate(`/en/retreats/cancellation/${bookingId || "1"}`)}
          style={mobileCancelBookingStyle}
        >
          Cancel Booking
        </button>
      </main>

      {balanceLeft > 0 ? (
        <div style={mobileStickyPaymentWrapStyle}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={mobileStickyLabelStyle}>Total Amount Left</span>
            <span style={mobileStickyValueStyle}>₹{balanceLeft.toLocaleString("en-IN")}</span>
          </div>
          <button type="button" style={mobileStickyButtonStyle}>
            Make Payment
          </button>
        </div>
      ) : (
        <div style={mobileStickyStatusWrapStyle}>
          <span
            style={{
              ...mobileStickyStatusTextStyle,
              color:
                status === "Confirmed"
                  ? "#43BC6C"
                  : status === "Cancelled"
                    ? "#FF4D4D"
                    : "#D4A017",
            }}
          >
            Booking {status}
          </span>
        </div>
      )}
    </div>
  );

  return <AppShell>{content}</AppShell>;
}

function HostMeta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={hostMetaRowStyle}>
      {icon}
      <span style={hostMetaTextStyle}>{text}</span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  italic = false,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div style={priceRowStyle}>
      <span style={priceLabelStyle}>{label}</span>
      <span style={{ ...priceValueStyle, fontStyle: italic ? "italic" : "normal" }}>
        {value}
      </span>
    </div>
  );
}

const desktopMainStyle: CSSProperties = {
  margin: "0 auto",
  maxWidth: 1400,
  padding: "32px 16px",
  display: "block",
};

const desktopSpaceStyle: CSSProperties = {
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
  gap: 48,
};

const desktopRightColumnStyle: CSSProperties = {
  gridColumn: "span 4 / span 4",
};

const stickyColumnStyle: CSSProperties = {
  position: "sticky",
  top: 32,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const sectionStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopPageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
  letterSpacing: "-0.01em",
};

const desktopLeadStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.8,
};

const sectionHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const hostWrapStyle: CSSProperties = {
  display: "flex",
  gap: 40,
};

const hostCardStyle: CSSProperties = {
  width: 300,
  background: "#fff",
  borderRadius: 16,
  padding: 12,
  border: "1px solid #f3f4f6",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  display: "flex",
  gap: 16,
};

const hostLeftColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const hostAvatarStyle: CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #F1EAD9",
  marginBottom: 16,
};

const hostNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.15,
};

const hostRoleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#707070",
  fontWeight: 700,
  fontStyle: "italic",
};

const hostRightColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 12,
  flex: 1,
};

const hostMetaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const hostMetaTextStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#9ca3af",
};

const hostHrStyle: CSSProperties = {
  width: "100%",
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: 0,
};

const hostExtraStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const hostTagRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  paddingTop: 8,
};

const hostTagStyle: CSSProperties = {
  padding: "8px 20px",
  borderRadius: 999,
  background: "#FCF8F0",
  border: "1px solid #F1EAD9",
  fontSize: 13,
  fontWeight: 700,
  color: "#D4A017",
};

const hostLanguageRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#D4A017",
};

const hostLanguageTextStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#707070",
};

const hostDescriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
  maxWidth: 640,
};

const addressHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
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
  lineHeight: 1.5,
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
  gridTemplateColumns: "1fr",
  gap: 48,
};

const policyListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const policyRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const policyIconWrapStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "1px solid #43BC6C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const policyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
};

const tipsListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const tipsItemStyle: CSSProperties = {
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
};

const addonsListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 16,
};

const addonRowStyle: CSSProperties = {
  padding: 24,
  borderRadius: 16,
  background: "#FBFBFB",
  border: "1px solid #f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
};

const addonLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const addonIconTileStyle = (selected: boolean): CSSProperties => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: selected ? "#D4A017" : "#FCF8F0",
  color: selected ? "#fff" : "#D4A017",
});

const addonNameStyle: CSSProperties = {
  margin: "0 0 2px",
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const addonSubStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  fontStyle: "italic",
};

const addonPriceStyle: CSSProperties = {
  padding: "8px 24px",
  borderRadius: 999,
  border: "1px solid #D4A017",
  color: "#D4A017",
  fontWeight: 700,
  fontSize: 15,
};

const reviewsWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 32,
  paddingTop: 32,
  borderTop: "1px solid #f9fafb",
};

const reviewsListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 40,
};

const reviewBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const reviewTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const reviewPersonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const reviewInitialStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#FCF8F0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#D4A017",
  fontWeight: 700,
  fontSize: 18,
  border: "1px solid #F1EAD9",
};

const reviewNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const reviewTimeStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "#707070",
  fontWeight: 500,
};

const reviewStarsStyle: CSSProperties = {
  display: "flex",
  gap: 4,
};

const reviewTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#333",
  fontWeight: 500,
  lineHeight: 1.7,
};

const reviewImagesStyle: CSSProperties = {
  display: "flex",
  gap: 16,
};

const reviewThumbStyle: CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: 12,
  objectFit: "cover",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const reviewDividerStyle: CSSProperties = {
  borderBottom: "1px solid #f3f4f6",
  paddingTop: 20,
};

const sidebarCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  border: "1px solid #f3f4f6",
  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const sidebarInnerStyle: CSSProperties = {
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const sidebarHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const selectedPkgBoxStyle: CSSProperties = {
  background: "#FCF8F0",
  padding: 16,
  borderRadius: 16,
  border: "1px solid #F1EAD9",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const selectedPkgHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

const pkgTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: "#000",
};

const pkgPriceStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#D4A017",
};

const selectedPkgListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const selectedPkgItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const selectedPkgItemTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#555",
  fontWeight: 500,
};

const selectedPkgButtonStyle: CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  border: "none",
  cursor: "pointer",
};

const priceBreakdownStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const priceRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const priceLabelStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#707070",
};

const priceValueStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const priceSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const miniCapsDarkStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#000",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const priceAddonRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingLeft: 16,
  gap: 16,
};

const priceAddonLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const priceAddonTextStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#707070",
};

const priceAddonValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
  textAlign: "right",
};

const miniCheckboxStyle: CSSProperties = {
  width: 16,
  height: 16,
  accentColor: "#D4A017",
};

const totalPriceBoxStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#FBFBFB",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #f3f4f6",
};

const totalLabelStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#000",
};

const totalValueStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#D4A017",
  letterSpacing: "-0.02em",
};

const sidebarButtonsWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  paddingTop: 16,
};

const makePaymentButtonStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 16,
  fontSize: 16,
  fontWeight: 900,
  boxShadow: "0 18px 30px rgba(212,160,23,0.3)",
  border: "none",
  cursor: "pointer",
};

const cancelButtonStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "#707070",
  color: "#fff",
  borderRadius: 16,
  fontSize: 15,
  fontWeight: 700,
  boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
  border: "none",
  cursor: "pointer",
  opacity: 0.9,
};

const mobilePageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
  paddingBottom: 104,
};

const mobileHeroStyle: CSSProperties = {
  position: "relative",
  height: 250,
  width: "100%",
  overflow: "hidden",
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

const mobileHeroImageStyle: CSSProperties = {
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
  borderRadius: "50%",
  background: "rgba(255,255,255,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#000",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  border: "none",
  cursor: "pointer",
};

const heroDotsStyle: CSSProperties = {
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 6,
};

const heroDotStyle = (active: boolean): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: active ? "#fff" : "rgba(255,255,255,0.4)",
  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
});

const mobileContentWrapStyle: CSSProperties = {
  maxWidth: 672,
  margin: "0 auto",
  padding: 8,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  boxSizing: "border-box",
};

const mobileHeadingStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const mobileSectionCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #f9fafb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileSectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const mobileSectionCapsStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#707070",
  textTransform: "uppercase",
};

const mobileSummaryTextStyle = (expanded: boolean): CSSProperties => ({
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.7,
  display: expanded ? "block" : "-webkit-box",
  WebkitLineClamp: expanded ? "unset" : 2,
  WebkitBoxOrient: expanded ? undefined : "vertical",
  overflow: expanded ? "visible" : "hidden",
});

const mobileSummaryToggleStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  color: "#1877F2",
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
};

const expandedSummaryStyle: CSSProperties = {
  paddingTop: 16,
  borderTop: "1px solid #f9fafb",
  display: "flex",
  flexDirection: "column",
  gap: 32,
  marginTop: 16,
};

const mobileInnerSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileSectionRowHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const mobileSubHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
};

const mobileGhostActionStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#707070",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};


const mobileMapStyle: CSSProperties = {
  borderRadius: 16,
  overflow: "hidden",
  height: 150,
  background: "#f3f4f6",
  marginBottom: 16,
};

const mobileBodyCopyStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.5,
};

const mobileInfoStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  paddingTop: 8,
};

const mobileMiniHeadingStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 13,
  fontWeight: 700,
  color: "#000",
};

const mobileSmallCopyStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
};

const mobilePolicyListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const mobilePolicyItemStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const mobilePolicyIconStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "1px solid #43BC6C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
};

const mobilePolicyTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
};

const mobileAddonRowStyle: CSSProperties = {
  padding: 16,
  borderRadius: 12,
  background: "#F8F8F8",
  border: "1px solid #f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const mobileAddonLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const mobileAddonIconStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 4,
  background: "#F1EAD9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const mobileAddonNameStyle: CSSProperties = {
  margin: "0 0 2px",
  fontSize: 13,
  fontWeight: 700,
  color: "#000",
};

const mobileAddonSubStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: "#707070",
  fontWeight: 500,
};

const mobileAddonPriceStyle: CSSProperties = {
  padding: "4px 12px",
  borderRadius: 999,
  border: "1px solid #D4A017",
  color: "#D4A017",
  fontSize: 11,
  fontWeight: 700,
  flexShrink: 0,
};

const mobileEditButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#707070",
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};

const mobilePackageStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const selectedMobilePackageStyle: CSSProperties = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid #D4A017",
  background: "#fff",
  position: "relative",
};

const mobilePkgTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
};

const mobilePkgChoiceWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const mobilePkgRadioStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "2px solid #D4A017",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const mobilePkgRadioInnerStyle: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#D4A017",
};

const mobilePkgRadioInactiveStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "2px solid #e5e7eb",
  flexShrink: 0,
};

const mobilePkgTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const mobilePkgPriceStyle: CSSProperties = {
  margin: "0 0 16px 32px",
  fontSize: 20,
  fontWeight: 700,
  color: "#D4A017",
};

const editingPkgPriceStyle: CSSProperties = {
  margin: "0 0 16px 32px",
  fontSize: 20,
  fontWeight: 700,
  color: "#707070",
};

const mobilePkgListStyle: CSSProperties = {
  margin: "0 0 24px 32px",
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const mobilePkgItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const mobilePkgTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
};

const mobilePkgViewStyle: CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  border: "1px solid #D4A017",
  color: "#D4A017",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  background: "#fff",
  cursor: "pointer",
};

const editingPkgStyle: CSSProperties = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid #f3f4f6",
  background: "#fff",
  opacity: 0.8,
};

const mobilePackageLinkStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#1877F2",
  fontSize: 13,
  fontWeight: 700,
  paddingLeft: 32,
  cursor: "pointer",
};

const mobileSaveRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  paddingTop: 8,
};

const mobilePrimarySaveStyle: CSSProperties = {
  flex: 1,
  padding: "12px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const mobileSecondarySaveStyle: CSSProperties = {
  flex: 1,
  padding: "12px 16px",
  background: "#fff",
  color: "#D4A017",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  border: "1px solid #D4A017",
  cursor: "pointer",
};

const participantCardStyle: CSSProperties = {
  background: "#FBFBFB",
  borderRadius: 16,
  padding: 8,
  display: "flex",
  gap: 16,
  alignItems: "center",
};

const participantAvatarStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  objectFit: "cover",
};

const participantNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const participantTextStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "#707070",
  fontWeight: 500,
};

const participantEditCardStyle: CSSProperties = {
  background: "#FBFBFB",
  borderRadius: 16,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const participantFieldWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const participantFieldLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#707070",
};

const participantInputStyle: CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #f3f4f6",
  background: "#fff",
  fontSize: 13,
  boxSizing: "border-box",
  outline: "none",
};

const datesCardStyle: CSSProperties = {
  background: "#FBFBFB",
  borderRadius: 16,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const datesTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  paddingBottom: 16,
  borderBottom: "1px solid #f3f4f6",
  gap: 12,
};

const dateColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const dateTopLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#707070",
};

const dateStrongStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
};

const dateSmallStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: "#707070",
  fontWeight: 500,
};

const dateArrowWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  color: "#d1d5db",
};

const datesBottomStyle: CSSProperties = {
  textAlign: "center",
};

const datesBottomTextStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#707070",
};

const mobileCancelBookingStyle: CSSProperties = {
  width: "100%",
  padding: "16px 16px 20px",
  color: "#707070",
  fontWeight: 700,
  fontSize: 15,
  borderRadius: 8,
  border: "1px solid #707070",
  background: "#fff",
  cursor: "pointer",
};

const mobileStickyPaymentWrapStyle: CSSProperties = {
  padding: "12px 16px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const mobileStickyLabelStyle: CSSProperties = {
  fontSize: 12,
  color: "#707070",
  fontWeight: 700,
};

const mobileStickyValueStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#000",
};

const mobileStickyButtonStyle: CSSProperties = {
  background: "#D4A017",
  color: "#fff",
  padding: "14px 40px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  border: "none",
  cursor: "pointer",
};

const mobileStickyStatusWrapStyle: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
  background: "#fff",
  borderTop: "1px solid #f3f4f6",
  padding: "24px 16px",
  textAlign: "center",
  boxShadow: "0 -4px 20px rgba(0,0,0,0.03)",
};

const mobileStickyStatusTextStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
};
