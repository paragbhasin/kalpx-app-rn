import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Percent,
  Star,
  X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/ui";
import retreatImg from "../../../../mobile/assets/retreat/retreat1.jpg";

export function RetreatBookingPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [showSuccess, setShowSuccess] = useState(false);
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const retreat = useMemo(
    () => ({
      title: "Rejuvenating yoga & Ayurvedic Retreat",
      image: retreatImg,
    }),
    [],
  );

  const paidAmount = paymentType === "deposit" ? "1,000" : "9,430";

  const content = !isDesktop ? (
    <div style={mobilePageStyle}>
      <header style={mobileHeaderStyle}>
        <div style={mobileHeaderInnerStyle}>
          <button type="button" onClick={() => navigate(-1)} style={iconButtonStyle}>
            <ArrowLeft size={18} color="#000" />
          </button>
          <h1 style={mobileHeaderTitleStyle}>Booking Details</h1>
        </div>
      </header>

      <main style={mobileMainStyle}>
        <div style={summaryCardStyle}>
          <img src={retreat.image} style={summaryImageStyle} alt={retreat.title} />
          <div style={{ flex: 1 }}>
            <h2 style={summaryTitleStyle}>{retreat.title}</h2>
            <div style={ratingRowStyle}>
              <span style={ratingTextStyle}>4.9(223)</span>
              <Star size={12} color="#D4A017" fill="#D4A017" />
            </div>
          </div>
        </div>

        <InfoCard title="Free Cancellation">
          <BulletRow text="Free Cancellation before start of 30 days" />
          <BulletRow text="20% Deducted if cancelled after 30 days" />
        </InfoCard>

        <div style={detailCardStyle}>
          <div style={detailBlockStyle}>
            <span style={capsLabelStyle}>Guest</span>
            <p style={detailValueStyle}>1 Person</p>
          </div>
          <div style={detailDividerStyle} />
          <div style={detailBlockStyle}>
            <span style={capsLabelStyle}>Dates</span>
            <p style={detailValueStyle}>From 22 Dec - 24 Dec 2025 ( 3 Days/ 2 Nights)</p>
          </div>
        </div>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>All Coupons</h3>
          <div style={{ marginTop: 12 }}>
            <div style={rowBetweenStyle}>
              <div style={subheadStyle}>Coupon & bank offer</div>
              <div style={mutedSmallStyle}>View all</div>
            </div>
            <div style={couponCardStyle}>
              <div style={couponTitleStyle}>
                <Percent size={16} color="#000" />
                Extra 91.65 off
              </div>
              <div style={couponBodyStyle}>On minimum spend of 100. T & C</div>
              <div style={appliedTextStyle}>Applied</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={subheadStyle}>Price Details</div>
              <div style={miniPriceCardStyle}>
                <PriceRow label="Total MRP" value="₹2,500" />
                <PriceRow label="Discount" value="-₹91.65" valueColor="#16a34a" />
                <PriceRow label="Delivery Charges" value="Free" />
                <hr style={miniHrStyle} />
                <PriceRow label="Total Amount" value="₹2,408.35" strong />
              </div>
            </div>
            <button type="button" style={primaryButtonStyle} onClick={() => setShowSuccess(true)}>
              Buy Now
            </button>
          </div>
        </section>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Price Breakdown</h3>
          <div style={breakdownCardStyle}>
            <div style={breakdownBodyStyle}>
              <PriceRow label="Package Price" value="₹3,300" />
              <div style={{ display: "grid", gap: 12 }}>
                <span style={rowLabelStyle}>Add Ons</span>
                <AddonRow label="Airport Pickup" value="₹4000/-" />
                <AddonRow label="Gluten Free Meal" value="₹2000/-" />
              </div>
              <PriceRow label="Taxes" value="₹330/-" />
              <PriceRow label="Total Discount" value="-₹200/-" valueColor="#E4405F" />
            </div>
            <div style={breakdownFooterStyle}>
              <span style={breakdownFooterLabelStyle}>Total Payment</span>
              <span style={breakdownFooterValueStyle}>₹9,430/-</span>
            </div>
          </div>
        </section>

        <FormSection title="Personal Information">
          <Field label="First Name" placeholder="Enter your first name" />
          <Field label="Last Name" placeholder="Enter your last name" />
          <Field label="Email Id" placeholder="Enter email -id" type="email" />
          <Field label="Mobile Number" placeholder="Enter your mobile number" type="tel" />
        </FormSection>

        <section style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Payment Option</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <PaymentOption
              title="Pay Deposit"
              value="1,000/-"
              body="Pay depsoit now and secure your seat. Then pay 2,300 in next 7 days"
              active={paymentType === "deposit"}
              onClick={() => setPaymentType("deposit")}
            />
            <PaymentOption
              title="Pay full amount now"
              value="3,300/-"
              body="Pay all amount today you will all set! No additional payment required"
              active={paymentType === "full"}
              onClick={() => setPaymentType("full")}
            />
          </div>
        </section>

        <FormSection title="Make Payment" white>
          <Field label="Card No." placeholder="Card number" icon={<CreditCard size={16} color="#9ca3af" />} />
          <Field label="Expiration Date" placeholder="MM/YY" />
          <Field label="Security Date" placeholder="CVC" />
          <div style={fieldWrapStyle}>
            <label style={fieldLabelStyle}>Country</label>
            <div style={selectWrapStyle}>
              <select style={selectStyle} defaultValue="India">
                <option>India</option>
              </select>
              <ChevronDown size={10} color="#9ca3af" style={selectIconStyle} />
            </div>
          </div>
        </FormSection>

        <button type="button" onClick={() => setShowSuccess(true)} style={primaryPayButtonStyle}>
          Make Payment
        </button>
      </main>
    </div>
  ) : (
    <div style={desktopPageStyle}>
      <main style={desktopMainStyle}>
        <div style={desktopGridStyle}>
          <div style={desktopLeftStyle}>
            <div style={desktopBackRowStyle}>
              <button type="button" onClick={() => navigate(-1)} style={desktopBackButtonStyle}>
                <ArrowLeft size={24} color="#000" />
              </button>
              <h1 style={desktopPageTitleStyle}>Beginner Friendly Package</h1>
            </div>

            <div style={desktopSectionGapStyle}>
              <div style={desktopImageWrapStyle}>
                <img src={retreat.image} style={desktopHeroImageStyle} alt={retreat.title} />
              </div>
              <div style={desktopTitleRatingRowStyle}>
                <h2 style={desktopRetreatTitleStyle}>{retreat.title}</h2>
                <div style={desktopRatingStyle}>
                  <span style={desktopRatingBoldStyle}>4.9</span>
                  <span style={desktopRatingMutedStyle}>(223)</span>
                  <Star size={14} color="#D4A017" fill="#D4A017" />
                </div>
              </div>

              <div style={desktopPolicyBlockStyle}>
                <h4 style={desktopMiniHeadingStyle}>Cancellation Policies</h4>
                <div style={{ display: "grid", gap: 8 }}>
                  <PolicyCheck text="Free Cancellation before start of 30 days" />
                  <PolicyCheck text="20% Deducted if cancelled after 30 days" />
                </div>
              </div>
            </div>

            <div style={desktopDetailsStripStyle}>
              <div style={desktopDetailColStyle}>
                <span style={capsLabelStyle}>Guest</span>
                <span style={desktopDetailStrongStyle}>1 Person</span>
              </div>
              <div style={desktopDetailDividerStyle} />
              <div style={desktopDetailColStyle}>
                <span style={capsLabelStyle}>Dates</span>
                <span style={desktopDetailStrongStyle}>From 22 Dec - 24 Dec 2025 ( 3 Days/ 2 Nights)</span>
              </div>
            </div>

            <section style={desktopSectionGapStyle}>
              <h3 style={desktopSectionTitleStyle}>All Coupons</h3>
              <div style={desktopCouponCardStyle}>
                <div style={desktopCouponInnerStyle}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={desktopCouponCodeRowStyle}>
                      <Percent size={18} color="#000" />
                      <span style={desktopCouponCodeStyle}>FVCT</span>
                    </div>
                    <p style={desktopCouponDescStyle}>10% OFF for First Visitor from 21 dec to 24 dec</p>
                    <button type="button" style={desktopAppliedButtonStyle}>Applied</button>
                  </div>
                  <span style={desktopCouponAmountStyle}>-₹200</span>
                </div>
              </div>
            </section>

            <section style={desktopSectionGapStyle}>
              <h3 style={desktopSectionTitleStyle}>Price Breakdown</h3>
              <div style={breakdownCardStyle}>
                <div style={breakdownBodyStyle}>
                  <PriceRow label="Package Price" value="₹3,300" />
                  <div style={{ display: "grid", gap: 16 }}>
                    <span style={desktopMiniHeadingStyle}>Add Ons</span>
                    <div style={{ display: "grid", gap: 12, paddingLeft: 8 }}>
                      <AddonRow label="Airport Pickup" value="₹4000/-" />
                      <AddonRow label="Gluten Free Meal" value="₹2000/-" />
                    </div>
                  </div>
                  <PriceRow label="Taxes" value="₹330/-" />
                  <PriceRow label="Total Discount" value="-₹200/-" />
                </div>
                <div style={desktopBreakdownFooterStyle}>
                  <span style={breakdownFooterLabelStyle}>Total Payment</span>
                  <span style={breakdownFooterValueStyle}>₹9,430/-</span>
                </div>
              </div>
            </section>

            <section style={{ ...desktopSectionGapStyle, paddingTop: 16 }}>
              <h3 style={desktopSectionTitleStyle}>Payment Option</h3>
              <div style={desktopPaymentGridStyle}>
                <PaymentOption
                  title="Pay Deposit"
                  value="1,000/-"
                  body="Pay deposit now and secure your seat. Then pay 2,300 in next 7 days"
                  active={paymentType === "deposit"}
                  onClick={() => setPaymentType("deposit")}
                  desktop
                />
                <PaymentOption
                  title="Pay full amount now"
                  value="₹9,430/-"
                  body="Pay all amount today you will all set! No additional payment required"
                  active={paymentType === "full"}
                  onClick={() => setPaymentType("full")}
                  desktop
                />
              </div>
            </section>
          </div>

          <div style={desktopRightStyle}>
            <FormSection title="Personal Information" desktop>
              <div style={desktopFormGridStyle}>
                <Field label="First Name" placeholder="Enter your first name" />
                <Field label="Last Name" placeholder="Enter your last name" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Email Id" placeholder="Enter your E-mail ID" type="email" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Mobile Number" placeholder="Enter your mobile number" type="tel" />
                </div>
              </div>
            </FormSection>

            <section style={desktopFormSectionStyle}>
              <h3 style={desktopSectionTitleStyle}>Make Payment</h3>
              <div style={desktopPaymentCardStyle}>
                <Field label="Card No." placeholder="Card number" icon={<CreditCard size={16} color="#9ca3af" />} />
                <Field label="Expiration Date" placeholder="MM/YY" />
                <Field label="Security Code" placeholder="CVC" />
                <div style={fieldWrapStyle}>
                  <label style={fieldLabelStyle}>Country</label>
                  <div style={selectWrapStyle}>
                    <select style={selectStyle} defaultValue="India">
                      <option>Select country</option>
                      <option>India</option>
                    </select>
                    <ChevronDown size={10} color="#9ca3af" style={selectIconStyle} />
                  </div>
                </div>
                <button type="button" onClick={() => setShowSuccess(true)} style={desktopPayNowStyle}>
                  Pay Now
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <AppShell>
      {content}
      {showSuccess ? (
        <div style={modalOverlayStyle} onClick={() => setShowSuccess(false)}>
          <div style={successModalStyle} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setShowSuccess(false)} style={modalCloseStyle}>
              <X size={20} color="#9ca3af" />
            </button>
            <div style={successIconWrapStyle}>
              <Check size={36} color="#fff" />
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <h2 style={successTitleStyle}>Congratulations!</h2>
              <p style={successAmountStyle}>₹{paidAmount}/-</p>
              <p style={successBodyTitleStyle}>You have successfully paid</p>
            </div>
            {paymentType === "deposit" ? (
              <div style={successInfoCardStyle}>
                <p style={successInfoLineStyle}>
                  Next Payment Due : <span style={successInfoMutedStyle}>27 Dec 2026</span>
                </p>
                <p style={successInfoLineStyle}>
                  Total Payment Left : <span style={successInfoAccentStyle}>₹8,430/-</span>
                </p>
                <p style={successReminderStyle}>We will send you reminder 3 day before the due date</p>
              </div>
            ) : null}
            <p style={successFooterStyle}>Confirmation mail has sent you please check your mail</p>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={infoCardStyle}>
      <h3 style={sectionTitleStyle}>{title}</h3>
      <div style={{ display: "grid", gap: 8 }}>{children}</div>
    </div>
  );
}

