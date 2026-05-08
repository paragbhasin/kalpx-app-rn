import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJourneyStatus } from "../../hooks/useJourneyStatus";

export default function InnerPathStubPage() {
  const navigate = useNavigate();
  const { loading, hasActiveJourney } = useJourneyStatus();

  useEffect(() => {
    if (loading) return;
    if (hasActiveJourney) {
      navigate("/en/mitra/dashboard", { replace: true });
    } else {
      navigate("/en/mitra/onboarding", { replace: true });
    }
  }, [loading, hasActiveJourney, navigate]);

  return null;
}
