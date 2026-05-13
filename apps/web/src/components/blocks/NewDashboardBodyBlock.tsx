import { Navigate } from "react-router-dom";

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function NewDashboardBodyBlock(_props: Props) {
  return <Navigate to="/en/mitra/inner-path" replace />;
}