function BulletRow({ text }: { text: string }) {
  return (
    <div style={bulletRowStyle}>
      <span style={bulletStyle}>•</span>
      <span style={bulletTextStyle}>{text}</span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
  valueColor,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
}) {
  return (
    <div style={rowBetweenStyle}>
      <div style={strong ? priceStrongLabelStyle : priceLabelStyle}>{label}</div>
      <div style={{ ...(strong ? priceStrongValueStyle : priceValueStyle), color: valueColor ?? "#000" }}>
        {value}
      </div>
    </div>
  );
}

function AddonRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={rowBetweenStyle}>
      <div style={addonLeftStyle}>
        <div style={addonCheckStyle}>
          <Check size={8} color="#fff" />
        </div>
        <span style={addonTextStyle}>{label}</span>
      </div>
      <span style={addonValueStyle}>{value}</span>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: ReactNode;
}) {
  return (
    <div style={fieldWrapStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <div style={icon ? inputIconWrapStyle : undefined}>
        <input type={type} placeholder={placeholder} style={inputStyle} />
        {icon ? <div style={inputIconStyle}>{icon}</div> : null}
      </div>
    </div>
  );
}

function FormSection({
  title,
  children,
  white = false,
  desktop = false,
}: {
  title: string;
  children: ReactNode;
  white?: boolean;
  desktop?: boolean;
}) {
  return (
    <section style={desktop ? desktopFormSectionStyle : sectionStyle}>
      <h3 style={desktop ? desktopSectionTitleStyle : sectionTitleStyle}>{title}</h3>
      <div
        style={{
          ...formShellStyle,
          background: white || desktop ? "#fff" : "rgba(249,250,251,0.5)",
          padding: desktop ? 16 : 20,
          borderRadius: desktop ? 0 : 16,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function PaymentOption({
  title,
  value,
  body,
  active,
  onClick,
  desktop = false,
}: {
  title: string;
  value: string;
  body: string;
  active: boolean;
  onClick: () => void;
  desktop?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...paymentOptionStyle,
        borderColor: active ? "#D4A017" : "#f3f4f6",
        boxShadow: active && desktop ? "0 0 0 4px rgba(212,160,23,0.05)" : "none",
      }}
    >
      <div style={paymentTopStyle}>
        <div style={paymentTitleWrapStyle}>
          <div
            style={{
              ...paymentRadioStyle,
              borderColor: active ? "#D4A017" : "#d1d5db",
            }}
          >
            {active ? <div style={paymentRadioDotStyle} /> : null}
          </div>
          <span style={desktop ? paymentTitleDesktopStyle : paymentTitleStyle}>{title}</span>
        </div>
        <span style={desktop ? paymentValueDesktopStyle : paymentValueStyle}>{value}</span>
      </div>
      <p style={paymentBodyStyle}>{body}</p>
    </button>
  );
}

function PolicyCheck({ text }: { text: string }) {
  return (
    <div style={policyRowStyle}>
      <Check size={12} color="#38d0ee" />
      <span style={policyTextStyle}>{text}</span>
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
  background: "rgba(253,252,249,0.8)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid #f3f4f6",
};

const mobileHeaderInnerStyle: CSSProperties = {
  maxWidth: 672,
  margin: "0 auto",
  padding: "0 16px",
  height: 64,
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const iconButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const mobileHeaderTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const mobileMainStyle: CSSProperties = {
  maxWidth: 672,
  margin: "0 auto",
  padding: 16,
  display: "grid",
  gap: 24,
  paddingBottom: 40,
};

const summaryCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  border: "1px solid #f9fafb",
  display: "flex",
  gap: 16,
};

const summaryImageStyle: CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: 12,
  objectFit: "cover",
};

const summaryTitleStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.3,
};

const ratingRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 4,
};

const ratingTextStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#4b5563",
};

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const infoCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  border: "1px solid #f9fafb",
  display: "grid",
  gap: 12,
};

const bulletRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "flex-start",
};

const bulletStyle: CSSProperties = {
  color: "#000",
  marginTop: 2,
};

const bulletTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.5,
};

const detailCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  border: "1px solid #f9fafb",
};

const detailBlockStyle: CSSProperties = {
  display: "grid",
  gap: 4,
};

const capsLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#707070",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const detailValueStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
};

const detailDividerStyle: CSSProperties = {
  borderTop: "1px solid #f9fafb",
  margin: "16px 0",
};

const rowBetweenStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const subheadStyle: CSSProperties = {
  fontSize: 15,
  color: "#000",
  fontWeight: 600,
};

const mutedSmallStyle: CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
};

const couponCardStyle: CSSProperties = {
  background: "#f8f8f8",
  border: "1px solid #dbd9d9",
  padding: 12,
  borderRadius: 6,
  marginTop: 12,
  display: "grid",
  gap: 6,
};

const couponTitleStyle: CSSProperties = {
  fontSize: 15,
  color: "#000",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const couponBodyStyle: CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
};

const appliedTextStyle: CSSProperties = {
  fontSize: 15,
  color: "#1877F2",
};

const miniPriceCardStyle: CSSProperties = {
  background: "#f8f8f8",
  padding: 12,
  borderRadius: 6,
  marginTop: 12,
  display: "grid",
  gap: 8,
};

const miniHrStyle: CSSProperties = {
  margin: "8px 0",
  border: 0,
  borderTop: "1px solid #d1d5db",
};

const primaryButtonStyle: CSSProperties = {
  width: "100%",
  background: "#D4A017",
  color: "#fff",
  border: "none",
  padding: "12px 16px",
  borderRadius: 6,
  marginTop: 16,
  fontWeight: 600,
  cursor: "pointer",
};

const breakdownCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  border: "1px solid #f9fafb",
};

const breakdownBodyStyle: CSSProperties = {
  padding: 20,
  display: "grid",
  gap: 16,
};

const breakdownFooterStyle: CSSProperties = {
  background: "#FFF9E5",
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "1px solid #F1EAD9",
};

const breakdownFooterLabelStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const breakdownFooterValueStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const priceLabelStyle: CSSProperties = {
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
};

const priceValueStyle: CSSProperties = {
  fontSize: 15,
  color: "#000",
  fontWeight: 700,
};

const priceStrongLabelStyle: CSSProperties = {
  fontSize: 14,
  color: "#000",
  fontWeight: 600,
};

const priceStrongValueStyle: CSSProperties = {
  fontSize: 14,
  color: "#000",
  fontWeight: 600,
};

const rowLabelStyle: CSSProperties = {
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  display: "block",
};

const addonLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const addonCheckStyle: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 2,
  background: "#D4A017",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
};

const addonTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const addonValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
};

const formShellStyle: CSSProperties = {
  border: "1px solid #f3f4f6",
  display: "grid",
  gap: 16,
};

const fieldWrapStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#707070",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #f3f4f6",
  background: "#fff",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const inputIconWrapStyle: CSSProperties = {
  position: "relative",
};

const inputIconStyle: CSSProperties = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
};

const selectWrapStyle: CSSProperties = {
  position: "relative",
};

const selectStyle: CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #f3f4f6",
  background: "#fff",
  outline: "none",
  fontSize: 14,
  appearance: "none",
  boxSizing: "border-box",
};

const selectIconStyle: CSSProperties = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
};

const primaryPayButtonStyle: CSSProperties = {
  width: "100%",
  padding: "16px",
  background: "#D4A017",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 16,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  cursor: "pointer",
};

const paymentOptionStyle: CSSProperties = {
  position: "relative",
  display: "block",
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #f9fafb",
  cursor: "pointer",
  textAlign: "left",
};

const paymentTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 8,
};

const paymentTitleWrapStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const paymentRadioStyle: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "2px solid #d1d5db",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const paymentRadioDotStyle: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#D4A017",
};

const paymentTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#000",
};

const paymentTitleDesktopStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 800,
  color: "#000",
};

const paymentValueStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#D4A017",
};

const paymentValueDesktopStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "#D4A017",
};

const paymentBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.6,
  paddingLeft: 32,
};

const desktopPageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
};

const desktopMainStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "20px 0",
};

const desktopGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "7fr 5fr",
  gap: 32,
};

const desktopLeftStyle: CSSProperties = {
  display: "grid",
  gap: 24,
};

const desktopRightStyle: CSSProperties = {
  display: "grid",
  gap: 48,
  alignContent: "start",
  position: "sticky",
  top: 48,
  height: "fit-content",
};

const desktopBackRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const desktopBackButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#000",
};

const desktopPageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 800,
  color: "#000",
};

const desktopSectionGapStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const desktopImageWrapStyle: CSSProperties = {
  overflow: "hidden",
  border: "1px solid #f3f4f6",
  background: "#fff",
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
};

const desktopHeroImageStyle: CSSProperties = {
  width: "100%",
  height: 300,
  objectFit: "cover",
  display: "block",
};

const desktopTitleRatingRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const desktopRetreatTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const desktopRatingStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  paddingTop: 4,
};

const desktopRatingBoldStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: "#000",
};

const desktopRatingMutedStyle: CSSProperties = {
  fontSize: 16,
  color: "#707070",
  fontWeight: 500,
};

const desktopPolicyBlockStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const desktopMiniHeadingStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#000",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const policyRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const policyTextStyle: CSSProperties = {
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const desktopDetailsStripStyle: CSSProperties = {
  borderTop: "1px solid #f3f4f6",
  borderBottom: "1px solid #f3f4f6",
  padding: "8px 0",
  display: "grid",
};

const desktopDetailColStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  padding: "16px 0",
};

const desktopDetailStrongStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: "#000",
};

const desktopDetailDividerStyle: CSSProperties = {
  borderTop: "1px solid #f3f4f6",
};

const desktopSectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const desktopCouponCardStyle: CSSProperties = {
  background: "#F8F8F8",
  border: "1px solid #f3f4f6",
  borderRadius: 12,
  padding: 12,
  overflow: "hidden",
};

const desktopCouponInnerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const desktopCouponCodeRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const desktopCouponCodeStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#000",
};

const desktopCouponDescStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const desktopAppliedButtonStyle: CSSProperties = {
  color: "#1877F2",
  fontWeight: 800,
  fontSize: 15,
  background: "transparent",
  border: "none",
  padding: "4px 0 0",
  textAlign: "left",
  cursor: "pointer",
};

const desktopCouponAmountStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#000",
};

const desktopBreakdownFooterStyle: CSSProperties = {
  background: "#FCF5E8",
  padding: "20px 32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "1px solid #F1EAD9",
};

const desktopPaymentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
};

const desktopFormSectionStyle: CSSProperties = {
  display: "grid",
  gap: 24,
};

const desktopFormGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
};

const desktopPaymentCardStyle: CSSProperties = {
  background: "#fff",
  padding: 32,
  borderRadius: 24,
  border: "1px solid #f3f4f6",
  boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
  display: "grid",
  gap: 24,
};

const desktopPayNowStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "#D4A017",
  color: "#fff",
  borderRadius: 12,
  border: "none",
  fontSize: 18,
  fontWeight: 800,
  boxShadow: "0 16px 28px rgba(212,160,23,0.3)",
  cursor: "pointer",
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(6px)",
};

const successModalStyle: CSSProperties = {
  position: "relative",
  background: "#fff",
  borderRadius: 40,
  padding: 32,
  width: "100%",
  maxWidth: 520,
  textAlign: "center",
  display: "grid",
  gap: 24,
};

const modalCloseStyle: CSSProperties = {
  position: "absolute",
  top: 24,
  right: 24,
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const successIconWrapStyle: CSSProperties = {
  width: 96,
  height: 96,
  background: "#43BC6C",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  boxShadow: "0 16px 32px rgba(67,188,108,0.2)",
  border: "8px solid #E8F8EE",
};

const successTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#000",
};

const successAmountStyle: CSSProperties = {
  margin: 0,
  fontSize: 44,
  fontWeight: 800,
  color: "#43BC6C",
  lineHeight: 1,
};

const successBodyTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#333",
};

const successInfoCardStyle: CSSProperties = {
  background: "#FFF9E5",
  borderRadius: 16,
  padding: 16,
  textAlign: "left",
  display: "grid",
  gap: 8,
  border: "1px solid #F1EAD9",
};

const successInfoLineStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 800,
  color: "#000",
};

const successInfoMutedStyle: CSSProperties = {
  color: "#707070",
  fontWeight: 700,
};

const successInfoAccentStyle: CSSProperties = {
  color: "#D4A017",
};

const successReminderStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
};

const successFooterStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#707070",
  lineHeight: 1.6,
  maxWidth: 300,
  justifySelf: "center",
};
